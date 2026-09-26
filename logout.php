<?php
require_once __DIR__ . '/config.php';

if (!empty($_SESSION['admin_id'])) {
    $pdo = getDB();
    logAudit($pdo, 'Logout', "Admin id {$_SESSION['admin_id']} logged out.");
}

$_SESSION = [];
session_destroy();

echo json_encode(['success' => true]);
