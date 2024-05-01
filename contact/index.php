<?php
// TODO: setup db connection for saving guest activities
/*
 * 000webhost mysql:
 * DB Name: id20556261_jcyl_work
 * DB User: id20556261_root
 * DB Pass: JCY6589Last@
 */


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
$allowedOrigins = array('https://www.jcyl.work',
	'http://johncrislasta.github.io.test',
	'https://f1c7-158-62-76-53.ngrok-free.app',
);

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
	echo json_encode(array('status' => 'Failed', 'post' => $_POST, 'success' => false, 'error' => 'Permission denied!'));
	exit;
}


$authenticator = json_decode($_POST['submissionAuthenticator'], true);

// Get times taken. If it's less than 5 seconds, it must be a spam. If longer than 5 minutes, it could be a bot.

$min_allowed_time = 5;
$max_allowed_time = 600;

$time_taken = 0;

foreach($authenticator['timeTaken'] as $time) {
	$time_taken += $time;
}

if ( $time_taken < $min_allowed_time ) {
	echo json_encode( array( 'status'        => 'Failed',
	                         'authenticator' => $authenticator,
	                         'post'          => $_POST,
	                         'success'       => false,
	                         'error'         => 'Sorry to suspect you as a spam, but can you provide a sentence or two proving that you are a human? Thanks!'
	) );
	die();
}

if ( $time_taken > $max_allowed_time ) {
	echo json_encode( array( 'status'        => 'Failed',
	                         'authenticator' => $authenticator,
	                         'post'          => $_POST,
	                         'success'       => false,
	                         'error'         => 'Sorry to suspect you as a bot, but it took you too long to compose a message. Would you like to try sending a message again? Also include in your message a sentence or two to prove you are a human. Thanks!'
	) );
	die();
}

// Honeypot checked.
if( isset($_POST['newsletter']) && $_POST['newsletter'] == "on" ) {
	echo json_encode( array( 'status'        => 'Failed',
	                         'authenticator' => $authenticator,
	                         'post'          => $_POST,
	                         'success'       => false,
	                         'error'         => 'Sorry, I am not sending out newsletters at the moment.'
	) );
	die();
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


$matchTwoDetails = json_decode($_POST['matchTwoDetails'], true);
$leastFlips = json_decode($matchTwoDetails['leastFlips'], true);

$leastFlips = empty($leastFlips) ? 0 : "{$leastFlips['count']} on {$leastFlips['date']}";

$message .= "<hr/><h3>Match Two Game:</h3>
<p><b>Least Flips</b>: $leastFlips</p>
<p><b>Number of Solves</b>: {$matchTwoDetails['numSolves']}</p>";


$clientInfo = json_decode($_POST['clientInfo'], true);

$message .= "<hr/><h3>Client Info:</h3>
<p>". getIp() ."</p>
<p><b>User Agent</b>: {$clientInfo['userAgent']}</p>
<p><b>App Name*</b>: {$clientInfo['appName']}</p>
<p><b>App Version*</b>: {$clientInfo['appVersion']}</p>
<p><b>Vendor</b>: {$clientInfo['vendor']}</p>
<p><b>Platform*</b>: {$clientInfo['platform']}</p>
<p><b>Language</b>: {$clientInfo['language']}</p>
<p><b>Cookies Enabled</b>: {$clientInfo['cookiesEnabled']}</p>
<p><b>Screen Width</b>: {$clientInfo['screenWidth']}</p>
<p><b>Screen Height</b>: {$clientInfo['screenHeight']}</p>
<p><b>Device Pixel Ratio</b>: {$clientInfo['devicePixelRatio']}</p>";


$mail->Subject = $subject;
$mail->Body    = $message;

if(!$mail->send()) {
	echo json_encode(array('status' => 'Failed', 'post' => $_POST, 'success' => false, 'error' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo));
} else {
	echo json_encode(array('status' => 'OK', 'post' => $_POST, 'success' => true));
}


/**
 * Function to get the client IP address.
 *
 * @return string The IP address
 */
function getIp() {
	$return = "<b>IP Address</b>: ";
	if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
		$return .= "Client IP = " . $_SERVER['HTTP_CLIENT_IP'] . "; ";
	}
	if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
		$return .= "Forwarded For = " . $_SERVER['HTTP_X_FORWARDED_FOR'] . "; ";
	}
	$return .= $_SERVER['REMOTE_ADDR'];

	return $return;
}
