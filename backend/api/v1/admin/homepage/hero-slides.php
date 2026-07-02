<?php
// backend/api/v1/admin/homepage/hero-slides.php

require_once __DIR__ . '/../../../../bootstrap.php';
require_once __DIR__ . '/../verify.php';

$database = new Database();
$db = $database->getConnection();

header("Content-Type: application/json");

// Verify admin is logged in
verifyAdminToken();

$method = $_SERVER['REQUEST_METHOD'];

// Check if ID is provided
$id = $_GET['id'] ?? 0;

if ($method === 'GET') {
    if ($id > 0) {
        // Get single slide
        $sql = "SELECT * FROM hero_slides WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $slide = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$slide) {
            sendResponse(false, 'Hero slide not found', null, 404);
        }
        
        sendResponse(true, 'Hero slide retrieved', $slide);
    } else {
        // Get all slides
        $sql = "SELECT * FROM hero_slides ORDER BY sort_order ASC";
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $slides = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        sendResponse(true, 'Hero slides retrieved', $slides);
    }
    
} elseif ($method === 'POST') {
    // Create new slide
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = $input['title'] ?? '';
    $subtitle = $input['subtitle'] ?? '';
    $description = $input['description'] ?? '';
    $image = $input['image'] ?? '';
    $bg_gradient = $input['bg_gradient'] ?? 'from-magenta via-magenta-dark to-orange';
    $button_text = $input['button_text'] ?? 'Explore Products';
    $button_link = $input['button_link'] ?? '/products';
    $is_active = $input['is_active'] ?? 1;
    
    if (empty($title) || empty($subtitle) || empty($description) || empty($image)) {
        sendResponse(false, 'Title, subtitle, description and image are required', null, 400);
    }
    
    // Get max sort_order
    $maxSql = "SELECT MAX(sort_order) as max_sort FROM hero_slides";
    $maxStmt = $db->prepare($maxSql);
    $maxStmt->execute();
    $maxResult = $maxStmt->fetch(PDO::FETCH_ASSOC);
    $nextSort = ($maxResult['max_sort'] ?? -1) + 1;
    
    $sql = "INSERT INTO hero_slides (title, subtitle, description, image, bg_gradient, button_text, button_link, sort_order, is_active) 
            VALUES (:title, :subtitle, :description, :image, :bg_gradient, :button_text, :button_link, :sort_order, :is_active)";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':title' => $title,
        ':subtitle' => $subtitle,
        ':description' => $description,
        ':image' => $image,
        ':bg_gradient' => $bg_gradient,
        ':button_text' => $button_text,
        ':button_link' => $button_link,
        ':sort_order' => $nextSort,
        ':is_active' => $is_active
    ]);
    
    if ($result) {
        $id = $db->lastInsertId();
        sendResponse(true, 'Hero slide created successfully', ['id' => $id]);
    } else {
        sendResponse(false, 'Failed to create hero slide', null, 500);
    }
    
} elseif ($method === 'PUT') {
    // Update slide
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $_GET['id'] ?? 0;
    
    if (empty($id)) {
        sendResponse(false, 'Slide ID required', null, 400);
    }
    
    $title = $input['title'] ?? '';
    $subtitle = $input['subtitle'] ?? '';
    $description = $input['description'] ?? '';
    $image = $input['image'] ?? '';
    $bg_gradient = $input['bg_gradient'] ?? '';
    $button_text = $input['button_text'] ?? '';
    $button_link = $input['button_link'] ?? '';
    $is_active = $input['is_active'] ?? 1;
    
    $sql = "UPDATE hero_slides SET 
            title = :title,
            subtitle = :subtitle,
            description = :description,
            image = :image,
            bg_gradient = :bg_gradient,
            button_text = :button_text,
            button_link = :button_link,
            is_active = :is_active
            WHERE id = :id";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([
        ':title' => $title,
        ':subtitle' => $subtitle,
        ':description' => $description,
        ':image' => $image,
        ':bg_gradient' => $bg_gradient,
        ':button_text' => $button_text,
        ':button_link' => $button_link,
        ':is_active' => $is_active,
        ':id' => $id
    ]);
    
    if ($result) {
        sendResponse(true, 'Hero slide updated successfully', null);
    } else {
        sendResponse(false, 'Failed to update hero slide', null, 500);
    }
    
} elseif ($method === 'DELETE') {
    // Delete slide
    $id = $_GET['id'] ?? 0;
    
    if (empty($id)) {
        sendResponse(false, 'Slide ID required', null, 400);
    }
    
    $sql = "DELETE FROM hero_slides WHERE id = :id";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute([':id' => $id]);
    
    if ($result) {
        sendResponse(true, 'Hero slide deleted successfully', null);
    } else {
        sendResponse(false, 'Failed to delete hero slide', null, 500);
    }
    
} else {
    sendResponse(false, 'Method not allowed', null, 405);
}
?>