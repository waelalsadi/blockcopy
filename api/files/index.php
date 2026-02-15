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
            // Get all files for project
            $stmt = $db->prepare("SELECT * FROM File WHERE projectId = ? ORDER BY createdAt DESC");
            $stmt->execute([$projectId]);
            $files = $stmt->fetchAll();

            sendResponse(['files' => $files]);

        case 'POST':
            // Create new file/note
            $data = getJSONInput();
            $url = $data['url'] ?? null;
            $name = $data['name'] ?? '';
            $size = $data['size'] ?? null;
            $type = $data['type'] ?? null;
            $fileType = $data['fileType'] ?? 'file';
            $content = $data['content'] ?? null;

            if (empty($name)) {
                sendError('File name is required', 400);
            }

            $stmt = $db->prepare("INSERT INTO File (projectId, url, name, size, type, fileType, content) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$projectId, $url, $name, $size, $type, $fileType, $content]);
            $fileId = $db->lastInsertId();

            // Get created file
            $stmt = $db->prepare("SELECT * FROM File WHERE id = ?");
            $stmt->execute([$fileId]);
            $file = $stmt->fetch();

            sendResponse(['file' => $file], 201);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("Files error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("Files error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
