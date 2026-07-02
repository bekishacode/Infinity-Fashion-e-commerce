<?php
// backend/config/database.php

// Only set headers if not running from command line
if (php_sapi_name() !== 'cli') {
    header("Content-Type: application/json");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// ============================================
// FIX: Load .env from the CORRECT path
// ============================================
function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        return false;
    }
    
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
    return true;
}

// ============================================
// FIX: .env is in backend/ folder, NOT config/
// ============================================
$envFile = __DIR__ . '/../.env';  // ← GO UP ONE LEVEL

if (file_exists($envFile)) {
    loadEnv($envFile);
} else {
    // Fallback: try the old location
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        loadEnv($envFile);
    }
}

// ============================================
// Database class with fallback credentials
// ============================================
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_NAME') ?: 'style_badge';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: 'Jesuspaiditall24!';
    }

    public function getConnection() {
        if ($this->conn === null) {
            try {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                    $this->username,
                    $this->password
                );
                $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            } catch(PDOException $e) {
                if (php_sapi_name() !== 'cli') {
                    echo json_encode([
                        "success" => false,
                        "message" => "Database connection failed: " . $e->getMessage()
                    ]);
                } else {
                    echo "Database connection failed: " . $e->getMessage() . "\n";
                }
                exit();
            }
        }
        return $this->conn;
    }
}

function sendResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}
?>