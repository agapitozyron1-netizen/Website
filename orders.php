<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// ── GET: list all orders (optionally filter by status/search), or one order by id ──
if ($method === 'GET') {

    if (!empty($_GET['id'])) {
        $stmt = $pdo->prepare(
            "SELECT o.*, c.fname, c.lname, c.email, c.phone, c.location
             FROM orders o
             JOIN customers c ON c.id = o.customer_id
             WHERE o.id = :id"
        );
        $stmt->execute([':id' => (int)$_GET['id']]);
        $order = $stmt->fetch();

        if (!$order) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Order not found.']);
            exit;
        }
        echo json_encode(['success' => true, 'order' => $order]);
        exit;
    }

    $where  = [];
    $params = [];

    if (!empty($_GET['status'])) {
        $where[] = 'o.status = :status';
        $params[':status'] = $_GET['status'];
    }
    if (!empty($_GET['search'])) {
        $where[] = "(c.fname LIKE :s OR c.lname LIKE :s OR o.product_type LIKE :s)";
        $params[':s'] = '%' . $_GET['search'] . '%';
    }

    $sql = "SELECT o.id, o.product_type, o.quantity, o.amount, o.status, o.order_date,
                   c.fname, c.lname
            FROM orders o
            JOIN customers c ON c.id = o.customer_id";
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
    $sql .= ' ORDER BY o.order_date DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'orders' => $stmt->fetchAll()]);
    exit;
}

// ── POST: update order status ──
if ($method === 'POST') {
    $body = requestBody();
    $id     = (int)($body['id'] ?? 0);
    $status = trim($body['status'] ?? '');

    $validStatuses = ['Pending', 'Processing', 'Ready for Install', 'Completed', 'Cancelled'];
    if (!$id || !in_array($status, $validStatuses, true)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'A valid order id and status are required.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = :s WHERE id = :id");
    $stmt->execute([':s' => $status, ':id' => $id]);

    logAudit($pdo, 'Order status updated', "Order #{$id} set to '{$status}'.");

    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
