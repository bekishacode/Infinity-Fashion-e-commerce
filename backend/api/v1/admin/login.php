<?php
// backend/api/v1/admin/login.php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/SessionManager.php';
require_once __DIR__ . '/LoginAttemptsManager.php';
require_once __DIR__ . '/TwoFactorAuth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['username'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    sendResponse(false, 'Email and password required', null, 400);
}

// ============================================
// Use Database class
// ============================================
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    sendResponse(false, 'Database connection failed', null, 500);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// ============================================
// 1. CHECK ACCOUNT LOCKOUT
// ============================================
$loginAttempts = new LoginAttemptsManager($db);
$lockStatus = $loginAttempts->isLocked($email, $ip);

if ($lockStatus['locked']) {
    logAdminLogin(null, $email, 'locked', 'Account locked due to multiple failed attempts');
    sendResponse(false, 'Account locked. Please try again after 30 minutes.', [
        'locked_until' => $lockStatus['locked_until']
    ], 403);
}

// ============================================
// 2. AUTHENTICATE ADMIN
// ============================================
$sql = "SELECT id, username, email, password, full_name, role, profile_image, is_active 
        FROM admin_users 
        WHERE username = :email OR email = :email";
$stmt = $db->prepare($sql);
$stmt->execute([':email' => $email]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    $loginAttempts->recordAttempt($email, null, $ip);
    logAdminLogin(null, $email, 'failed', 'Invalid credentials');
    sendResponse(false, 'Invalid credentials', null, 401);
}

if ($admin['is_active'] != 1) {
    logAdminLogin($admin['id'], $email, 'failed', 'Account inactive');
    sendResponse(false, 'Account is inactive. Please contact support.', null, 403);
}

if (!password_verify($password, $admin['password'])) {
    $attemptData = $loginAttempts->recordAttempt($email, $admin['id'], $ip);
    logAdminLogin($admin['id'], $email, 'failed', 'Invalid password');
    
    $message = 'Invalid credentials';
    if (isset($attemptData['remaining']) && $attemptData['remaining'] > 0) {
        $message .= ". {$attemptData['remaining']} attempts remaining";
    }
    if ($attemptData['locked'] ?? false) {
        $message = 'Account locked due to multiple failed attempts. Please try again after 30 minutes.';
    }
    
    sendResponse(false, $message, [
        'attempts_remaining' => $attemptData['remaining'] ?? 0,
        'locked' => $attemptData['locked'] ?? false,
        'locked_until' => $attemptData['locked_until'] ?? null
    ], 401);
}

// ============================================
// 3. CHECK FOR EXISTING SESSIONS
// ============================================
$sessionManager = new SessionManager($db);
$hasActiveSession = $sessionManager->hasActiveSession($admin['id']);
$activeSessions = $sessionManager->getActiveSessions($admin['id']);

// ============================================
// 4. ✅ 2FA IS ALWAYS REQUIRED
// ============================================
$twoFactor = new TwoFactorAuth($db);

// Generate OTP (always)
$otp = $twoFactor->generateOTP($admin['id'], '2fa');

// Send OTP via email
$mailSent = $twoFactor->sendOTPEmail($admin['email'], $otp);

logAdminLogin($admin['id'], $email, '2fa_required');

sendResponse(true, '2FA verification required', [
    'requires_2fa' => true,
    'admin_id' => $admin['id'],
    'email_sent' => $mailSent,
    'message' => 'Verification code sent to your email',
    'has_active_session' => $hasActiveSession,
    'active_sessions_count' => count($activeSessions)
]);

function logAdminLogin($adminId, $email, $status, $reason = null) {
    global $db;
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $sql = "INSERT INTO admin_login_logs 
            (admin_id, email, ip_address, user_agent, status, failure_reason) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$adminId, $email, $ip, $userAgent, $status, $reason]);
}
?>