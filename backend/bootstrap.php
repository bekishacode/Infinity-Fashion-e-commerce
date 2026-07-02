<?php
// Application bootstrap
define('ROOT_PATH', __DIR__);
define('CONFIG_PATH', ROOT_PATH . '/config');
define('API_PATH', ROOT_PATH . '/api/v1');
define('UPLOAD_PATH', ROOT_PATH . '/api/uploads');

// Load configuration
if (file_exists(CONFIG_PATH . '/database.php')) {
    require_once CONFIG_PATH . '/database.php';
}

// Any other global settings
date_default_timezone_set('UTC');

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 1); // Set to 1 for development
ini_set('log_errors', 1);
ini_set('error_log', ROOT_PATH . '/logs/error.log');
?>
