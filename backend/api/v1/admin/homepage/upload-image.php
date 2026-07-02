<?php
// backend/api/v1/admin/homepage/upload-image.php

require_once __DIR__ . '/../../../../bootstrap.php';
require_once __DIR__ . '/../verify.php';

$method = $_SERVER['REQUEST_METHOD'];

header("Content-Type: application/json");

// Verify admin is logged in
verifyAdminToken();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Method not allowed', null, 405);
}

if (!isset($_FILES['image'])) {
    sendResponse(false, 'No image file uploaded', null, 400);
}

$file = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
$max_size = 5 * 1024 * 1024;

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$file_type = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($file_type, $allowed_types)) {
    sendResponse(false, 'Invalid file type. Allowed: JPG, PNG, WEBP', null, 400);
}

if ($file['size'] > $max_size) {
    sendResponse(false, 'File too large. Max size: 5MB', null, 400);
}

// Create upload directory if not exists
$upload_dir = __DIR__ . '/../../../../api/uploads/homepage/';

if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = time() . '_' . uniqid() . '.' . $extension;
$upload_path = $upload_dir . $filename;

if (move_uploaded_file($file['tmp_name'], $upload_path)) {
    $image_url = '/api/uploads/homepage/' . $filename;
    sendResponse(true, 'Image uploaded successfully', ['image_url' => $image_url]);
} else {
    sendResponse(false, 'Failed to upload image', null, 500);
}
?>