<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    $user = requireAuth();
    $db = getDB();

    // Get block ID from URL
    $blockId = $_GET['id'] ?? null;
    if (!$blockId) {
        sendError('Block ID is required', 400);
    }

    // Verify block belongs to user's project
    $stmt = $db->prepare("SELECT b.* FROM Block b JOIN Project p ON b.projectId = p.id WHERE b.id = ? AND p.userId = ?");
    $stmt->execute([$blockId, $user['id']]);
    $block = $stmt->fetch();

    if (!$block) {
        sendError('Block not found', 404);
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'PUT':
            // Update block
            $data = getJSONInput();

            $updateFields = [];
            $params = [];

            $allowedFields = ['title', 'content', 'order'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }

            if (empty($updateFields)) {
                sendError('No fields to update', 400);
            }

            $params[] = $blockId;

            $query = "UPDATE Block SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute($params);

            // Get updated block
            $stmt = $db->prepare("SELECT * FROM Block WHERE id = ?");
            $stmt->execute([$blockId]);
            $block = $stmt->fetch();

            sendResponse(['block' => $block]);

        case 'DELETE':
            // Delete block
            $stmt = $db->prepare("DELETE FROM Block WHERE id = ?");
            $stmt->execute([$blockId]);

            sendResponse(['message' => 'Block deleted successfully']);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("Block error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("Block error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
