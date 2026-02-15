<?php
require_once __DIR__ . '/../helpers/functions.php';

try {
    $user = requireAuth();
    $db = getDB();

    // Get project ID from URL
    $projectId = $_GET['projectId'] ?? null;
    if (!$projectId) {
        sendError('Project ID is required', 400);
    }

    // Verify project ownership
    $stmt = $db->prepare("SELECT id FROM Project WHERE id = ? AND userId = ?");
    $stmt->execute([$projectId, $user['id']]);
    if (!$stmt->fetch()) {
        sendError('Project not found', 404);
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get start section for project
            $stmt = $db->prepare("SELECT * FROM StartSection WHERE projectId = ?");
            $stmt->execute([$projectId]);
            $startSection = $stmt->fetch();

            sendResponse(['startSection' => $startSection]);

        case 'POST':
        case 'PUT':
            // Create or update start section
            $data = getJSONInput();

            // Define all possible fields
            $fields = [
                'projectOverview', 'deliverables', 'timeline',
                'idealClientDemographics', 'idealClientPainPoints', 'idealClientGoals', 'idealClientObjections',
                'projectUnderstandingProblem', 'projectUnderstandingSolution', 'projectUnderstandingUniqueValue',
                'frameworkWhatCoreProduct', 'frameworkWhatKeyFeatures', 'frameworkWhatUniqueSellingPoints',
                'frameworkWhoTargetAudience', 'frameworkWhoIdealCustomer', 'frameworkWhoDecisionMaker',
                'frameworkWhyProblemSolved', 'frameworkWhyBenefits', 'frameworkWhyEmotionalHook',
                'frameworkHowProcess', 'frameworkHowDeliveryMethod', 'frameworkHowSupportSystem'
            ];

            // Check if start section exists
            $stmt = $db->prepare("SELECT id FROM StartSection WHERE projectId = ?");
            $stmt->execute([$projectId]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Update existing
                $updateFields = [];
                $params = [];

                foreach ($fields as $field) {
                    $updateFields[] = "$field = ?";
                    $params[] = $data[$field] ?? null;
                }

                $params[] = $projectId;
                $query = "UPDATE StartSection SET " . implode(', ', $updateFields) . " WHERE projectId = ?";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
            } else {
                // Create new
                $placeholders = [];
                $params = [$projectId];

                foreach ($fields as $field) {
                    $placeholders[] = '?';
                    $params[] = $data[$field] ?? null;
                }

                $query = "INSERT INTO StartSection (projectId, " . implode(', ', $fields) . ") VALUES (?, " . implode(', ', $placeholders) . ")";
                $stmt = $db->prepare($query);
                $stmt->execute($params);
            }

            // Get updated/created start section
            $stmt = $db->prepare("SELECT * FROM StartSection WHERE projectId = ?");
            $stmt->execute([$projectId]);
            $startSection = $stmt->fetch();

            sendResponse(['startSection' => $startSection]);

        case 'DELETE':
            // Delete start section
            $stmt = $db->prepare("DELETE FROM StartSection WHERE projectId = ?");
            $stmt->execute([$projectId]);

            sendResponse(['message' => 'Start section deleted successfully']);

        default:
            sendError('Method not allowed', 405);
    }

} catch (PDOException $e) {
    error_log("StartSection error: " . $e->getMessage());
    sendError('Database error', 500);
} catch (Exception $e) {
    error_log("StartSection error: " . $e->getMessage());
    sendError($e->getMessage(), 500);
}
