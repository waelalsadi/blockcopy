<?php
/**
 * ملف إصلاح جدول Session
 * Run this file to create the missing Session table
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/database.php';

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إصلاح جدول Session</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 { color: #667eea; text-align: center; margin-bottom: 30px; }
        .status {
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 18px;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.info { background: #d1ecf1; color: #0c5460; }
        .btn {
            display: block;
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
            margin-top: 20px;
        }
        .code {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            margin: 15px 0;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 إصلاح جدول Session</h1>

<?php

try {
    $db = getDB();

    // Check if Session table exists
    $stmt = $db->query("SHOW TABLES LIKE 'Session'");
    $exists = $stmt->fetch();

    if (!$exists) {
        // Create Session table
        $sql = "CREATE TABLE Session (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(255) NOT NULL UNIQUE,
            userId INT NOT NULL,
            expiresAt TIMESTAMP NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
            INDEX idx_token (token),
            INDEX idx_userId (userId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $db->exec($sql);

        echo '<div class="status success">';
        echo '✅ تم إنشاء جدول Session بنجاح!';
        echo '</div>';

        echo '<div class="status info">';
        echo '📊 الآن جميع الجداول جاهزة:<br><br>';
        echo '<strong>7/7 جداول مثبتة</strong>';
        echo '</div>';

        echo '<a href="install.php" class="btn">🔄 العودة للفحص</a>';
        echo '<a href="test.html" class="btn">🧪 اختبار الـ API</a>';

    } else {
        echo '<div class="status info">';
        echo '✅ جدول Session موجود بالفعل!';
        echo '</div>';

        // Show all tables
        $tables = $db->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
        echo '<div class="code">الجداول: ' . implode(', ', $tables) . '</div>';

        echo '<a href="install.php" class="btn">🔄 العودة للفحص</a>';
    }

} catch (Exception $e) {
    echo '<div class="status error">';
    echo '❌ حدث خطأ:<br><br>';
    echo htmlspecialchars($e->getMessage());
    echo '</div>';

    echo '<div class="code">';
    echo 'SQL:<br>';
    echo 'CREATE TABLE Session (<br>';
    echo '&nbsp;&nbsp;id INT AUTO_INCREMENT PRIMARY KEY,<br>';
    echo '&nbsp;&nbsp;token VARCHAR(255) NOT NULL UNIQUE,<br>';
    echo '&nbsp;&nbsp;userId INT NOT NULL,<br>';
    echo '&nbsp;&nbsp;expiresAt TIMESTAMP NOT NULL,<br>';
    echo '&nbsp;&nbsp;createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,<br>';
    echo '&nbsp;&nbsp;FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE<br>';
    echo ');';
    echo '</div>';
}
?>

    </div>
</body>
</html>
