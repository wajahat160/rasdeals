<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer (adjust path if needed)
require 'vendor/autoload.php'; // If using Composer
// Or, if manually downloaded, include:
// require 'phpmailer/src/Exception.php';
// require 'phpmailer/src/PHPMailer.php';
// require 'phpmailer/src/SMTP.php';

header('Access-Control-Allow-Origin: *'); // Allow CORS for testing
header('Content-Type: application/json');

// Error logging setup
$logFile = 'contact_errors.log';
function logError($message) {
    global $logFile;
    $date = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$date] $message\n", FILE_APPEND);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs
    $name = filter_var($_POST['name'] ?? '', FILTER_SANITIZE_STRING);
    $email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $country_code = filter_var($_POST['country_code'] ?? '', FILTER_SANITIZE_STRING);
    $phone = filter_var($_POST['phone'] ?? '', FILTER_SANITIZE_STRING);
    $tour = filter_var($_POST['tour'] ?? '', FILTER_SANITIZE_STRING);
    $person = filter_var($_POST['person'] ?? '', FILTER_SANITIZE_NUMBER_INT);
    $tourdate = filter_var($_POST['tourdate'] ?? '', FILTER_SANITIZE_STRING);

    // Validate inputs
    if (empty($name) || empty($email) || empty($country_code) || empty($phone) || empty($tour) || empty($person) || empty($tourdate)) {
        logError("Missing required fields: name=$name, email=$email, country_code=$country_code, phone=$phone, tour=$tour, person=$person, tourdate=$tourdate");
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        logError("Invalid email format: $email");
        echo json_encode(['status' => 'error', 'message' => 'Invalid email format']);
        exit;
    }

    // Initialize PHPMailer
    $mail = new PHPMailer(true);

    try {
        // SMTP configuration for Gmail
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'your-gmail-address@gmail.com'; // Replace with your Gmail address
        $mail->Password = 'your-app-password'; // Replace with your Gmail App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Email settings
        $mail->setFrom('noreply@rasdeals.com', 'RASDEALS Booking');
        $mail->addAddress('rasahraloqmanbooking@gmail.com'); // Recipient
        $mail->addReplyTo($email, $name);
        $mail->Subject = 'New Abu Dhabi Tour Booking';
        $mail->Body = "Name: $name\nEmail: $email\nPhone: $country_code $phone\nTour: $tour\nNumber of People: $person\nTour Date: $tourdate";

        // Send email
        $mail->send();
        echo "OK"; // Compatible with AJAX success response
    } catch (Exception $e) {
        $errorMessage = "Failed to send email: {$mail->ErrorInfo}";
        logError($errorMessage);
        echo json_encode(['status' => 'error', 'message' => $errorMessage]);
    }
} else {
    logError("Invalid request method: {$_SERVER['REQUEST_METHOD']}");
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>