<?php
// Enhanced error logging and debugging
ini_set('log_errors', 1);
ini_set('error_log', '../logs/form_errors.log'); // Move logs outside web root
error_reporting(E_ALL);

// Load configuration securely
function load_config()
{
    return [
        'contact_email' => 'info@lefferts.com',
        'from_email' => 'site-info@lefferts.com',
        'turnstile_secret' => '0x4AAAAAABnGYtiTkDJKVBmOOTO3fKRvsDM',
        'data_dir' => '../data/',
        'max_requests_per_hour' => 10,
        'max_message_length' => 5000,
        'max_name_length' => 50
    ];
}

$config = load_config();

error_log("=== NEW REQUEST ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown')); // LOOK HERE
error_log("User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Invalid method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

function check_rate_limit($ip, $config)
{
    $rate_file = $config['data_dir'] . 'rate_limits.json';
    $max_requests = $config['max_requests_per_hour'];
    $time_window = 3600;


    if (!file_exists($config['data_dir'])) {
        if (!mkdir($config['data_dir'], 0755, true)) {
            error_log("Failed to create data directory");
            return false;
        }
    }

    $rates = [];
    if (file_exists($rate_file)) {
        $content = file_get_contents($rate_file);
        if ($content !== false) {
            $rates = json_decode($content, true) ?: [];
        }
    }

    $now = time();
    $user_requests = $rates[$ip] ?? [];

    // Clean old requests
    $user_requests = array_filter($user_requests, function ($time) use ($now, $time_window) {
        return ($now - $time) < $time_window;
    });

    if (count($user_requests) >= $max_requests) {
        error_log("Rate limit exceeded for IP: $ip");
        return false;
    }

    // Add current request
    $user_requests[] = $now;
    $rates[$ip] = array_values($user_requests); // Re-index array

    // Clean up old IPs to prevent file bloat
    foreach ($rates as $stored_ip => $requests) {
        $rates[$stored_ip] = array_filter($requests, function ($time) use ($now, $time_window) {
            return ($now - $time) < $time_window;
        });

        if (empty($rates[$stored_ip])) {
            unset($rates[$stored_ip]);
        }
    }

    file_put_contents($rate_file, json_encode($rates));
    return true;
}

// Verify Turnstile CAPTCHA
function verify_turnstile($token, $secret)
{
    if (empty($token) || empty($secret)) {
        error_log("Turnstile: Missing token or secret");
        return false;
    }

    $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    $data = [
        'secret' => $secret,
        'response' => $token,
        'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
    ];

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/x-www-form-urlencoded',
            'content' => http_build_query($data),
            'timeout' => 10
        ]
    ]);

    $result = file_get_contents($url, false, $context);
    if ($result === false) {
        error_log("Turnstile: Failed to connect to verification server");
        return false;
    }

    $response = json_decode($result, true);
    $success = $response['success'] ?? false;

    if (!$success) {
        error_log("Turnstile verification failed: " . json_encode($response));
    } else {
        error_log("Turnstile verification successful");
    }

    return $success;
}

// Enhanced validation functions
function validate_name($name, $max_length = 50)
{
    return !empty($name) &&
        strlen($name) <= $max_length &&
        preg_match('/^[a-zA-Z\s\-\'\.]+$/u', trim($name));
}

function validate_email($email)
{
    $email = trim($email);
    return filter_var($email, FILTER_VALIDATE_EMAIL) &&
        strlen($email) <= 254 &&
        !preg_match('/[<>\r\n]/', $email) && // Prevent injection
        !empty($email);
}

function validate_message($message, $max_length = 5000)
{
    return strlen($message) <= $max_length;
}

function clean_email_header($input)
{
    return preg_replace('/[\r\n\t]+/', ' ', trim($input));
}

