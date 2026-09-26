<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();

$totalOrders   = (int)$pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
$pendingOrders = (int)$pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'Pending'")->fetchColumn();
$totalCustomers = (int)$pdo->query("SELECT COUNT(*) FROM customers")->fetchColumn();

$revenueThisMonth = (float)$pdo->query(
    "SELECT COALESCE(SUM(amount),0) FROM orders
     WHERE status = 'Completed' AND MONTH(order_date) = MONTH(CURDATE()) AND YEAR(order_date) = YEAR(CURDATE())"
)->fetchColumn();

$revenueTotal = (float)$pdo->query(
    "SELECT COALESCE(SUM(amount),0) FROM orders WHERE status = 'Completed'"
)->fetchColumn();

$lowStock = (int)$pdo->query(
    "SELECT COUNT(*) FROM inventory WHERE quantity_available <= reorder_level"
)->fetchColumn();

$recentOrders = $pdo->query(
    "SELECT o.id, o.product_type, o.status, o.amount, o.order_date,
            c.fname, c.lname
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     ORDER BY o.order_date DESC
     LIMIT 5"
)->fetchAll();

$statusBreakdown = $pdo->query(
    "SELECT status, COUNT(*) AS count FROM orders GROUP BY status"
)->fetchAll();

echo json_encode([
    'success' => true,
    'stats' => [
        'total_orders'       => $totalOrders,
        'pending_orders'     => $pendingOrders,
        'total_customers'    => $totalCustomers,
        'revenue_this_month' => $revenueThisMonth,
        'revenue_total'      => $revenueTotal,
        'low_stock_items'    => $lowStock,
    ],
    'recent_orders'    => $recentOrders,
    'status_breakdown' => $statusBreakdown,
]);
