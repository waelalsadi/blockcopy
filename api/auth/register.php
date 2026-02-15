<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Method not allowed', 405);
    }

    $data = getJSONInput();
    $email = $data['email'] ?? '';
    $name = $data['name'] ?? '';
    $password = $data['password'] ?? '';

    // Validate input
    if (empty($email) || empty($password)) {
        sendError('Email and password are required', 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('Invalid email format', 400);
    }

    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters', 400);
    }

    $db = getDB();

    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM User WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('User already exists', 409);
    }

    // Hash password
    $passwordHash = hashPassword($password);

    // Create user
    $stmt = $db->prepare("INSERT INTO User (email, name, password) VALUES (?, ?, ?)");
    $stmt->execute([$email, $name, $passwordHash]);
    $userId = $db->lastInsertId();

    // Create session
    $remember = $data['remember'] ?? false;
    $token = createSession($userId, $remember);

    // Get user data
    $stmt = $db->prepare("SELECT id, email, name, image, createdAt FROM User WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    sendResponse([
        'user' => $user,
        'token' => $token
    ], 201);

} catch (PDOException $e) {
    error_log("Register error: " . $e->getMessage());
    sendError('Registration failed', 500);
} catch (Exception $e) {
    error_log("Register error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
