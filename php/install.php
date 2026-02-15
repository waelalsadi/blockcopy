<?php
/**
 * BlockCopy - Installation & Verification
 * ملف التثبيت والتحقق الشامل
 */

// Set timezone
date_default_timezone_set('UTC');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get current page URL
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$baseUrl = $protocol . '://' . $_SERVER['HTTP_HOST'];
$currentPath = dirname($_SERVER['PHP_SELF']);

// Helper function
function showStatus($label, $value, $status = 'success') {
    $statusClass = $status;
    $statusIcon = $status === 'success' ? '✅' : ($status === 'error' ? '❌' : '⚠️');
    $bgColor = $status === 'success' ? '#d4edda' : ($status === 'error' ? '#f8d7da' : '#fff3cd');
    $textColor = $status === 'success' ? '#155724' : ($status === 'error' ? '#721c24' : '#856404');

    echo '<div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; background: ' . $bgColor . '; border-radius: 8px;">';
    echo '<span><strong>' . $label . '</strong></span>';
    echo '<span style="color: ' . $textColor . '; font-weight: bold;">' . $statusIcon . ' ' . $value . '</span>';
    echo '</div>';
}

// Handle installation
$installMessage = '';
$installStatus = '';

if (isset($_POST['action'])) {
    if ($_POST['action'] === 'install_db' && isset($_POST['db_host']) && isset($_POST['db_name']) && isset($_POST['db_user']) && isset($_POST['db_pass'])) {
        try {
            $dbHost = $_POST['db_host'];
            $dbName = $_POST['db_name'];
            $dbUser = $_POST['db_user'];
            $dbPass = $_POST['db_pass'];

            // Test connection
            try {
                $dsn = "mysql:host=$dbHost;charset=utf8mb4";
                $testConn = new PDO($dsn, $dbUser, $dbPass);
                $testConn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                // Create database if not exists
                $testConn->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $testConn->exec("USE `$dbName`");

                // Read and execute SQL file
                $sqlFile = __DIR__ . '/../api/database/setup.sql';
                if (file_exists($sqlFile)) {
                    $sql = file_get_contents($sqlFile);

                    // Remove comments and split statements
                    $sql = preg_replace('/--.*$/m', '', $sql);
                    $statements = array_filter(array_map('trim', explode(';', $sql)));

                    foreach ($statements as $statement) {
                        if (!empty($statement)) {
                            $testConn->exec($statement);
                        }
                    }

                    // Update database config
                    $configFile = __DIR__ . '/../api/config/database.php';
                    $configContent = '<?php
define("DB_HOST", "' . $dbHost . '");
define("DB_NAME", "' . $dbName . '");
define("DB_USER", "' . $dbUser . '");
define("DB_PASS", "' . $dbPass . '");
define("DB_CHARSET", "utf8mb4");

class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }

    private function __clone() {}

    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

function getDB() {
    return Database::getInstance()->getConnection();
}';

                    if (file_put_contents($configFile, $configContent)) {
                        $installStatus = 'success';
                        $installMessage = 'تم تثبيت قاعدة البيانات بنجاح! يمكنك الآن استخدام النظام.';
                    } else {
                        $installStatus = 'error';
                        $installMessage = 'فشل تحديث ملف الإعدادات. تأكد من صلاحيات الكتابة.';
                    }
                } else {
                    $installStatus = 'error';
                    $installMessage = 'ملف setup.sql غير موجود!';
                }
            } else {
                throw new Exception('فشل الاتصال بقاعدة البيانات');
            }
        } catch (Exception $e) {
            $installStatus = 'error';
            $installMessage = 'خطأ: ' . $e->getMessage();
        }
    }

    if ($_POST['action'] === 'create_admin' && isset($_POST['admin_name']) && isset($_POST['admin_email']) && isset($_POST['admin_pass'])) {
        try {
            require_once __DIR__ . '/../api/config/database.php';
            $db = getDB();

            $name = trim($_POST['admin_name']);
            $email = trim($_POST['admin_email']);
            $password = password_hash($_POST['admin_pass'], PASSWORD_BCRYPT);

            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM User WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetch()) {
                $installStatus = 'error';
                $installMessage = 'البريد الإلكتروني مسجل مسبقاً!';
            } else {
                $stmt = $db->prepare("INSERT INTO User (name, email, password) VALUES (?, ?, ?)");
                $stmt->execute([$name, $email, $password]);

                $installStatus = 'success';
                $installMessage = 'تم إنشاء مستخدم admin بنجاح! يمكنك الآن تسجيل الدخول.';
            }
        } catch (Exception $e) {
            $installStatus = 'error';
            $installMessage = 'خطأ: ' . $e->getMessage();
        }
    }

    if ($_POST['action'] === 'check_delete') {
        $fileToDelete = $_POST['file'] ?? '';
        if ($fileToDelete && file_exists(__DIR__ . '/' . $fileToDelete)) {
            if (unlink(__DIR__ . '/' . $fileToDelete)) {
                $installStatus = 'success';
                $installMessage = 'تم حذف الملف بنجاح!';
            } else {
                $installStatus = 'error';
                $installMessage = 'فشل حذف الملف. تأكد من الصلاحيات.';
            }
        }
    }
}

