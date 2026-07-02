<?php
// backend/api/v1/admin/check-session.php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/SessionManager.php';

$database = new Database();
$db = $database->getConnection();

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';

if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
    sendResponse(false, 'No session', null, 401);
}

$sessionToken = substr($authHeader, 7);

$sessionManager = new SessionManager($db);
$session = $sessionManager->validateSession($sessionToken);

if (!$session) {
    sendResponse(false, 'Session expired', null, 401);
}

// Get time left
$timeLeft = $sessionManager->getSessionTimeLeft($sessionToken);
$activeSessions = $sessionManager->getActiveSessions($session['admin_id']);

sendResponse(true, 'Session active', [
    'time_left' => $timeLeft,
    'expires_at' => $session['expires_at'],
    'active_sessions_count' => count($activeSessions)
]);
?>