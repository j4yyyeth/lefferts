<?php
// Enhanced error logging and debugging
ini_set('log_errors', 1);
ini_set('error_log', 'form_errors.log');
error_reporting(E_ALL);

// Log all incoming requests for debugging
error_log("=== NEW REQUEST ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . print_r(getallheaders(), true));
error_log("Raw input: " . file_get_contents('php://input'));

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
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

error_log("Parsed input: " . print_r($input, true));

$form_type = $input['form_type'] ?? '';
error_log("Form type: " . $form_type);

// Email settings
$contact_email = 'info@lefferts.com';
$from_email = 'info@lefferts.dreamhosters.com';

// Function to send email with better error handling
function send_email_with_logging($to, $subject, $message, $headers)
{
    error_log("Attempting to send email:");
    error_log("To: " . $to);
    error_log("Subject: " . $subject);
    error_log("Headers: " . $headers);
    error_log("Message preview: " . substr($message, 0, 200) . "...");

    // Clear any previous errors
    error_clear_last();

    $result = mail($to, $subject, $message, $headers);

    // Log the result
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

if ($form_type === 'newsletter') {
    error_log("Processing newsletter form");

    $name = isset($input['name']) ? trim($input['name']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';

    // Better validation
    if (empty($name)) {
        error_log("Newsletter: Name is empty");
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        exit;
    }

    if (empty($email)) {
        error_log("Newsletter: Email is empty");
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Newsletter: Invalid email format: " . $email);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Sanitize after validation
    $name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);

    error_log("Newsletter validated data - Name: $name, Email: $email");

    // Save to JSON file - SIMPLIFIED version with only name and email
    $newsletter_file = 'data/newsletter-subscriptions.json';

    try {
        // Create data directory if it doesn't exist
        if (!file_exists('data')) {
            if (!mkdir('data', 0755, true)) {
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

        // Add new subscription - ONLY name and email
        $subscription = [
            'name' => $name,
            'email' => $email
        ];

        $subscriptions[] = $subscription;

        // Save to file
        if (file_put_contents($newsletter_file, json_encode($subscriptions, JSON_PRETTY_PRINT)) === false) {
            error_log("Failed to save newsletter subscription to file");
            throw new Exception("Could not save subscription");
        }

        error_log("Newsletter subscription saved to file successfully - Name: $name, Email: $email");

        // Always return success if we saved to JSON file (no email sending for newsletter)
        echo json_encode(['success' => true, 'message' => 'Thank you for subscribing!']);
    } catch (Exception $e) {
        error_log("Newsletter file error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save subscription. Please try again.']);
    }
} elseif ($form_type === 'contact') {
    error_log("Processing contact form");

    $firstName = isset($input['firstName']) ? trim($input['firstName']) : '';
    $lastName = isset($input['lastName']) ? trim($input['lastName']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';
    $user_message = isset($input['message']) ? trim($input['message']) : '';

    error_log("Contact raw data - First: '$firstName', Last: '$lastName', Email: '$email', Message length: " . strlen($user_message));

    // Better validation
    if (empty($firstName)) {
        error_log("Contact: First name is empty");
        http_response_code(400);
        echo json_encode(['error' => 'First name is required']);
        exit;
    }

    if (empty($lastName)) {
        error_log("Contact: Last name is empty");
        http_response_code(400);
        echo json_encode(['error' => 'Last name is required']);
        exit;
    }

    if (empty($email)) {
        error_log("Contact: Email is empty");
        http_response_code(400);
        echo json_encode(['error' => 'Email is required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        error_log("Contact: Invalid email format: " . $email);
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }

    // Sanitize after validation
    $firstName = htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8');
    $lastName = htmlspecialchars($lastName, ENT_QUOTES, 'UTF-8');
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    $user_message = htmlspecialchars($user_message, ENT_QUOTES, 'UTF-8');

    error_log("Contact validated data - Name: '$firstName $lastName', Email: '$email'");

    // Create comprehensive email
    $subject = 'Website Contact: ' . $firstName . ' ' . $lastName;
    $message = "New contact form submission from lefferts.com:\n\n";
    $message .= "=== CONTACT DETAILS ===\n";
    $message .= "Name: $firstName $lastName\n";
    $message .= "Email: $email\n";
    $message .= "Date: " . date('F j, Y') . "\n";
    $message .= "\n=== MESSAGE ===\n";
    $message .= (!empty($user_message) ? $user_message : "(No message provided)") . "\n";

    // Enhanced headers for better deliverability
    $headers = "From: $from_email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Return-Path: $from_email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "X-Priority: 1\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "MIME-Version: 1.0\r\n";

    error_log("CONTACT FORM: About to send email to $contact_email");
    error_log("CONTACT FORM: Subject: $subject");
    error_log("CONTACT FORM: From email: $from_email");

    if (send_email_with_logging($contact_email, $subject, $message, $headers)) {
        error_log("CONTACT FORM: Email sent successfully to $contact_email");
        echo json_encode(['success' => true, 'message' => 'Thank you for your message! We will get back to you soon.']);
    } else {
        error_log("CONTACT FORM: Email failed to send to $contact_email");
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send your message. Please try again or contact us directly.']);
    }
} else {
    error_log("Invalid form type received: '$form_type'");
    http_response_code(400);
    echo json_encode(['error' => 'Invalid form type: ' . $form_type]);
}

error_log("=== REQUEST COMPLETED ===\n");
