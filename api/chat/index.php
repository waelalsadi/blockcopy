<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    $user = requireAuth();
    $db = getDB();

    // Verify project ownership
    $projectId = $_GET['projectId'] ?? null;
    if (!$projectId) {
        sendError('Project ID is required', 400);
    }

    $stmt = $db->prepare("SELECT id FROM Project WHERE id = ? AND userId = ?");
    $stmt->execute([$projectId, $user['id']]);
    if (!$stmt->fetch()) {
        sendError('Project not found', 404);
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all chat messages for project
            $stmt = $db->prepare("SELECT * FROM ChatMessage WHERE projectId = ? ORDER BY createdAt ASC");
            $stmt->execute([$projectId]);
            $messages = $stmt->fetchAll();

            sendResponse(['messages' => $messages]);

        case 'POST':
            // Create new chat message
            $data = getJSONInput();
            $role = $data['role'] ?? '';
            $content = $data['content'] ?? '';

            if (empty($role) || empty($content)) {
                sendError('Role and content are required', 400);
            }

            if (!in_array($role, ['user', 'assistant'])) {
                sendError('Invalid role', 400);
            }

            $stmt = $db->prepare("INSERT INTO ChatMessage (projectId, role, content) VALUES (?, ?, ?)");
            $stmt->execute([$projectId, $role, $content]);
            $messageId = $db->lastInsertId();

            // Get created message
            $stmt = $db->prepare("SELECT * FROM ChatMessage WHERE id = ?");
            $stmt->execute([$messageId]);
            $message = $stmt->fetch();

            sendResponse(['message' => $message], 201);

        case 'DELETE':
            // Clear all chat messages for project
            $stmt = $db->prepare("DELETE FROM ChatMessage WHERE projectId = ?");
            $stmt->execute([$projectId]);

            sendResponse(['message' => 'Chat history cleared successfully']);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("Chat error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("Chat error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
