<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();

if (!empty($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE id = :id");
    $stmt->execute([':id' => (int)$_GET['id']]);
    $customer = $stmt->fetch();

    if (!$customer) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Customer not found.']);
        exit;
    }

    $orders = $pdo->prepare("SELECT id, product_type, status, amount, order_date FROM orders WHERE customer_id = :id ORDER BY order_date DESC");
    $orders->execute([':id' => (int)$_GET['id']]);

    echo json_encode(['success' => true, 'customer' => $customer, 'orders' => $orders->fetchAll()]);
    exit;
}

$where  = [];
$params = [];
if (!empty($_GET['search'])) {
    $where[] = "(fname LIKE :s OR lname LIKE :s OR phone LIKE :s OR location LIKE :s)";
    $params[':s'] = '%' . $_GET['search'] . '%';
}

$sql = "SELECT id, fname, lname, email, phone, location, created_at FROM customers";
if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

echo json_encode(['success' => true, 'customers' => $stmt->fetchAll()]);
