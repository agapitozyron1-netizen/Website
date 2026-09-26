<?php
require_once __DIR__ . '/config.php';
requireLogin();

$pdo = getDB();

$limit = isset($_GET['limit']) ? min(500, max(1, (int)$_GET['limit'])) : 100;

$stmt = $pdo->prepare(
    "SELECT a.id, a.action, a.details, a.created_at, u.username, u.full_name
     FROM audit_log a
     LEFT JOIN admin_users u ON u.id = a.admin_id
     ORDER BY a.created_at DESC
     LIMIT :limit"
);
$stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
$stmt->execute();

echo json_encode(['success' => true, 'log' => $stmt->fetchAll()]);
