<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();

// Revenue by month, last 6 months (completed orders only)
$byMonth = $pdo->query(
    "SELECT DATE_FORMAT(order_date, '%Y-%m') AS month,
            COALESCE(SUM(amount),0) AS revenue,
            COUNT(*) AS orders
     FROM orders
     WHERE status = 'Completed' AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
     GROUP BY month
     ORDER BY month ASC"
)->fetchAll();

// Revenue by product type
$byProduct = $pdo->query(
    "SELECT product_type, COALESCE(SUM(amount),0) AS revenue, COUNT(*) AS orders
     FROM orders
     WHERE status = 'Completed'
     GROUP BY product_type
     ORDER BY revenue DESC"
)->fetchAll();

$totalRevenue = (float)$pdo->query(
    "SELECT COALESCE(SUM(amount),0) FROM orders WHERE status = 'Completed'"
)->fetchColumn();

$avgOrderValue = (float)$pdo->query(
    "SELECT COALESCE(AVG(amount),0) FROM orders WHERE status = 'Completed'"
)->fetchColumn();

echo json_encode([
    'success' => true,
    'total_revenue'   => $totalRevenue,
    'avg_order_value' => $avgOrderValue,
    'by_month'        => $byMonth,
    'by_product'      => $byProduct,
]);