function sanitize_input($input)
{
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Enhanced email function with better headers for Outlook
function send_email_with_logging($to, $subject, $message, $headers) 
{
    error_log("Attempting to send email:");
    error_log("To: " . $to);
    error_log("Subject: " . $subject);

    // Clear any previous errors
    error_clear_last();

    $result = mail($to, $subject, $message, $headers);

    if ($result) {
        error_log("Mail function returned TRUE");
    } else {
        error_log("Mail function returned FALSE");
        $last_error = error_get_last();
        if ($last_error) {
            error_log("Last error: " . print_r($last_error, true));
        }
    }

    return $result;
}

// Check rate limit first
$user_ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (!check_rate_limit($user_ip, $config)) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please try again in an hour.']);
    exit;
}

// Get and validate input
$raw_input = file_get_contents('php://input');
if (empty($raw_input)) {
    error_log("Empty input received");
    http_response_code(400);
    echo json_encode(['error' => 'No data received']);
    exit;
}

$input = json_decode($raw_input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("JSON decode error: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

$form_type = $input['form_type'] ?? '';
error_log("Form type: " . $form_type);

// Verify Turnstile for contact forms
if ($form_type === 'contact') {
    $turnstile_token = $input['cf-turnstile-response'] ?? '';
    if (!verify_turnstile($turnstile_token, $config['turnstile_secret'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Security verification failed. Please try again.']);
        exit;
    }
}

if ($form_type === 'newsletter') {
    error_log("Processing newsletter form");

    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';

    // Validate inputs
    if (!validate_name($name, $config['max_name_length'])) {
        error_log("Newsletter: Invalid name: " . $name);
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid name (letters, spaces, hyphens, apostrophes only)']);
        exit;
    }

    if (!validate_email($email)) {
        error_log("Newsletter: Invalid email: " . $email);
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid email address']);
        exit;
    }

    // Sanitize after validation
    $name = sanitize_input($name);
    $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);

    error_log("Newsletter validated data - Name: $name, Email: $email");

    // Save to JSON file
    $newsletter_file = $config['data_dir'] . 'newsletter-subscriptions.json';

    try {
        // Create data directory if it doesn't exist
        if (!file_exists($config['data_dir'])) {
            if (!mkdir($config['data_dir'], 0755, true)) {
                error_log("Failed to create data directory");
                throw new Exception("Could not create data directory");
            }
            error_log("Created data directory");
        }

        // Read existing subscriptions
        $subscriptions = [];
        if (file_exists($newsletter_file)) {
            $content = file_get_contents($newsletter_file);
            if ($content !== false) {
                $subscriptions = json_decode($content, true) ?: [];
            }
        }

        // Check for duplicate email
        foreach ($subscriptions as $sub) {
            if (strtolower($sub['email']) === strtolower($email)) {
                error_log("Newsletter: Duplicate email attempt: " . $email);
                http_response_code(400);
                echo json_encode(['error' => 'This email is already subscribed.']);
                exit;
            }
        }

        // Add new subscription with timestamp
        $subscription = [
            'name' => $name,
            'email' => $email,
            'subscribed_at' => date('Y-m-d H:i:s')
        ];

        $subscriptions[] = $subscription;

        // Save to file with proper permissions
        if (file_put_contents($newsletter_file, json_encode($subscriptions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
            error_log("Failed to save newsletter subscription to file");
            throw new Exception("Could not save subscription");
        }

        // Set restrictive permissions
        chmod($newsletter_file, 0644);

        error_log("Newsletter subscription saved successfully - Name: $name, Email: $email");

        echo json_encode(['success' => true, 'message' => 'Thank you for subscribing!']);
    } catch (Exception $e) {
        error_log("Newsletter file error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save subscription. Please try again.']);
    }
} elseif ($form_type === 'contact') {
    error_log("Processing contact form");

    $firstName = $input['firstName'] ?? '';
    $lastName = $input['lastName'] ?? '';
    $email = $input['email'] ?? '';
    $user_message = $input['message'] ?? '';

    error_log("Contact raw data - First: '$firstName', Last: '$lastName', Email: '$email', Message length: " . strlen($user_message));

    // Validate all inputs
    if (!validate_name($firstName, $config['max_name_length'])) {
        error_log("Contact: Invalid first name: " . $firstName);
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid first name (letters, spaces, hyphens, apostrophes only)']);
        exit;
    }

    if (!validate_name($lastName, $config['max_name_length'])) {
        error_log("Contact: Invalid last name: " . $lastName);
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid last name (letters, spaces, hyphens, apostrophes only)']);
        exit;
    }

    if (!validate_email($email)) {
        error_log("Contact: Invalid email: " . $email);
        http_response_code(400);
        echo json_encode(['error' => 'Please enter a valid email address']);
        exit;
    }

    if (!validate_message($user_message, $config['max_message_length'])) {
        error_log("Contact: Message too long: " . strlen($user_message) . " characters");
        http_response_code(400);
        echo json_encode(['error' => 'Message is too long. Please limit to ' . $config['max_message_length'] . ' characters.']);
        exit;
    }

    // Sanitize after validation
    $firstName = sanitize_input($firstName);
    $lastName = sanitize_input($lastName);
    $email = filter_var(trim($email), FILTER_SANITIZE_EMAIL);
    $user_message = sanitize_input($user_message);

    // Clean headers to prevent injection
    $firstName = clean_email_header($firstName);
    $lastName = clean_email_header($lastName);
    $email = clean_email_header($email);

    error_log("Contact validated data - Name: '$firstName $lastName', Email: '$email'");

    // Save contact submission for record keeping
    $contact_file = $config['data_dir'] . 'contact-submissions.json';
    $contact_record = [
        'timestamp' => date('Y-m-d H:i:s'),
        'name' => $firstName . ' ' . $lastName,
        'email' => $email,
        'message' => $user_message,
        'ip' => $user_ip,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];

    try {
        // Read existing contacts
        $contacts = [];
        if (file_exists($contact_file)) {
            $content = file_get_contents($contact_file);
            if ($content !== false) {
                $contacts = json_decode($content, true) ?: [];
            }
        }

        $contacts[] = $contact_record;

        // Keep only last 1000 submissions to prevent file bloat
        if (count($contacts) > 1000) {
            $contacts = array_slice($contacts, -1000);
        }

        file_put_contents($contact_file, json_encode($contacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        chmod($contact_file, 0644);
    } catch (Exception $e) {
        error_log("Failed to save contact record: " . $e->getMessage());
        // Don't fail the form submission if record keeping fails
    }

    // Create comprehensive email
    $subject = 'Website Contact: ' . $firstName . ' ' . $lastName;
    $message = "New contact form submission from lefferts.com:\n\n";
    $message .= "=== CONTACT DETAILS ===\n";
    $message .= "Name: $firstName $lastName\n";
    $message .= "Email: $email\n";

    // Set timezone to EST and format date
    date_default_timezone_set('America/New_York');
    $message .= "Date: " . date('F j, Y \a\t g:i A') . "\n";

    $message .= "\n=== MESSAGE ===\n";
    $message .= (!empty($user_message) ? $user_message : "(No message provided)") . "\n";
    $message .= "\n=== SECURITY ===\n";
    $message .= "Verified: Yes\n";

    // Enhanced headers for better deliverability to Outlook
    $headers = "From: " . $config['from_email'] . "\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Return-Path: " . $config['from_email'] . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "X-Priority: 1\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "X-Originating-IP: $user_ip\r\n";
    $headers .= "Message-ID: <" . time() . "." . uniqid() . "@{$_SERVER['SERVER_NAME']}>\r\n";
    $headers .= "Date: " . date('r') . "\r\n";

    error_log("CONTACT FORM: About to send email to " . $config['contact_email']);

    if (send_email_with_logging($config['contact_email'], $subject, $message, $headers)) {
        error_log("CONTACT FORM: Email sent successfully");
        echo json_encode(['success' => true, 'message' => 'Thank you for your message! We will get back to you soon.']);
    } else {
        error_log("CONTACT FORM: Email failed to send");
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send your message. Please try again or contact us directly.']);
    }
} else {
    error_log("Invalid form type received: '$form_type'");
    http_response_code(400);
    echo json_encode(['error' => 'Invalid form type']);
}

error_log("=== REQUEST COMPLETED ===\n");
?>