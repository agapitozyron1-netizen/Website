<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();

$from = $_GET['from'] ?? date('Y-m-01');
$to   = $_GET['to']   ?? date('Y-m-d');

$stmt = $pdo->prepare(
    "SELECT o.id, o.product_type, o.quantity, o.amount, o.status, o.order_date,
            c.fname, c.lname, c.location
     FROM orders o
     JOIN customers c ON c.id = o.customer_id
     WHERE DATE(o.order_date) BETWEEN :from AND :to
     ORDER BY o.order_date ASC"
);
$stmt->execute([':from' => $from, ':to' => $to]);
$orders = $stmt->fetchAll();

// ── CSV export ──
if (!empty($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="santiblinds-report-' . $from . '_to_' . $to . '.csv"');

    $out = fopen('php://output', 'w');
    fputcsv($out, ['Order ID', 'Customer', 'Location', 'Product', 'Qty', 'Amount', 'Status', 'Date']);
    foreach ($orders as $o) {
        fputcsv($out, [
            $o['id'],
            $o['fname'] . ' ' . $o['lname'],
            $o['location'],
            $o['product_type'],
            $o['quantity'],
            $o['amount'],
            $o['status'],
            $o['order_date'],
        ]);
    }
    fclose($out);

    logAudit($pdo, 'Report exported', "CSV export {$from} to {$to}.");
    exit;
}

$totalRevenue = 0;
$completedCount = 0;
foreach ($orders as $o) {
    if ($o['status'] === 'Completed') {
        $totalRevenue += (float)$o['amount'];
        $completedCount++;
    }
}

echo json_encode([
    'success' => true,
    'from' => $from,
    'to'   => $to,
    'summary' => [
        'total_orders'     => count($orders),
        'completed_orders' => $completedCount,
        'total_revenue'    => $totalRevenue,
    ],
    'orders' => $orders,
]);
