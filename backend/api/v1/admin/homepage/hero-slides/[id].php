<?php
// backend/api/v1/admin/homepage/hero-slides/[id].php

require_once __DIR__ . '/../../../../bootstrap.php';
require_once __DIR__ . '/../verify.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

// Verify admin is logged in
verifyAdminToken();

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? 0;

if (empty($id)) {
    sendResponse(false, 'Slide ID required', null, 400);
}

if ($method === 'GET') {
    // Get single slide
    $sql = "SELECT * FROM hero_slides WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $id]);
    $slide = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$slide) {
        sendResponse(false, 'Hero slide not found', null, 404);
    }
    
    sendResponse(true, 'Hero slide retrieved', $slide);
    
} elseif ($method === 'PUT') {
    // ... update logic ...
    
} elseif ($method === 'DELETE') {
    // ... delete logic ...
    
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>