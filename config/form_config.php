<?php
// form_config.php - Place this file outside your web root (../config/form_config.php)

return [
    // Email configuration
    'contact_email' => 'info@lefferts.com',
    'from_email' => 'site-info@lefferts.com',

    // Turnstile CAPTCHA configuration
    'turnstile_secret' => '0x4AAAAAABnGYtiTkDJKVBmOOTO3fKRvsDM',

    // File storage configuration (outside web root for security)
    'data_dir' => '../data',

    // Rate limiting configuration
    'max_requests_per_hour' => 10,

    // Validation limits
    'max_message_length' => 5000,
    'max_name_length' => 50,

    // Security settings
    'log_submissions' => true,
    'max_stored_contacts' => 1000,

    // Email security
    'allowed_domains' => '', // Empty = allow all

    // ADD THIS: SMTP configuration for better email delivery
    'smtp' => [
        'use_smtp' => true, // Set to false to use regular mail() function
        'host' => 'smtp.dreamhost.com',
        'port' => 587,
        'security' => 'tls',
        'username' => 'site-info@lefferts.com',
        'password' => 'YOUR_EMAIL_PASSWORD_HERE', // Replace with actual password!
        'from_name' => 'Lefferts Website'
    ]
];
?>