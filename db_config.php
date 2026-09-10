<?php
// ============================================================
//  Santi Blinds — Database Configuration
//  Place this file ONE level above your web root (public_html)
//  for security, OR keep it here and restrict access in .htaccess
// ============================================================

define('DB_HOST', 'localhost');
define('DB_NAME', 'santgudy_mydb');
define('DB_USER', 'santgudy_santi');        // ← change to your phpMyAdmin username
define('DB_PASS', '@SantiBlinds');            // ← change to your phpMyAdmin password
define('DB_CHARSET', 'utf8mb4');
define('MAIL_FROM',         'agapitozyron@gmail.com');   // the Gmail sending the notification
define('MAIL_TO',           'agapitolearning@gmail.com');   // where you want to receive it
define('MAIL_APP_PASSWORD', 'kkux dipm clfv kiqg');   // the 16-char App Password

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }
    return $pdo;
}