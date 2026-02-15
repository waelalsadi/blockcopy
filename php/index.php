<?php
/**
 * BlockCopy - PHP Full Stack Version
 * نظام إدارة المشاريع الذكي - نسخة PHP كاملة
 */

// Start session
session_start();

// Check if user is logged in
require_once __DIR__ . '/api/config/database.php';
require_once __DIR__ . '/api/helpers/functions.php';

// Get current user
$user = null;
if (isset($_SESSION['user_id'])) {
    $db = getDB();
    $stmt = $db->prepare("SELECT id, email, name, image FROM User WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
}

// If not logged in and not on auth pages, redirect to login
$currentPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$authPages = ['/login.php', '/register.php'];
if (!$user && !in_array($currentPath, $authPages)) {
    header('Location: /login.php');
    exit();
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlockCopy - نظام إدارة المشاريع</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <?php if ($user): ?>
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <h2>🚀 BlockCopy</h2>
        </div>
        <nav class="sidebar-nav">
            <a href="/index.php" class="nav-item <?php echo $currentPath === '/index.php' ? 'active' : ''; ?>">
                <i class="fas fa-home"></i>
                <span>الرئيسية</span>
            </a>
            <a href="/projects.php" class="nav-item <?php echo strpos($currentPath, '/projects') === 0 ? 'active' : ''; ?>">
                <i class="fas fa-folder"></i>
                <span>المشاريع</span>
            </a>
            <a href="/create-project.php" class="nav-item <?php echo $currentPath === '/create-project.php' ? 'active' : ''; ?>">
                <i class="fas fa-plus-circle"></i>
                <span>مشروع جديد</span>
            </a>
        </nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <img src="<?php echo $user['image'] ?: '/assets/images/default-avatar.png'; ?>" alt="Avatar" class="user-avatar">
                <span><?php echo htmlspecialchars($user['name'] ?: $user['email']); ?></span>
            </div>
            <a href="/logout.php" class="btn-logout">
                <i class="fas fa-sign-out-alt"></i>
                <span>تسجيل الخروج</span>
            </a>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <?php if ($currentPath === '/index.php'): ?>
        <!-- Dashboard -->
        <?php
        $db = getDB();
        $stmt = $db->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM Project WHERE userId = ?");
        $stmt->execute([$user['id']]);
        $stats = $stmt->fetch();

        $stmt = $db->prepare("SELECT * FROM Project WHERE userId = ? ORDER BY updatedAt DESC LIMIT 5");
        $stmt->execute([$user['id']]);
        $recentProjects = $stmt->fetchAll();
        ?>
        <div class="page-header">
            <h1>مرحباً، <?php echo htmlspecialchars($user['name'] ?: 'مستخدم'); ?>! 👋</h1>
            <p>إليك نظرة سريعة على مشاريعك</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: #667eea;">
                    <i class="fas fa-folder"></i>
                </div>
                <div class="stat-info">
                    <h3><?php echo $stats['total']; ?></h3>
                    <p>إجمالي المشاريع</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #28a745;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-info">
                    <h3><?php echo $stats['active']; ?></h3>
                    <p>مشاريع نشطة</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #6c757d;">
                    <i class="fas fa-flag-checkered"></i>
                </div>
                <div class="stat-info">
                    <h3><?php echo $stats['completed']; ?></h3>
                    <p>مشاريع مكتملة</p>
                </div>
            </div>
        </div>

        <div class="recent-projects">
            <div class="section-header">
                <h2>المشاريع الأخيرة</h2>
                <a href="/projects.php" class="btn-link">عرض الكل <i class="fas fa-arrow-left"></i></a>
            </div>
            <div class="projects-grid">
                <?php foreach ($recentProjects as $project): ?>
                <a href="/project.php?id=<?php echo $project['id']; ?>" class="project-card">
                    <div class="project-status status-<?php echo $project['status']; ?>">
                        <?php
                        $statusText = ['active' => 'نشط', 'completed' => 'مكتمل', 'archived' => 'مؤرشف'];
                        echo $statusText[$project['status']] ?? $project['status'];
                        ?>
                    </div>
                    <h3><?php echo htmlspecialchars($project['name']); ?></h3>
                    <p><?php echo htmlspecialchars($project['clientName'] ?? 'بدون عميل'); ?></p>
                    <div class="project-meta">
                        <span><i class="fas fa-clock"></i> <?php echo date('Y/m/d', strtotime($project['updatedAt'])); ?></span>
                    </div>
                </a>
                <?php endforeach; ?>
                <?php if (empty($recentProjects)): ?>
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>لا توجد مشاريع بعد</p>
                    <a href="/create-project.php" class="btn btn-primary">إنشاء مشروع جديد</a>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php endif; ?>
    </main>

    <?php else: ?>
    <!-- Not logged in - show landing page -->
    <main class="landing-page">
        <div class="landing-hero">
            <h1>🚀 BlockCopy</h1>
            <p>نظام إدارة المشاريع الذكي</p>
            <div class="landing-actions">
                <a href="/login.php" class="btn btn-primary">تسجيل الدخول</a>
                <a href="/register.php" class="btn btn-secondary">إنشاء حساب</a>
            </div>
        </div>
    </main>
    <?php endif; ?>

    <script src="/assets/js/app.js"></script>
</body>
</html>
