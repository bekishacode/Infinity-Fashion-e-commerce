<?php
require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/SessionManager.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$sessionToken = $input['session_token'] ?? '';

if (empty($sessionToken)) {
    sendResponse(false, 'Session token required', null, 400);
}

$sessionManager = new SessionManager($db);
$result = $sessionManager->destroySession($sessionToken);

if ($result) {
    sendResponse(true, 'Logged out successfully', null, 200);
} else {
    sendResponse(false, 'Failed to logout', null, 500);
}
?>