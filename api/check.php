<?php
/**
 * API Check - Simple API verification
 */

header('Content-Type: application/json');

$checks = [];

// PHP Version
$checks['php_version'] = [
    'version' => phpversion(),
    'required' => '7.4+',
    'status' => version_compare(phpversion(), '7.4', '>=') ? 'ok' : 'error'
];

// Extensions
$checks['extensions'] = [];
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    $checks['extensions'][$ext] = extension_loaded($ext);
}

// Database
$checks['database'] = ['status' => 'unknown'];
try {
    require_once __DIR__ . '/config/database.php';
    $db = getDB();
    $checks['database']['status'] = 'connected';

    // Tables
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $checks['database']['tables'] = $tables;
    $checks['database']['table_count'] = count($tables);

} catch (Exception $e) {
    $checks['database']['status'] = 'error';
    $checks['database']['error'] = $e->getMessage();
}

// API Endpoints
$apiFiles = [
    'auth/login.php',
    'auth/register.php',
    'projects/index.php',
    'blocks/index.php',
    'files/index.php'
];

$checks['api_endpoints'] = [];
foreach ($apiFiles as $file) {
    $checks['api_endpoints'][$file] = file_exists(__DIR__ . '/' . $file);
}

// Overall status
$allOk = true;
if ($checks['php_version']['status'] !== 'ok') $allOk = false;
if (in_array(false, $checks['extensions'])) $allOk = false;
if ($checks['database']['status'] !== 'connected') $allOk = false;
if (in_array(false, $checks['api_endpoints'])) $allOk = false;

$checks['overall'] = $allOk ? 'ok' : 'error';

echo json_encode($checks, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
