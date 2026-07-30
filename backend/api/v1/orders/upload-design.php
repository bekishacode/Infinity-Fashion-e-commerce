<?php
// backend/api/v1/orders/upload-design.php

require_once __DIR__ . '/../../../bootstrap.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_FILES['image'])) {
    sendResponse(false, 'No image file uploaded', null, 400);
}

$file = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$max_size = 10 * 1024 * 1024; // 10MB - design files may be higher-res for printing

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$file_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($file_type, $allowed_types)) {
    sendResponse(false, 'Invalid file type. Allowed: JPG, PNG, WEBP', null, 400);
}

// Validate file size
if ($file['size'] > $max_size) {
    sendResponse(false, 'File too large. Max size: 10MB', null, 400);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $extension;

// Use the UPLOAD_PATH constant from bootstrap.php - matches convention
// used by other upload endpoints (backend/api/uploads/...)
$upload_dir = UPLOAD_PATH . '/custom-designs';
$upload_path = $upload_dir . '/' . $filename;

// Create directory if not exists (is_dir is more reliable than file_exists for dirs)
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    $image_url = '/api/uploads/custom-designs/' . $filename;
    sendResponse(true, 'Design uploaded successfully', ['image_url' => $image_url]);
} else {
    sendResponse(false, 'Failed to upload design', null, 500);
}
?>
