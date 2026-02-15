<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendError('Method not allowed', 405);
    }

    $user = requireAuth();

    // Remove password from response
    unset($user['password']);

    sendResponse(['user' => $user]);

} catch (Exception $e) {
    error_log("Me error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
