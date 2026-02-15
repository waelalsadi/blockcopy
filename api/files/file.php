<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    $user = requireAuth();
    $db = getDB();

    // Get file ID from URL
    $fileId = $_GET['id'] ?? null;
    if (!$fileId) {
        sendError('File ID is required', 400);
    }

    // Verify file belongs to user's project
    $stmt = $db->prepare("SELECT f.* FROM File f JOIN Project p ON f.projectId = p.id WHERE f.id = ? AND p.userId = ?");
    $stmt->execute([$fileId, $user['id']]);
    $file = $stmt->fetch();

    if (!$file) {
        sendError('File not found', 404);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Delete file
        $stmt = $db->prepare("DELETE FROM File WHERE id = ?");
        $stmt->execute([$fileId]);

        sendResponse(['message' => 'File deleted successfully']);
    } else {
        sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("File error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("File error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
