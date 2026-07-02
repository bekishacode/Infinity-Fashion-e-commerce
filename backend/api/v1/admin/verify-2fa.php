<?php
// backend/api/v1/admin/verify-2fa.php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/SessionManager.php';
require_once __DIR__ . '/TwoFactorAuth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$adminId = $input['admin_id'] ?? 0;
$otp = $input['otp'] ?? '';

if (empty($adminId) || empty($otp)) {
    sendResponse(false, 'Admin ID and OTP required', null, 400);
}

// ============================================
// Database connection
// ============================================
$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    sendResponse(false, 'Database connection failed', null, 500);
}

// ============================================
// Verify OTP
// ============================================
$twoFactor = new TwoFactorAuth($db);
$isValid = $twoFactor->verifyOTP($adminId, $otp, '2fa');

if (!$isValid) {
    // Pass $db directly to log function
    logAdminLogin($db, $adminId, '', '2fa_failed', 'Invalid OTP');
    sendResponse(false, 'Invalid or expired verification code', null, 401);
}

// ============================================
// Get admin details
// ============================================
$sql = "SELECT id, username, email, full_name, role, profile_image FROM admin_users WHERE id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$adminId]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    sendResponse(false, 'Admin not found', null, 404);
}

// ============================================
// Create session
// ============================================
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$sessionManager = new SessionManager($db);
$sessionData = $sessionManager->createSession($admin['id'], $ip, $userAgent);

// ============================================
// Generate JWT token
// ============================================
$jwtPayload = [
    'id' => $admin['id'],
    'username' => $admin['username'],
    'role' => $admin['role'],
    'expires' => strtotime($sessionData['expires_at'])
];
$token = base64_encode(json_encode($jwtPayload));

logAdminLogin($db, $admin['id'], $admin['email'], '2fa_success');

sendResponse(true, 'Verification successful', [
    'admin' => [
        'id' => $admin['id'],
        'username' => $admin['username'],
        'email' => $admin['email'],
        'full_name' => $admin['full_name'],
        'role' => $admin['role'],
        'profile_image' => $admin['profile_image']
    ],
    'token' => $token,
    'session_token' => $sessionData['session_token'],
    'expires_at' => $sessionData['expires_at']
]);

// ============================================
// Fixed: Pass $db as parameter instead of using global
// ============================================
function logAdminLogin($db, $adminId, $email, $status, $reason = null) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    $sql = "INSERT INTO admin_login_logs 
            (admin_id, email, ip_address, user_agent, status, failure_reason) 
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$adminId, $email, $ip, $userAgent, $status, $reason]);
}
?>