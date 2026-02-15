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
            // Get all blocks for project
            $stmt = $db->prepare("SELECT * FROM Block WHERE projectId = ? ORDER BY `order` ASC");
            $stmt->execute([$projectId]);
            $blocks = $stmt->fetchAll();

            sendResponse(['blocks' => $blocks]);

        case 'POST':
            // Create new block
            $data = getJSONInput();
            $title = $data['title'] ?? '';
            $content = $data['content'] ?? '';
            $order = $data['order'] ?? 0;

            $stmt = $db->prepare("INSERT INTO Block (projectId, title, content, `order`) VALUES (?, ?, ?, ?)");
            $stmt->execute([$projectId, $title, $content, $order]);
            $blockId = $db->lastInsertId();

            // Get created block
            $stmt = $db->prepare("SELECT * FROM Block WHERE id = ?");
            $stmt->execute([$blockId]);
            $block = $stmt->fetch();

            sendResponse(['block' => $block], 201);

        case 'PUT':
            // Reorder blocks
            $data = getJSONInput();
            $blocks = $data['blocks'] ?? [];

            if (empty($blocks) || !is_array($blocks)) {
                sendError('Blocks array is required', 400);
            }

            $stmt = $db->prepare("UPDATE Block SET `order` = ? WHERE id = ? AND projectId = ?");
            foreach ($blocks as $index => $blockId) {
                $stmt->execute([$index, $blockId, $projectId]);
            }

            // Get updated blocks
            $stmt = $db->prepare("SELECT * FROM Block WHERE projectId = ? ORDER BY `order` ASC");
            $stmt->execute([$projectId]);
            $blocks = $stmt->fetchAll();

            sendResponse(['blocks' => $blocks]);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("Blocks error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("Blocks error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
