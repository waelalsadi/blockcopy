<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: /login.php');
    exit();
}

require_once __DIR__ . '/api/config/database.php';
require_once __DIR__ . '/api/helpers/functions.php';

$db = getDB();
$userId = $_SESSION['user_id'];

// Get filter
$statusFilter = $_GET['status'] ?? '';

// Build query
$query = "SELECT p.*, COUNT(DISTINCT b.id) as blockCount, COUNT(DISTINCT f.id) as fileCount
          FROM Project p
          LEFT JOIN Block b ON p.id = b.projectId
          LEFT JOIN File f ON p.id = f.projectId
          WHERE p.userId = ?";
$params = [$userId];

if ($statusFilter) {
    $query .= " AND p.status = ?";
    $params[] = $statusFilter;
}

$query .= " GROUP BY p.id ORDER BY p.updatedAt DESC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$projects = $stmt->fetchAll();

// Get stats
$stmt = $db->prepare("SELECT COUNT(*) as total FROM Project WHERE userId = ?");
$stmt->execute([$userId]);
$totalProjects = $stmt->fetch()['total'];

$stmt = $db->prepare("SELECT COUNT(*) as total FROM Project WHERE userId = ? AND status = 'active'");
$stmt->execute([$userId]);
$activeProjects = $stmt->fetch()['total'];
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>المشاريع - BlockCopy</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2>🚀 BlockCopy</h2>
        </div>
        <nav class="sidebar-nav">
            <a href="/index.php" class="nav-item">
                <i class="fas fa-home"></i>
                <span>الرئيسية</span>
            </a>
            <a href="/projects.php" class="nav-item active">
                <i class="fas fa-folder"></i>
                <span>المشاريع</span>
            </a>
            <a href="/create-project.php" class="nav-item">
                <i class="fas fa-plus-circle"></i>
                <span>مشروع جديد</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <img src="/assets/images/default-avatar.png" alt="Avatar" class="user-avatar">
                <span><?php echo htmlspecialchars($_SESSION['user_name'] ?? 'مستخدم'); ?></span>
            </div>
            <a href="/logout.php" class="btn-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>تسجيل الخروج</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <div class="page-header">
            <div>
                <h1>المشاريع</h1>
                <p><?php echo $activeProjects; ?> مشروع نشط من <?php echo $totalProjects; ?> إجمالي</p>
            </div>
            <a href="/create-project.php" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                مشروع جديد
            </a>
        </div>

        <!-- Filters -->
        <div class="filters">
            <a href="/projects.php" class="filter-btn <?php echo $statusFilter === '' ? 'active' : ''; ?>">
                الكل
            </a>
            <a href="/projects.php?status=active" class="filter-btn <?php echo $statusFilter === 'active' ? 'active' : ''; ?>">
                نشط
            </a>
            <a href="/projects.php?status=completed" class="filter-btn <?php echo $statusFilter === 'completed' ? 'active' : ''; ?>">
                مكتمل
            </a>
            <a href="/projects.php?status=archived" class="filter-btn <?php echo $statusFilter === 'archived' ? 'active' : ''; ?>">
                مؤرشف
            </a>
        </div>

        <!-- Projects Grid -->
        <div class="projects-grid">
            <?php foreach ($projects as $project): ?>
            <a href="/project.php?id=<?php echo $project['id']; ?>" class="project-card">
                <div class="project-status status-<?php echo $project['status']; ?>">
                    <?php
                    $statusText = ['active' => 'نشط', 'completed' => 'مكتمل', 'archived' => 'مؤرشف'];
                    echo $statusText[$project['status']] ?? $project['status'];
                    ?>
                </div>
                <h3><?php echo htmlspecialchars($project['name']); ?></h3>
                <p><?php echo htmlspecialchars($project['clientName'] ?? 'بدون عميل'); ?></p>
                <?php if ($project['description']): ?>
                <p class="project-description"><?php echo htmlspecialchars(mb_substr($project['description'], 0, 100)); ?>...</p>
                <?php endif; ?>
                <div class="project-meta">
                    <span><i class="fas fa-cube"></i> <?php echo $project['blockCount']; ?> قسم</span>
                    <span><i class="fas fa-file"></i> <?php echo $project['fileCount']; ?> ملف</span>
                    <span><i class="fas fa-clock"></i> <?php echo date('Y/m/d', strtotime($project['updatedAt'])); ?></span>
                </div>
            </a>
            <?php endforeach; ?>

            <?php if (empty($projects)): ?>
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>لا توجد مشاريع</p>
                <a href="/create-project.php" class="btn btn-primary">إنشاء مشروع جديد</a>
            </div>
            <?php endif; ?>
        </div>
    </main>
</body>
</html>
