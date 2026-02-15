<?php
/**
 * BlockCopy - Installation & Verification Script
 * ملف التثبيت والتحقق من النظام
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('UTC');

// HTML Header
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlockCopy - التثبيت والتحقق</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1em; }
        .content { padding: 40px; }
        .section {
            margin-bottom: 40px;
            padding: 25px;
            border-radius: 12px;
            background: #f8f9fa;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.5em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .check-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: white;
            border-radius: 8px;
            border: 2px solid #e9ecef;
        }
        .check-item.success { border-color: #28a745; }
        .check-item.error { border-color: #dc3545; }
        .check-item.warning { border-color: #ffc107; }
        .check-label { font-weight: 600; }
        .check-value { color: #6c757d; }
        .status {
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.warning { background: #fff3cd; color: #856404; }
        .btn {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            margin: 10px;
            transition: transform 0.2s;
        }
        .btn:hover { transform: scale(1.05); }
        .progress-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            transition: width 0.5s;
        }
        .code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 30px;
            background: #f8f9fa;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 BlockCopy</h1>
            <p>نظام إدارة المشاريع الذكي</p>
        </div>

        <div class="content">

<?php

// =============================================================================
// دالة عرض نتيجة الفحص
// =============================================================================
function showCheck($label, $value, $status = 'success', $details = '') {
    $statusClass = $status;
    $statusText = $status === 'success' ? '✅ يعمل' : ($status === 'error' ? '❌ خطأ' : '⚠️ تحذير');

    echo '<div class="check-item ' . $statusClass . '">';
    echo '<span class="check-label">' . $label . '</span>';
    echo '<span class="status ' . $statusClass . '">' . $statusText . '</span>';
    echo '</div>';

    if ($details) {
        echo '<div class="code">' . htmlspecialchars($details) . '</div>';
    }
}

// =============================================================================
// 1. فحص PHP Version & Extensions
// =============================================================================
$checks = [];
$phpVersion = phpversion();
$checks['php'] = version_compare($phpVersion, '7.4', '>=');

// =============================================================================
// 2. فحص المجلدات المطلوبة
// =============================================================================
$requiredDirs = [
    'auth' => 'مجلد المصادقة',
    'projects' => 'مجلد المشاريع',
    'blocks' => 'مجلد المحتوى',
    'files' => 'مجلد الملفات',
    'chat' => 'مجلد الدردشة',
    'start-section' => 'مجلد البداية',
    'config' => 'مجلد الإعدادات',
    'helpers' => 'مجلد المساعدات',
    'database' => 'مجلد قاعدة البيانات'
];

// =============================================================================
// 3. فحص الملفات المطلوبة
// =============================================================================
$requiredFiles = [
    'config/database.php' => 'ملف اتصال قاعدة البيانات',
    'helpers/functions.php' => 'ملف الدوال المساعدة',
    'database/setup.sql' => 'ملف سكريمة قاعدة البيانات',
    '.htaccess' => 'ملف إعدادات Apache'
];

// =============================================================================
// 4. فحص الاتصال بقاعدة البيانات
// =============================================================================
$dbConnected = false;
$dbConfig = [];
$dbTables = [];

try {
    require_once __DIR__ . '/config/database.php';
    $db = getDB();

    // فحص الاتصال
    $stmt = $db->query("SELECT 1");
    $dbConnected = true;

    // فحص الجداول
    $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $expectedTables = ['User', 'Session', 'Project', 'Block', 'File', 'ChatMessage', 'StartSection'];
    $dbTables = array_intersect($tables, $expectedTables);

} catch (Exception $e) {
    $dbError = $e->getMessage();
}

// =============================================================================
// 5. فحص الأذونات
// =============================================================================
$permissions = [];
$checkDirs = array_keys($requiredDirs);
foreach ($checkDirs as $dir) {
    if (is_dir(__DIR__ . '/' . $dir)) {
        $perms = substr(sprintf('%o', fileperms(__DIR__ . '/' . $dir)), -4);
        $permissions[$dir] = $perms;
    }
}

// =============================================================================
// 6. فحص API Endpoints
// =============================================================================
$apiEndpoints = [
    'auth/login.php' => 'POST /api/auth/login',
    'auth/register.php' => 'POST /api/auth/register',
    'auth/me.php' => 'GET /api/auth/me',
    'auth/logout.php' => 'POST /api/auth/logout',
    'projects/index.php' => 'GET/POST /api/projects',
    'projects/project.php' => 'GET/PUT/DELETE /api/projects/{id}',
    'blocks/index.php' => 'GET/POST/PUT /api/blocks',
    'chat/index.php' => 'GET/POST/DELETE /api/chat',
    'files/index.php' => 'GET/POST /api/files',
    'start-section/index.php' => 'GET/POST/PUT/DELETE /api/start-section'
];

// =============================================================================
// عرض النتائج
// =============================================================================

// 1. PHP Check
?>
            <div class="section">
                <h2>📌 فحص PHP والإضافات</h2>
                <?php
                showCheck('إصدار PHP', $phpVersion, $checks['php'] ? 'success' : 'error');
                showCheck('PDO Extension', extension_loaded('pdo') ? 'مفعّل' : 'غير مفعّل', extension_loaded('pdo') ? 'success' : 'error');
                showCheck('PDO MySQL', extension_loaded('pdo_mysql') ? 'مفعّل' : 'غير مفعّل', extension_loaded('pdo_mysql') ? 'success' : 'error');
                showCheck('JSON Extension', extension_loaded('json') ? 'مفعّل' : 'غير مفعّل', extension_loaded('json') ? 'success' : 'error');
                showCheck('MBString Extension', extension_loaded('mbstring') ? 'مفعّل' : 'غير مفعّل', extension_loaded('mbstring') ? 'success' : 'warning');
                ?>
            </div>

<?php
// 2. Directories Check
?>
            <div class="section">
                <h2>📁 فحص المجلدات</h2>
                <?php
                $dirSuccess = true;
                foreach ($requiredDirs as $dir => $name) {
                    $exists = is_dir(__DIR__ . '/' . $dir);
                    if (!$exists) $dirSuccess = false;
                    showCheck($name, $exists ? 'موجود' : 'مفقود', $exists ? 'success' : 'error');
                }
                ?>
            </div>

<?php
// 3. Files Check
?>
            <div class="section">
                <h2>📄 فحص الملفات</h2>
                <?php
                foreach ($requiredFiles as $file => $name) {
                    $exists = file_exists(__DIR__ . '/' . $file);
                    showCheck($name, $exists ? 'موجود' : 'مفقود', $exists ? 'success' : 'error');
                }
                ?>
            </div>

<?php
// 4. Database Check
?>
            <div class="section">
                <h2>🗄️ فحص قاعدة البيانات</h2>
                <?php
                if ($dbConnected) {
                    showCheck('الاتصال بقاعدة البيانات', 'متصل', 'success');

                    // عرض إعدادات قاعدة البيانات
                    echo '<div class="code">';
                    echo 'Host: ' . DB_HOST . '<br>';
                    echo 'Database: ' . DB_NAME . '<br>';
                    echo 'User: ' . DB_USER . '<br>';
                    echo '</div>';

                    // فحص الجداول
                    if (!empty($dbTables)) {
                        showCheck('الجداول المثبتة', count($dbTables) . ' من ' . count($expectedTables),
                            count($dbTables) == count($expectedTables) ? 'success' : 'warning');
                        echo '<div class="code">الجداول: ' . implode(', ', $dbTables) . '</div>';
                    } else {
                        showCheck('الجداول', 'لم يتم العثور على جداول', 'error');
                    }
                } else {
                    showCheck('الاتصال بقاعدة البيانات', 'فشل الاتصال', 'error');
                    if (isset($dbError)) {
                        echo '<div class="code">خطأ: ' . htmlspecialchars($dbError) . '</div>';
                    }
                }
                ?>
            </div>

<?php
// 5. API Endpoints
?>
            <div class="section">
                <h2>🔗 نقاط الاتصال (API Endpoints)</h2>
                <?php
                foreach ($apiEndpoints as $file => $endpoint) {
                    $exists = file_exists(__DIR__ . '/' . $file);
                    showCheck($endpoint, $exists ? 'جاهز' : 'مفقود', $exists ? 'success' : 'error');
                }
                ?>
            </div>

<?php
// 6. Permissions
?>
            <div class="section">
                <h2>🔒 الأذونات (Permissions)</h2>
                <?php
                foreach ($permissions as $dir => $perm) {
                    $isWritable = is_writable(__DIR__ . '/' . $dir);
                    showCheck($dir . ' (' . $perm . ')', $isWritable ? 'قابل للكتابة' : 'للقراءة فقط',
                        $isWritable ? 'success' : 'warning');
                }
                ?>
            </div>

<?php
// 7. Quick Install Button
if (!$dbConnected || count($dbTables) < count($expectedTables)) {
?>
            <div class="section" style="background: #fff3cd; border: 2px solid #ffc107;">
                <h2>⚠️ تثبيت قاعدة البيانات</h2>
                <p style="margin: 15px 0;">قاعدة البيانات غير مثبتة بشكل كامل. اضغط على الزر أدناه للتثبيت:</p>
                <a href="?action=install" class="btn" onclick="return confirm('هل تريد تثبيت قاعدة البيانات؟ سيتم حذف أي بيانات موجودة.')">🚀 تثبيت قاعدة البيانات</a>
            </div>
<?php
}

// Handle database installation
if (isset($_GET['action']) && $_GET['action'] === 'install') {
    try {
        require_once __DIR__ . '/config/database.php';
        $db = getDB();

        // Read and execute SQL file
        $sql = file_get_contents(__DIR__ . '/database/setup.sql');

        // Remove comments and split statements
        $sql = preg_replace('/--.*$/m', '', $sql);
        $statements = array_filter(array_map('trim', explode(';', $sql)));

        foreach ($statements as $statement) {
            if (!empty($statement)) {
                $db->exec($statement);
            }
        }

        echo '<div class="section" style="background: #d4edda; border: 2px solid #28a745;">';
        echo '<h2>✅ تم التثبيت بنجاح!</h2>';
        echo '<p>تم تثبيت قاعدة البيانات بنجاح.</p>';
        echo '<a href="install.php" class="btn">🔄 إعادة التحقق</a>';
        echo '</div>';

    } catch (Exception $e) {
        echo '<div class="section" style="background: #f8d7da; border: 2px solid #dc3545;">';
        echo '<h2>❌ فشل التثبيت</h2>';
        echo '<p>خطأ: ' . htmlspecialchars($e->getMessage()) . '</p>';
        echo '</div>';
    }
}

// Calculate overall status
$totalChecks = 0;
$passedChecks = 0;
// Simple count based on checks above...

// Final Status
?>
            <div class="section">
                <h2>📊 حالة النظام</h2>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: <?php echo $dbConnected ? '90' : '50'; ?>%"></div>
                </div>
                <?php
                if ($dbConnected && count($dbTables) == count($expectedTables)) {
                    echo '<p style="text-align: center; color: #28a745; font-size: 1.2em; font-weight: bold;">✅ النظام جاهز للاستخدام!</p>';
                    echo '<p style="text-align: center;">يمكنك الآن استخدام الـ API:</p>';
                    echo '<div class="code">';
                    echo 'POST /api/auth/login.php<br>';
                    echo '{<br>';
                    echo '  "email": "admin@blockcopy.com",<br>';
                    echo '  "password": "admin123"<br>';
                    echo '}';
                    echo '</div>';
                } else {
                    echo '<p style="text-align: center; color: #dc3545; font-size: 1.2em; font-weight: bold;">⚠️ النظام غير جاهز</p>';
                    echo '<p style="text-align: center;">يرجى حل المشاكل المذكورة أعلاه.</p>';
                }
                ?>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="install.php" class="btn">🔄 إعادة الفحص</a>
                <a href="README.md" class="btn">📖 التوثيق</a>
            </div>

        </div>

        <div class="footer">
            <p>BlockCopy v1.0 - نظام إدارة المشاريع الذكي</p>
            <p>© 2026 - جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>
