<?php
// ============================================================
//  Santi Blinds — Admin API bootstrap
//  Included at the top of every admin/api/*.php endpoint.
// ============================================================

session_start();

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Lock the admin API to your own site (adjust if your admin panel
// is served from a different origin than the public site).
$allowed = 'https://santiblinds.site';
header('Access-Control-Allow-Origin: ' . $allowed);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../../db_config.php';

// ── Auth guard: call at the top of every endpoint except login.php ──
function requireLogin(): void {
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
        exit;
    }
}

// ── Audit logger: call after any state-changing action ──
function logAudit(PDO $pdo, string $action, string $details = ''): void {
    $stmt = $pdo->prepare(
        "INSERT INTO audit_log (admin_id, action, details) VALUES (:a, :b, :c)"
    );
    $stmt->execute([
        ':a' => $_SESSION['admin_id'] ?? null,
        ':b' => $action,
        ':c' => $details,
    ]);
}

// ── Helper: read JSON or form-encoded body ──
function requestBody(): array {
    $raw = file_get_contents('php://input');
    $json = json_decode($raw, true);
    return is_array($json) ? $json : $_POST;
}