// Get current database config
$dbConfig = [];
$configFile = __DIR__ . '/../api/config/database.php';
if (file_exists($configFile)) {
    $configContent = file_get_contents($configFile);
    preg_match("/define\('DB_HOST', '([^']+)'\)/", $configContent, $hostMatch);
    preg_match("/define\('DB_NAME', '([^']+)'\)/", $configContent, $nameMatch);
    preg_match("/define\('DB_USER', '([^']+)'\)/", $configContent, $userMatch);

    $dbConfig = [
        'host' => $hostMatch[1] ?? '',
        'name' => $nameMatch[1] ?? '',
        'user' => $userMatch[1] ?? ''
    ];
}

// Check PHP version
$phpVersion = phpversion();
$phpVersionValid = version_compare($phpVersion, '7.4', '>=');

// Check extensions
$extensions = [
    'pdo' => extension_loaded('pdo'),
    'pdo_mysql' => extension_loaded('pdo_mysql'),
    'json' => extension_loaded('json'),
    'mbstring' => extension_loaded('mbstring'),
    'session' => extension_loaded('session'),
];

// Check directories
$directories = [
    'assets' => is_dir(__DIR__ . '/assets'),
    'api' => is_dir(__DIR__ . '/../api'),
    'api/auth' => is_dir(__DIR__ . '/../api/auth'),
    'api/projects' => is_dir(__DIR__ . '/../api/projects'),
];

// Check files
$files = [
    'index.php' => file_exists(__DIR__ . '/index.php'),
    'login.php' => file_exists(__DIR__ . '/login.php'),
    'api/config/database.php' => file_exists(__DIR__ . '/../api/config/database.php'),
];

// Check permissions
$permissions = [
    'api/config' => is_writable(__DIR__ . '/../api/config'),
];

// Check database connection
$dbConnected = false;
$dbTables = [];
$dbAdminExists = false;

if (!empty($dbConfig['host']) && !empty($dbConfig['name'])) {
    try {
        require_once __DIR__ . '/../api/config/database.php';
        $db = getDB();
        $dbConnected = true;

        // Get tables
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        $expectedTables = ['User', 'Session', 'Project', 'Block', 'File', 'ChatMessage', 'StartSection'];
        $dbTables = array_intersect($tables, $expectedTables);

        // Check admin user
        $stmt = $db->query("SELECT COUNT(*) FROM User WHERE email = 'admin@blockcopy.com'");
        $dbAdminExists = $stmt->fetchColumn() > 0;

    } catch (Exception $e) {
        // Database not connected
    }
}

// Overall status
$totalChecks = 1 + count($extensions) + count($directories) + count($files) + count($permissions);
$passedChecks = $phpVersionValid + array_sum($extensions) + array_sum($directories) + array_sum($files) + array_sum($permissions);
if ($dbConnected) $passedChecks += 2;
$totalChecks += 2;

