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
$error = '';
$success = '';

// Handle project creation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $clientName = $_POST['client_name'] ?? '';
    $description = $_POST['description'] ?? '';
    $content = $_POST['content'] ?? '';
    $status = $_POST['status'] ?? 'active';

    if (empty($name)) {
        $error = 'اسم المشروع مطلوب';
    } else {
        try {
            $stmt = $db->prepare("INSERT INTO Project (name, clientName, description, content, status, userId) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $clientName, $description, $content, $status, $userId]);

            $projectId = $db->lastInsertId();
            header('Location: /project.php?id=' . $projectId);
            exit();
        } catch (Exception $e) {
            $error = 'فشل إنشاء المشروع: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إنشاء مشروع - BlockCopy</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .editor-toolbar {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px 8px 0 0;
            border: 1px solid #dee2e6;
        }
        .editor-toolbar button {
            padding: 8px 12px;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            cursor: pointer;
        }
        .editor-toolbar button:hover {
            background: #e9ecef;
        }
        textarea.form-control {
            min-height: 200px;
            border-radius: 0 0 8px 8px;
        }
    </style>
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
            <a href="/projects.php" class="nav-item">
                <i class="fas fa-folder"></i>
                <span>المشاريع</span>
            </a>
            <a href="/create-project.php" class="nav-item active">
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
                <h1>إنشاء مشروع جديد</h1>
                <p>املأ معلومات المشروع الأساسية</p>
            </div>
            <a href="/projects.php" class="btn btn-secondary">
                <i class="fas fa-times"></i>
                إلغاء
            </a>
        </div>

        <?php if ($error): ?>
        <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>

        <form class="project-form" method="POST" action="/create-project.php">
            <div class="form-section">
                <h3>المعلومات الأساسية</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label for="name">اسم المشروع *</label>
                        <input type="text" id="name" name="name" required
                               placeholder="مثال: حملة تسويقية لمنتج جديد"
                               value="<?php echo htmlspecialchars($_POST['name'] ?? ''); ?>">
                    </div>

                    <div class="form-group">
                        <label for="client_name">اسم العميل</label>
                        <input type="text" id="client_name" name="client_name"
                               placeholder="مثال: شركة ABC"
                               value="<?php echo htmlspecialchars($_POST['client_name'] ?? ''); ?>">
                    </div>
                </div>

                <div class="form-group">
                    <label for="status">الحالة</label>
                    <select id="status" name="status">
                        <option value="active" <?php echo (($_POST['status'] ?? '') === 'active') ? 'selected' : ''; ?>>نشط</option>
                        <option value="completed" <?php echo (($_POST['status'] ?? '') === 'completed' ? 'selected' : ''); ?>>مكتمل</option>
                        <option value="archived" <?php echo (($_POST['status'] ?? '') === 'archived' ? 'selected' : ''); ?>>مؤرشف</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="description">الوصف</label>
                    <textarea id="description" name="description" rows="4"
                              placeholder="وصف مختصر للمشروع..."><?php echo htmlspecialchars($_POST['description'] ?? ''); ?></textarea>
                </div>
            </div>

            <div class="form-section">
                <h3>المحتوى المبدئي</h3>

                <div class="form-group">
                    <label>محتوى المشروع</label>
                    <div class="editor-toolbar">
                        <button type="button" onclick="formatText('bold')"><i class="fas fa-bold"></i></button>
                        <button type="button" onclick="formatText('italic')"><i class="fas fa-italic"></i></button>
                        <button type="button" onclick="formatText('underline')"><i class="fas fa-underline"></i></button>
                        <button type="button" onclick="formatText('insertUnorderedList')"><i class="fas fa-list-ul"></i></button>
                        <button type="button" onclick="formatText('insertOrderedList')"><i class="fas fa-list-ol"></i></button>
                    </div>
                    <textarea id="content" name="content" class="form-control"
                              placeholder="ابدأ بكتابة محتوى المشروع هنا..."><?php echo htmlspecialchars($_POST['content'] ?? ''); ?></textarea>
                </div>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-check"></i>
                    إنشاء المشروع
                </button>
                <a href="/projects.php" class="btn btn-secondary">
                    <i class="fas fa-times"></i>
                    إلغاء
                </a>
            </div>
        </form>
    </main>

    <script src="/assets/js/editor.js"></script>
</body>
</html>
