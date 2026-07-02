<?php
// backend/api/v1/admin/logout-others.php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/SessionManager.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$adminId = $input['admin_id'] ?? 0;

if (empty($adminId)) {
    sendResponse(false, 'Admin ID required', null, 400);
}

$sessionManager = new SessionManager($db);

// ============================================
//REVOKE ALL SESSIONS FOR THIS ADMIN
// ============================================
$result = $sessionManager->revokeAllSessions($adminId);

if ($result) {
    sendResponse(true, 'All other sessions logged out successfully', [
        'admin_id' => $adminId
    ]);
} else {
    sendResponse(false, 'Failed to logout other sessions', null, 500);
}
?>