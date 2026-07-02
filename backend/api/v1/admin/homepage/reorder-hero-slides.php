<?php
// backend/api/v1/admin/homepage/reorder-hero-slides.php

require_once __DIR__ . '/../../../../bootstrap.php';
require_once __DIR__ . '/../verify.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

// Verify admin is logged in
verifyAdminToken();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$order = $input['order'] ?? [];

if (empty($order)) {
    sendResponse(false, 'Order data required', null, 400);
}

try {
    $db->beginTransaction();
    
    foreach ($order as $index => $id) {
        $sql = "UPDATE hero_slides SET sort_order = :sort_order WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':sort_order' => $index, ':id' => $id]);
    }
    
    $db->commit();
    sendResponse(true, 'Hero slides reordered successfully', null);
    
} catch (Exception $e) {
    $db->rollBack();
    sendResponse(false, 'Failed to reorder slides: ' . $e->getMessage(), null, 500);
}
?>