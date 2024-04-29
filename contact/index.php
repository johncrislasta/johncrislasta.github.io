<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer.php';
require 'Exception.php';
require 'SMTP.php';


$mail = new PHPMailer;

//$mail->SMTPDebug = 3;                               // Enable verbose debug output

$mail->isSMTP();                                      // Set mailer to use SMTP
$mail->Host = 'smtp.zoho.com';                // Specify main and backup SMTP servers
$mail->SMTPAuth = true;                               // Enable SMTP authentication
$mail->Username = 'me@jcyl.work';        // SMTP username
$mail->Password = 'JCY6589Last@';                      // SMTP password                   // SMTP password
$mail->SMTPSecure = 'ssl';                            // Enable TLS encryption, `ssl` also accepted
$mail->Port = 465;                                     // TCP port to connect to

$mail->From = 'me@jcyl.work';
$mail->FromName = 'Contact Form';

// http://www.example.org/ajax.php
if (!isset($_SERVER['HTTP_ORIGIN']) && isset($_GET['test'])) {

	$mail->addAddress('atsalycj@gmail.com', 'John Cris');     // Add a recipient
	$mail->addAddress('me@jcyl.work', 'JCYLasta.xyz');     // Add a recipient

	$mail->isHTML(true);                                  // Set email format to HTML

	$mail->Subject = 'Testing SMTP from server';
	$mail->Body    = 'This is the HTML message body <b>in bold!</b>.<p>sent from sleeptight</p>';
	$mail->AltBody = 'This is the body in plain text for non-HTML mail clients';

	if(!$mail->send()) {
		echo 'Message could not be sent.';
		echo 'Mailer Error: ' . $mail->ErrorInfo;
	} else {
		echo 'Message has been sent';
	}
}

$wildcard = FALSE; // Set $wildcard to TRUE if you do not plan to check or limit the domains
$credentials = FALSE; // Set $credentials to TRUE if expects credential requests (Cookies, Authentication, SSL certificates)
$allowedOrigins = array('https://jcyl.work', 'http://johncrislasta.github.io.test');

if ( !isset($_SERVER['HTTP_ORIGIN']) || ( !in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins) && !$wildcard ) ) {
	// Origin is not allowed
	exit;
}
$origin = $wildcard && !$credentials ? '*' : $_SERVER['HTTP_ORIGIN'];

header("Access-Control-Allow-Origin: " . $origin);
if ($credentials) {
	header("Access-Control-Allow-Credentials: true");
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Origin");
header('P3P: CP="CAO PSA OUR"'); // Makes IE to support cookies

// Handling the Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
	echo json_encode(array('status' => 'Failed', 'post' => $_POST, 'success' => false, 'errors' => 'Permission denied!'));
	exit;
}

// Response
header("Content-Type: application/json; charset=utf-8");

$to      = 'me@jcyl.work';
$subject = 'Contact From Submission from JCYL.work';

$headers  = "From: me@jcyl.work \r\n";
$headers .= "Reply-To: no-reply@jcyl.work \r\n";
$headers .= "CC: atsalycj@gmail.com\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

$message = "Name: {$_POST['name']}<br/>Email: {$_POST['email']}";
$message .= "<p>" . $_POST['message'] . "</p>";


// mail($to, $subject, $message, $headers);

$mail->addAddress($to);     // Add a recipient

$mail->isHTML(true);                                  // Set email format to HTML

$mail->Subject = $subject;
$mail->Body    = $message;

if(!$mail->send()) {
	echo json_encode(array('status' => 'Failed', 'post' => $_POST, 'success' => false, 'errors' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo));
} else {
	echo json_encode(array('status' => 'OK', 'post' => $_POST, 'success' => true));
}

//echo json_encode(array('status' => 'OK', 'post' => $_POST));
?>
