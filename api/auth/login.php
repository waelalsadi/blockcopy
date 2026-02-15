<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }

    $data = getJSONInput();
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    // Validate input
    if (empty($email) || empty($password)) {
        sendError('Email and password are required', 400);
    }

    $db = getDB();

    // Get user
    $stmt = $db->prepare("SELECT * FROM User WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !verifyPassword($password, $user['password'])) {
        sendError('Invalid email or password', 401);
    }

    // Clean expired sessions
    cleanExpiredSessions();

    // Create session
    $remember = $data['remember'] ?? false;
    $token = createSession($user['id'], $remember);

    // Remove password from response
    unset($user['password']);

    sendResponse([
        'user' => $user,
        'token' => $token
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    sendError('Login failed', 500);
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
