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
$projectId = $_GET['id'] ?? 0;

// Get project
$stmt = $db->prepare("SELECT * FROM Project WHERE id = ? AND userId = ?");
$stmt->execute([$projectId, $userId]);
$project = $stmt->fetch();

if (!$project) {
    header('Location: /projects.php');
    exit();
}

// Get related data
$stmt = $db->prepare("SELECT * FROM StartSection WHERE projectId = ?");
$stmt->execute([$projectId]);
$startSection = $stmt->fetch();

$stmt = $db->prepare("SELECT * FROM Block WHERE projectId = ? ORDER BY `order` ASC");
$stmt->execute([$projectId]);
$blocks = $stmt->fetchAll();

$stmt = $db->prepare("SELECT * FROM File WHERE projectId = ? ORDER BY createdAt DESC");
$stmt->execute([$projectId]);
$files = $stmt->fetchAll();

$stmt = $db->prepare("SELECT * FROM ChatMessage WHERE projectId = ? ORDER BY createdAt ASC LIMIT 50");
$stmt->execute([$projectId]);
$chatMessages = $stmt->fetchAll();

// Handle project update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'update') {
        $name = $_POST['name'] ?? '';
        $clientName = $_POST['client_name'] ?? '';
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? 'active';

        $stmt = $db->prepare("UPDATE Project SET name = ?, clientName = ?, description = ?, status = ? WHERE id = ? AND userId = ?");
        $stmt->execute([$name, $clientName, $description, $status, $projectId, $userId]);

        header('Location: /project.php?id=' . $projectId);
        exit();
    }

    if ($_POST['action'] === 'add_block') {
        $title = $_POST['title'] ?? '';
        $content = $_POST['content'] ?? '';

        $stmt = $db->prepare("INSERT INTO Block (projectId, title, content, `order`) VALUES (?, ?, ?, ?)");
        $stmt->execute([$projectId, $title, $content, count($blocks)]);

        header('Location: /project.php?id=' . $projectId);
        exit();
    }

    if ($_POST['action'] === 'delete') {
        $stmt = $db->prepare("DELETE FROM Project WHERE id = ? AND userId = ?");
        $stmt->execute([$projectId, $userId]);

        header('Location: /projects.php');
        exit();
    }
}

