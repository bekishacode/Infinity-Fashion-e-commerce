<?php
date_default_timezone_set('Africa/Addis_Ababa');

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/../../../helpers/EmailHelper.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

// =============================================
// RATE LIMIT CONFIGURATION - Forgot Password Only
// =============================================
define('MAX_OTP_REQUESTS', 5);         // Max 5 OTP requests
define('LOCKOUT_MINUTES', 15);          // Lockout for 15 minutes

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';

if (empty($email)) {
    sendResponse(false, 'Email is required', null, 400);
    exit();
}

// Check if admin exists
$sql = "SELECT id, email, full_name FROM admin_users WHERE email = :email AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute([':email' => $email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    sendResponse(false, 'Only registered email addresses are allowed. An OTP will be sent if your email is registered.', null, 404);
    exit();
}

// =============================================
// RATE LIMITING CHECK - 5 requests in 15 minutes
// =============================================

// Count OTP requests in the last 15 minutes
$countSql = "SELECT COUNT(*) as request_count, MAX(created_at) as last_request_at 
             FROM admin_password_resets 
             WHERE admin_id = :admin_id 
             AND type = 'password_reset'
             AND created_at > DATE_SUB(NOW(), INTERVAL :lockout_minutes MINUTE)";
$countStmt = $db->prepare($countSql);
$countStmt->execute([
    ':admin_id' => $admin['id'],
    ':lockout_minutes' => LOCKOUT_MINUTES
]);
$result = $countStmt->fetch(PDO::FETCH_ASSOC);

$requestCount = $result['request_count'] ?? 0;
$lastRequestAt = $result['last_request_at'] ?? null;

// If 5 or more requests in the last 15 minutes, lock out
if ($requestCount >= MAX_OTP_REQUESTS) {
    $now = time();
    $lastRequestTime = strtotime($lastRequestAt);
    $timeElapsed = $now - $lastRequestTime;
    $lockoutSeconds = LOCKOUT_MINUTES * 60;
    $remainingSeconds = $lockoutSeconds - $timeElapsed;
    
    if ($remainingSeconds > 0) {
        $remainingMinutes = ceil($remainingSeconds / 60);
        
        sendResponse(false, "Too many OTP requests. You have reached the limit of " . MAX_OTP_REQUESTS . " requests. Please wait {$remainingMinutes} minute" . ($remainingMinutes > 1 ? 's' : '') . " before trying again.", null, 429);
        exit();
    } else {
        // If lockout expired, reset - allow new request
        $requestCount = 0;
    }
}

// =============================================
// GENERATE OTP
// =============================================
$otp = sprintf("%06d", mt_rand(1, 999999));
$expiresInMinutes = 15;

// Check if existing OTP exists (not used, not expired)
$existingSql = "SELECT id FROM admin_password_resets 
                WHERE admin_id = :admin_id 
                AND type = 'password_reset'
                AND used = 0 
                AND expires_at > NOW()
                ORDER BY created_at DESC LIMIT 1";
$existingStmt = $db->prepare($existingSql);
$existingStmt->execute([':admin_id' => $admin['id']]);
$existing = $existingStmt->fetch(PDO::FETCH_ASSOC);

if ($existing) {
    // Update existing OTP
    $updateSql = "UPDATE admin_password_resets 
                  SET otp = :otp, 
                      expires_at = DATE_ADD(NOW(), INTERVAL :expires_in MINUTE),
                      last_request_at = NOW()
                  WHERE id = :id";
    $updateStmt = $db->prepare($updateSql);
    $updateStmt->execute([
        ':otp' => $otp,
        ':expires_in' => $expiresInMinutes,
        ':id' => $existing['id']
    ]);
} else {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    // Insert new OTP
    $insertSql = "INSERT INTO admin_password_resets 
                  (admin_id, otp, type, expires_at, ip_address, user_agent) 
                  VALUES (:admin_id, :otp, 'password_reset', DATE_ADD(NOW(), INTERVAL :expires_in MINUTE), :ip, :user_agent)";
    $insertStmt = $db->prepare($insertSql);
    $insertStmt->execute([
        ':admin_id' => $admin['id'],
        ':otp' => $otp,
        ':expires_in' => $expiresInMinutes,
        ':ip' => $ip,
        ':user_agent' => $userAgent
    ]);
}

// =============================================
// SEND EMAIL
// =============================================
try {
    $emailHelper = new EmailHelper($db);
    $result = $emailHelper->sendEmail($email, 'otp_verification', [
        'name' => $admin['full_name'] ?? 'Admin',
        'otp' => $otp,
        'expires_in' => '15 minutes'
    ]);
    
    if ($result['success']) {
        sendResponse(true, 'OTP sent to your email', null, 200);
    } else {
        sendResponse(false, 'Failed to send OTP. Please try again.', null, 500);
    }
} catch (Exception $e) {
    sendResponse(false, 'Email service error. Please contact support.', null, 500);
}
?>