<?php
// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

// Send JSON response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Send error response
function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode(['error' => $message]);
    exit();
}

// Get JSON input
function getJSONInput() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON input', 400);
    }
    return $data;
}

// Get authenticated user from session token
function getAuthenticatedUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        return null;
    }

    $token = $matches[1];
    $db = getDB();

    $stmt = $db->prepare("SELECT * FROM User WHERE id = (SELECT userId FROM Session WHERE token = ? AND expiresAt > NOW())");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    return $user ?: null;
}

// Require authentication
function requireAuth() {
    $user = getAuthenticatedUser();
    if (!$user) {
        sendError('Unauthorized', 401);
    }
    return $user;
}

// Hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate session token
function generateSessionToken() {
    return bin2hex(random_bytes(32));
}

// Create session for user
function createSession($userId, $remember = false) {
    $db = getDB();
    $token = generateSessionToken();
    $expiresAt = $remember ? 'DATE_ADD(NOW(), INTERVAL 30 DAY)' : 'DATE_ADD(NOW(), INTERVAL 1 DAY)';

    $stmt = $db->prepare("INSERT INTO Session (token, userId, expiresAt) VALUES (?, ?, $expiresAt)");
    $stmt->execute([$token, $userId]);

    return $token;
}

// Clean expired sessions
function cleanExpiredSessions() {
    $db = getDB();
    $db->exec("DELETE FROM Session WHERE expiresAt < NOW()");
}