$statusText = ['active' => 'نشط', 'completed' => 'مكتمل', 'archived' => 'مؤرشف'];
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($project['name']); ?> - BlockCopy</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .block-item {
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            background: white;
        }
        .block-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .block-title {
            font-weight: bold;
            font-size: 18px;
        }
        .block-content {
            color: #6c757d;
            line-height: 1.6;
        }
        .tab-buttons {
            display: flex;
            gap: 10px;
            border-bottom: 1px solid #dee2e6;
            margin-bottom: 20px;
        }
        .tab-button {
            padding: 10px 20px;
            background: none;
            border: none;
            border-bottom: 2px solid transparent;
            cursor: pointer;
            font-size: 16px;
        }
        .tab-button.active {
            border-bottom-color: #667eea;
            color: #667eea;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
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
                <div class="project-status status-<?php echo $project['status']; ?>">
                    <?php echo $statusText[$project['status']] ?? $project['status']; ?>
                </div>
                <h1><?php echo htmlspecialchars($project['name']); ?></h1>
                <p><?php echo htmlspecialchars($project['clientName'] ?? 'بدون عميل'); ?></p>
            </div>
            <div class="header-actions">
                <button onclick="openEditModal()" class="btn btn-secondary">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button onclick="confirmDelete()" class="btn btn-danger">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>

        <!-- Tabs -->
        <div class="tab-buttons">
            <button class="tab-button active" onclick="showTab('overview')">نظرة عامة</button>
            <button class="tab-button" onclick="showTab('blocks')">الأقسام</button>
            <button class="tab-button" onclick="showTab('files')">الملفات</button>
            <button class="tab-button" onclick="showTab('chat')">الدردشة</button>
        </div>

        <!-- Overview Tab -->
        <div id="tab-overview" class="tab-content active">
            <div class="card">
                <h3>الوصف</h3>
                <p><?php echo nl2br(htmlspecialchars($project['description'] ?? 'لا يوجد وصف')); ?></p>
            </div>

            <?php if ($project['content']): ?>
            <div class="card">
                <h3>المحتوى</h3>
                <div class="content-body">
                    <?php echo nl2br(htmlspecialchars($project['content'])); ?>
                </div>
            </div>
            <?php endif; ?>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #667eea;">
                        <i class="fas fa-cube"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo count($blocks); ?></h3>
                        <p>قسم</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #28a745;">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo count($files); ?></h3>
                        <p>ملف</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #ffc107;">
                        <i class="fas fa-comment"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo count($chatMessages); ?></h3>
                        <p>رسالة</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Blocks Tab -->
        <div id="tab-blocks" class="tab-content">
            <div class="section-header">
                <h3>الأقسام</h3>
                <button onclick="openAddBlockModal()" class="btn btn-primary">
                    <i class="fas fa-plus"></i>
                    إضافة قسم
                </button>
            </div>

            <?php foreach ($blocks as $block): ?>
            <div class="block-item">
                <div class="block-header">
                    <span class="block-title"><?php echo htmlspecialchars($block['title']); ?></span>
                </div>
                <div class="block-content">
                    <?php echo nl2br(htmlspecialchars($block['content'])); ?>
                </div>
            </div>
            <?php endforeach; ?>

            <?php if (empty($blocks)): ?>
            <div class="empty-state">
                <i class="fas fa-cube"></i>
                <p>لا توجد أقسام بعد</p>
            </div>
            <?php endif; ?>
        </div>

        <!-- Files Tab -->
        <div id="tab-files" class="tab-content">
            <div class="section-header">
                <h3>الملفات</h3>
            </div>

            <?php foreach ($files as $file): ?>
            <div class="file-item">
                <i class="fas fa-file"></i>
                <div>
                    <strong><?php echo htmlspecialchars($file['name']); ?></strong>
                    <p><?php echo date('Y/m/d H:i', strtotime($file['createdAt'])); ?></p>
                </div>
            </div>
            <?php endforeach; ?>

            <?php if (empty($files)): ?>
            <div class="empty-state">
                <i class="fas fa-file"></i>
                <p>لا توجد ملفات بعد</p>
            </div>
            <?php endif; ?>
        </div>

        <!-- Chat Tab -->
        <div id="tab-chat" class="tab-content">
            <div class="chat-container">
                <div class="chat-messages">
                    <?php foreach ($chatMessages as $msg): ?>
                    <div class="chat-message chat-message-<?php echo $msg['role']; ?>">
                        <div class="message-content">
                            <?php echo nl2br(htmlspecialchars($msg['content'])); ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <div class="chat-input">
                    <textarea id="chatInput" placeholder="اكتب رسالة..."></textarea>
                    <button onclick="sendMessage()" class="btn btn-primary">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </main>

    <!-- Edit Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>تعديل المشروع</h3>
                <button onclick="closeEditModal()" class="modal-close">&times;</button>
            </div>
            <form method="POST" action="/project.php?id=<?php echo $projectId; ?>">
                <input type="hidden" name="action" value="update">

                <div class="form-group">
                    <label>اسم المشروع</label>
                    <input type="text" name="name" required value="<?php echo htmlspecialchars($project['name']); ?>">
                </div>

                <div class="form-group">
                    <label>اسم العميل</label>
                    <input type="text" name="client_name" value="<?php echo htmlspecialchars($project['clientName'] ?? ''); ?>">
                </div>

                <div class="form-group">
                    <label>الحالة</label>
                    <select name="status">
                        <option value="active" <?php echo $project['status'] === 'active' ? 'selected' : ''; ?>>نشط</option>
                        <option value="completed" <?php echo $project['status'] === 'completed' ? 'selected' : ''; ?>>مكتمل</option>
                        <option value="archived" <?php echo $project['status'] === 'archived' ? 'selected' : ''; ?>>مؤرشف</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>الوصف</label>
                    <textarea name="description" rows="4"><?php echo htmlspecialchars($project['description'] ?? ''); ?></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                    <button type="button" onclick="closeEditModal()" class="btn btn-secondary">إلغاء</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Add Block Modal -->
    <div id="addBlockModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>إضافة قسم جديد</h3>
                <button onclick="closeAddBlockModal()" class="modal-close">&times;</button>
            </div>
            <form method="POST" action="/project.php?id=<?php echo $projectId; ?>">
                <input type="hidden" name="action" value="add_block">

                <div class="form-group">
                    <label>عنوان القسم</label>
                    <input type="text" name="title" required>
                </div>

                <div class="form-group">
                    <label>المحتوى</label>
                    <textarea name="content" rows="6"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">إضافة</button>
                    <button type="button" onclick="closeAddBlockModal()" class="btn btn-secondary">إلغاء</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <form method="POST" action="/project.php?id=<?php echo $projectId; ?>">
        <input type="hidden" name="action" value="delete">
        <div id="deleteModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تأكيد الحذف</h3>
                    <button onclick="closeDeleteModal()" class="modal-close">&times;</button>
                </div>
                <p>هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.</p>
                <div class="form-actions">
                    <button type="submit" class="btn btn-danger">نعم، احذف المشروع</button>
                    <button type="button" onclick="closeDeleteModal()" class="btn btn-secondary">إلغاء</button>
                </div>
            </div>
        </div>
    </form>

    <script>
    function showTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));

        document.getElementById('tab-' + tabName).classList.add('active');
        event.target.classList.add('active');
    }

    function openEditModal() {
        document.getElementById('editModal').style.display = 'flex';
    }

    function closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    function openAddBlockModal() {
        document.getElementById('addBlockModal').style.display = 'flex';
    }

    function closeAddBlockModal() {
        document.getElementById('addBlockModal').style.display = 'none';
    }

    function confirmDelete() {
        document.getElementById('deleteModal').style.display = 'flex';
    }

    function closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
    }

    function sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (message) {
            // Add message to UI
            const chatMessages = document.querySelector('.chat-messages');
            chatMessages.innerHTML += `
                <div class="chat-message chat-message-user">
                    <div class="message-content">${message}</div>
                </div>
            `;

            input.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Send to API
            fetch('/api/chat/index.php?projectId=<?php echo $projectId; ?>', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content: message })
            });
        }
    }

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
    </script>
</body>
</html>
