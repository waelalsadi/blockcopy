<?php
// API Router - Use this if .htaccess is not working
// This file handles routing when URL rewriting is not available

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove script name and query string from request URI
$path = preg_replace('#^' . preg_quote(dirname($scriptName), '#') . '#', '', $requestUri);
$path = preg_replace('/\?.*$/', '', $path);
$path = rtrim($path, '/');
$path = $path ?: '/';

// Remove /api prefix if exists
$path = preg_replace('#^/api#', '', $path);

// Route mapping
$routes = [
    // Auth routes
    '/auth/register' => 'auth/register.php',
    '/auth/login' => 'auth/login.php',
    '/auth/me' => 'auth/me.php',
    '/auth/logout' => 'auth/logout.php',

    // Projects routes
    '/projects' => 'projects/index.php',
    // Projects with ID handled separately below

    // Blocks routes
    '/blocks' => 'blocks/index.php',
    // Blocks with ID handled separately below

    // Files routes
    '/files' => 'files/index.php',
    // Files with ID handled separately below

    // Chat routes
    '/chat' => 'chat/index.php',

    // Start section routes
    '/start-section' => 'start-section/index.php',
];

// Check if path exists in routes
if (isset($routes[$path])) {
    $file = __DIR__ . '/' . $routes[$path];
    if (file_exists($file)) {
        include $file;
        exit();
    }
}

// Handle routes with ID parameter
if (preg_match('#^/projects/(\d+)$#', $path, $matches)) {
    $_GET['id'] = $matches[1];
    include __DIR__ . '/projects/project.php';
    exit();
}

if (preg_match('#^/blocks/(\d+)$#', $path, $matches)) {
    $_GET['id'] = $matches[1];
    include __DIR__ . '/blocks/block.php';
    exit();
}

if (preg_match('#^/files/(\d+)$#', $path, $matches)) {
    $_GET['id'] = $matches[1];
    include __DIR__ . '/files/file.php';
    exit();
}

// 404 Not Found
header('Content-Type: application/json');
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
