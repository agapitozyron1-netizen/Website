<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

$body     = requestBody();
$username = trim($body['username'] ?? '');
$password = (string)($body['password'] ?? '');

if ($username === '' || $password === '') {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => 'Username and password are required.']);
    exit;
}

$pdo = getDB();

$stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = :u LIMIT 1");
$stmt->execute([':u' => $username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    // Log failed attempts too, without a valid admin_id
    error_log("Admin login failed for username: {$username}");
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password.']);
    exit;
}

session_regenerate_id(true);
$_SESSION['admin_id']   = $user['id'];
$_SESSION['admin_name'] = $user['full_name'];

logAudit($pdo, 'Login', "Admin '{$user['username']}' logged in.");

echo json_encode([
    'success' => true,
    'name'    => $user['full_name'],
]);
