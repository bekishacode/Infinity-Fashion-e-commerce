<?php
// ============================================
// CORS HANDLING - MUST BE AT THE VERY TOP
// ============================================

$allowed_origins = [
    'https://stylebadgetex.com',
    'https://admin.stylebadgetex.com',
    'http://localhost:3000'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Expose-Headers: Content-Length, X-Kuma-Revision");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW HANDLE THE ACTUAL REQUEST
// ============================================

// Load bootstrap
require_once __DIR__ . '/bootstrap.php';

// Set JSON response
header("Content-Type: application/json");

// Get the request path
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove /backend/ from the path if it exists
$path = preg_replace('#^/backend/#', '', $path);
$path = trim($path, '/');

// Remove query string
$path = strtok($path, '?');

// Security: Prevent directory traversal
$path = str_replace(['..', '\\', "\0"], '', $path);

// If path is empty, show API info
if (empty($path)) {
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "API v1",
        "version" => "1.0.0"
    ]);
    exit();
}

// Build the file path - check direct file match first,
// then fall back to a folder's index.php (e.g. /orders -> orders/index.php)
$filePath = API_PATH . '/' . $path . '.php';
$dirIndexPath = API_PATH . '/' . $path . '/index.php';

if (file_exists($filePath)) {
    require_once $filePath;
} elseif (file_exists($dirIndexPath)) {
    require_once $dirIndexPath;
} else {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Endpoint not found",
        "data" => null
    ]);
}
?>
