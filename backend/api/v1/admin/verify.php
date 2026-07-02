<?php
// backend/api/v1/admin/verify.php

require_once __DIR__ . '/../../../bootstrap.php';
require_once __DIR__ . '/SessionManager.php';

function verifyAdminToken() {
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db === null) {
        sendResponse(false, 'Database connection failed', null, 500);
    }
    
    $token = null;
    
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        if (!empty($authHeader)) {
            $token = str_replace('Bearer ', '', $authHeader);
        }
    }
    
    if ($token === null && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
    }
    
    if ($token === null && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $token = str_replace('Bearer ', '', $_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
    }
    
    if ($token === null) {
        sendResponse(false, 'Unauthorized', null, 401);
    }
    
    if (ctype_xdigit($token) && strlen($token) === 64) {
        $sessionManager = new SessionManager($db);
        $session = $sessionManager->validateSession($token);
        
        if ($session) {
            $sql = "SELECT id, username, email, full_name, role, profile_image FROM admin_users WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute([$session['admin_id']]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($admin) {
                error_log("=== VERIFY.PHP RETURNING ===");
                error_log("Session token: " . substr($token, 0, 20) . "...");
                error_log("Session found: " . ($session ? 'YES' : 'NO'));
                return [
                    'admin' => $admin,
                    'session' => $session,
                    'session_token' => $token 
                ];
            }
        }
    }
    
    $decoded = json_decode(base64_decode($token), true);
    if ($decoded && isset($decoded['expires']) && $decoded['expires'] >= time()) {
        return $decoded;
    }
    
    sendResponse(false, 'Token expired or invalid. Please login again.', null, 401);
}
?>