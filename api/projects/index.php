<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    $user = requireAuth();
    $db = getDB();

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all projects for user
            $status = $_GET['status'] ?? null;

            $query = "SELECT p.*, COUNT(DISTINCT b.id) as blockCount, COUNT(DISTINCT f.id) as fileCount
                     FROM Project p
                     LEFT JOIN Block b ON p.id = b.projectId
                     LEFT JOIN File f ON p.id = f.projectId
                     WHERE p.userId = ?";

            $params = [$user['id']];

            if ($status) {
                $query .= " AND p.status = ?";
                $params[] = $status;
            }

            $query .= " GROUP BY p.id ORDER BY p.updatedAt DESC";

            $stmt = $db->prepare($query);
            $stmt->execute($params);
            $projects = $stmt->fetchAll();

            sendResponse(['projects' => $projects]);

        case 'POST':
            // Create new project
            $data = getJSONInput();
            $name = $data['name'] ?? '';
            $clientName = $data['clientName'] ?? null;
            $description = $data['description'] ?? null;
            $content = $data['content'] ?? null;
            $status = $data['status'] ?? 'active';

            if (empty($name)) {
                sendError('Project name is required', 400);
            }

            $stmt = $db->prepare("INSERT INTO Project (name, clientName, description, content, status, userId) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $clientName, $description, $content, $status, $user['id']]);
            $projectId = $db->lastInsertId();

            // Get created project
            $stmt = $db->prepare("SELECT * FROM Project WHERE id = ?");
            $stmt->execute([$projectId]);
            $project = $stmt->fetch();

            sendResponse(['project' => $project], 201);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("Projects error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("Projects error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
