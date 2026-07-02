<?php
// backend/api/v1/homepage/hero-slides.php

require_once __DIR__ . '/../../../bootstrap.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get all active hero slides ordered by sort_order
    $sql = "SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $slides = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendResponse(true, 'Hero slides retrieved', $slides);
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>