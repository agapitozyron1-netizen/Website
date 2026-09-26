<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $items = $pdo->query(
        "SELECT * FROM inventory ORDER BY (quantity_available <= reorder_level) DESC, material_name ASC"
    )->fetchAll();
    echo json_encode(['success' => true, 'inventory' => $items]);
    exit;
}

if ($method === 'POST') {
    $body = requestBody();
    $id  = (int)($body['id'] ?? 0);
    $qty = $body['quantity_available'] ?? null;

    if (!$id || !is_numeric($qty) || $qty < 0) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'A valid inventory id and quantity are required.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE inventory SET quantity_available = :q WHERE id = :id");
    $stmt->execute([':q' => (int)$qty, ':id' => $id]);

    logAudit($pdo, 'Inventory updated', "Item #{$id} quantity set to {$qty}.");

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
