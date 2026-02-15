<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }

    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        sendError('No token provided', 400);
    }

    $token = $matches[1];
    $db = getDB();

    // Delete session
    $stmt = $db->prepare("DELETE FROM Session WHERE token = ?");
    $stmt->execute([$token]);

    sendResponse(['message' => 'Logged out successfully']);

} catch (PDOException $e) {
    error_log("Logout error: " . $e->getMessage());
    sendError('Logout failed', 500);
} catch (Exception $e) {
    error_log("Logout error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
