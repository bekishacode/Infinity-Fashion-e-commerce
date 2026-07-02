<?php
// backend/api/v1/admin/resend-2fa-otp.php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/TwoFactorAuth.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$adminId = $input['admin_id'] ?? 0;

if (empty($adminId)) {
    sendResponse(false, 'Admin ID required', null, 400);
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
// Get admin details
// ============================================
$sql = "SELECT id, email, full_name FROM admin_users WHERE id = ? AND is_active = 1";
$stmt = $db->prepare($sql);
$stmt->execute([$adminId]);
$admin = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$admin) {
    sendResponse(false, 'Admin not found', null, 404);
}

// ============================================
// Generate and send new OTP
// ============================================
$twoFactor = new TwoFactorAuth($db);

// Generate new OTP
$otp = $twoFactor->generateOTP($adminId, '2fa');

// Send OTP via email
$mailSent = $twoFactor->sendOTPEmail($admin['email'], $otp);

if ($mailSent) {
    sendResponse(true, 'New verification code sent to your email', null, 200);
} else {
    sendResponse(false, 'Failed to send verification code. Please try again.', null, 500);
}
?>