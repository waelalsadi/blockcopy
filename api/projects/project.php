<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    $user = requireAuth();
    $db = getDB();

    // Get project ID from URL
    $projectId = $_GET['id'] ?? null;
    if (!$projectId) {
        sendError('Project ID is required', 400);
    }

    // Verify project ownership
    $stmt = $db->prepare("SELECT * FROM Project WHERE id = ? AND userId = ?");
    $stmt->execute([$projectId, $user['id']]);
    $project = $stmt->fetch();

    if (!$project) {
        sendError('Project not found', 404);
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get project with related data
            $stmt = $db->prepare("SELECT * FROM StartSection WHERE projectId = ?");
            $stmt->execute([$projectId]);
            $startSection = $stmt->fetch();

            $stmt = $db->prepare("SELECT * FROM Block WHERE projectId = ? ORDER BY `order` ASC");
            $stmt->execute([$projectId]);
            $blocks = $stmt->fetchAll();

            $stmt = $db->prepare("SELECT * FROM File WHERE projectId = ? ORDER BY createdAt DESC");
            $stmt->execute([$projectId]);
            $files = $stmt->fetchAll();

            $stmt = $db->prepare("SELECT * FROM ChatMessage WHERE projectId = ? ORDER BY createdAt ASC");
            $stmt->execute([$projectId]);
            $chatMessages = $stmt->fetchAll();

            sendResponse([
                'project' => $project,
                'startSection' => $startSection,
                'blocks' => $blocks,
                'files' => $files,
                'chatMessages' => $chatMessages
            ]);

        case 'PUT':
            // Update project
            $data = getJSONInput();

            $updateFields = [];
            $params = [];

            $allowedFields = ['name', 'clientName', 'description', 'content', 'status'];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }

            if (empty($updateFields)) {
                sendError('No fields to update', 400);
            }

            $params[] = $projectId;
            $params[] = $user['id'];

            $query = "UPDATE Project SET " . implode(', ', $updateFields) . " WHERE id = ? AND userId = ?";
            $stmt = $db->prepare($query);
            $stmt->execute($params);

            // Get updated project
            $stmt = $db->prepare("SELECT * FROM Project WHERE id = ?");
            $stmt->execute([$projectId]);
            $project = $stmt->fetch();

            sendResponse(['project' => $project]);

        case 'DELETE':
            // Delete project (cascade will handle related records)
            $stmt = $db->prepare("DELETE FROM Project WHERE id = ? AND userId = ?");
            $stmt->execute([$projectId, $user['id']]);

            sendResponse(['message' => 'Project deleted successfully']);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("Project error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("Project error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