$percentage = $totalChecks > 0 ? round(($passedChecks / $totalChecks) * 100) : 0;

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>التثبيت والتحقق - BlockCopy</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .card h2 {
            color: #667eea;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .progress-bar {
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 30px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 0.5s;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 14px;
        }
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-success {
            background: #28a745;
        }
        .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .alert-success {
            background: #d4edda;
            color: #155724;
        }
        .alert-error {
            background: #f8d7da;
            color: #721c24;
        }
        .warning-box {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .warning-box h4 {
            color: #856404;
            margin-bottom: 10px;
        }
        .code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .file-list {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: white;
            border-radius: 5px;
            margin-bottom: 10px;
        }
        .delete-btn {
            padding: 5px 10px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 BlockCopy</h1>
            <p>نظام إدارة المشاريع الذكي - التثبيت والتحقق</p>
        </div>

        <?php if ($installMessage): ?>
        <div class="alert alert-<?php echo $installStatus; ?>">
            <?php echo htmlspecialchars($installMessage); ?>
        </div>
        <?php endif; ?>

        <div class="card">
            <h2>📊 حالة النظام</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: <?php echo $percentage; ?>%">
                    <?php echo $percentage; ?>%
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🔧 فحص PHP والإضافات</h2>
            <?php showStatus('إصدار PHP', $phpVersion, $phpVersionValid ? 'success' : 'error'); ?>
            <?php
            foreach ($extensions as $ext => $enabled) {
                showStatus('Extension: ' . $ext, $enabled ? 'مفعّل' : 'غير مفعّل', $enabled ? 'success' : 'error');
            }
            ?>
        </div>

        <div class="card">
            <h2>📁 فحص المجلدات</h2>
            <?php
            foreach ($directories as $dir => $exists) {
                showStatus($dir, $exists ? 'موجود' : 'مفقود', $exists ? 'success' : 'error');
            }
            ?>
        </div>

        <div class="card">
            <h2>📄 فحص الملفات</h2>
            <?php
            foreach ($files as $file => $exists) {
                showStatus($file, $exists ? 'موجود' : 'مفقود', $exists ? 'success' : 'error');
            }
            ?>
        </div>

        <?php if (!$dbConnected): ?>
        <div class="card">
            <h2>🗄️ تثبيت قاعدة البيانات</h2>
            <p style="margin-bottom: 20px;">أدخل بيانات قاعدة البيانات للتثبيت:</p>

            <form method="POST">
                <input type="hidden" name="action" value="install_db">

                <div class="grid-2">
                    <div class="form-group">
                        <label>المضيف (Host)</label>
                        <input type="text" name="db_host" value="<?php echo htmlspecialchars($dbConfig['host'] ?: 'localhost'); ?>" required>
                    </div>
                    <div class="form-group">
                        <label>اسم قاعدة البيانات</label>
                        <input type="text" name="db_name" value="<?php echo htmlspecialchars($dbConfig['name'] ?: 'blockcopy'); ?>" required>
                    </div>
                    <div class="form-group">
                        <label>اسم المستخدم</label>
                        <input type="text" name="db_user" value="<?php echo htmlspecialchars($dbConfig['user'] ?: 'root'); ?>" required>
                    </div>
                    <div class="form-group">
                        <label>كلمة المرور</label>
                        <input type="password" name="db_pass">
                    </div>
                </div>

                <button type="submit" class="btn">🚀 تثبيت قاعدة البيانات</button>
            </form>
        </div>
        <?php else: ?>
        <div class="card">
            <h2>🗄️ قاعدة البيانات</h2>
            <?php showStatus('الاتصال بقاعدة البيانات', 'متصل', 'success'); ?>
            <?php showStatus('الجداول المثبتة', count($dbTables) . '/7', count($dbTables) == 7 ? 'success' : 'warning'); ?>

            <?php if (!empty($dbTables)): ?>
            <div class="code">الجداول: <?php echo implode(', ', $dbTables); ?></div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <?php if ($dbConnected && count($dbTables) >= 7): ?>
        <div class="card">
            <h2>👤 إنشاء مستخدم Admin</h2>
            <?php if ($dbAdminExists): ?>
            <div class="alert alert-success">
                ✅ مستخدم admin موجود بالفعل!
            </div>
            <?php else: ?>
            <form method="POST">
                <input type="hidden" name="action" value="create_admin">

                <div class="form-group">
                    <label>الاسم</label>
                    <input type="text" name="admin_name" value="Admin User" required>
                </div>
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" name="admin_email" value="admin@blockcopy.com" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور</label>
                    <input type="password" name="admin_pass" value="admin123" required>
                </div>

                <button type="submit" class="btn btn-success">➕ إنشاء مستخدم Admin</button>
            </form>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <div class="card">
            <h2>⚠️ ملفات يجب حذفها بعد التثبيت</h2>
            <p style="margin-bottom: 15px;">لأسباب أمنية، يجب حذف ملف التثبيت بعد الانتهاء:</p>

            <div class="file-list">
                <div class="file-item">
                    <span>📄 install.php (هذا الملف)</span>
                    <?php if (basename(__FILE__) === 'install.php'): ?>
                    <form method="POST" style="display: inline;">
                        <input type="hidden" name="action" value="check_delete">
                        <input type="hidden" name="file" value="install.php">
                        <button type="submit" class="delete-btn" onclick="return confirm('هل أنت متأكد من حذف هذا الملف؟')">🗑️ حذف</button>
                    </form>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <?php if ($dbConnected && count($dbTables) >= 7 && $dbAdminExists): ?>
        <div class="card" style="text-align: center;">
            <h2 style="justify-content: center; color: #28a745;">✅ النظام جاهز!</h2>
            <p style="font-size: 18px; margin-bottom: 20px;">تم التثبيت بنجاح. يمكنك الآن استخدام النظام.</p>

            <div style="display: flex; gap: 15px; justify-content: center;">
                <a href="/login.php" class="btn">🔑 تسجيل الدخول</a>
                <a href="/index.php" class="btn btn-success">🏠 الرئيسية</a>
            </div>

            <div class="warning-box" style="margin-top: 20px;">
                <h4>⚠️ هام جداً</h4>
                <p>قبل المتابعة، تأكد من حذف ملف install.php لأسباب أمنية.</p>
            </div>
        </div>
        <?php endif; ?>

        <div class="card">
            <h2>📖 معلومات النظام</h2>
            <div class="code">
                المسار: <?php echo __DIR__; ?><br>
                URL: <?php echo $baseUrl . $currentPath; ?><br>
                PHP: <?php echo $phpVersion; ?><br>
                الخادم: <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?>
            </div>
        </div>

        <div class="card" style="text-align: center;">
            <p style="color: #6c757d;">BlockCopy v1.0 - نظام إدارة المشاريع الذكي</p>
            <p style="color: #6c757d;">© 2026 - جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>
