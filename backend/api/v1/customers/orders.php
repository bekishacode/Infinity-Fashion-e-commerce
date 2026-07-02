<?php
require_once __DIR__ . '/../../../bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

$database = new Database();
$db = $database->getConnection();

$customer_id = $_GET['customer_id'] ?? 0;

if (!$customer_id) {
    sendResponse(false, 'Customer ID is required', null, 400);
}

$query = "SELECT * FROM orders WHERE customer_id = :customer_id ORDER BY created_at DESC";
$stmt = $db->prepare($query);
$stmt->bindParam(':customer_id', $customer_id);
$stmt->execute();
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendResponse(true, 'Orders retrieved successfully', $orders);
?>