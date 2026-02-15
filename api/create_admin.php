<?php
/**
 * إنشاء مستخدم admin افتراضي
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/database.php';

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إنشاء مستخدم Admin</title>
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
            margin-top: 10px;
        }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: bold; }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e9ecef;
            border-radius: 8px;
            font-size: 16px;
        }
        .users-list {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .user-item {
            padding: 10px;
            background: white;
            border-radius: 5px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>👤 إنشاء مستخدم Admin</h1>

<?php

try {
    $db = getDB();

    // Show existing users
    $stmt = $db->query("SELECT id, email, name, createdAt FROM User");
    $users = $stmt->fetchAll();

    if (!empty($users)) {
        echo '<div class="status info">';
        echo '📊 المستخدمون الموجودون (' . count($users) . '):';
        echo '</div>';

        echo '<div class="users-list">';
        foreach ($users as $user) {
            echo '<div class="user-item">';
            echo '<strong>' . htmlspecialchars($user['name'] ?? 'No name') . '</strong><br>';
            echo htmlspecialchars($user['email']);
            echo '</div>';
        }
        echo '</div>';
    }

    // Check if admin already exists
    $stmt = $db->prepare("SELECT id FROM User WHERE email = ?");
    $stmt->execute(['admin@blockcopy.com']);
    $adminExists = $stmt->fetch();

    if ($adminExists) {
        echo '<div class="status info">';
        echo '✅ مستخدم admin موجود بالفعل';
        echo '</div>';

        echo '<form method="POST">';
        echo '<div class="form-group">';
        echo '<label>كلمة المرور الجديدة:</label>';
        echo '<input type="password" name="new_password" placeholder="اتركه فارغاً للحفاظ على كلمة المرور الحالية">';
        echo '</div>';
        echo '<button type="submit" name="reset_password" class="btn">🔄 إعادة تعيين كلمة المرور</button>';
        echo '</form>';

        // Handle password reset
        if (isset($_POST['reset_password']) && !empty($_POST['new_password'])) {
            $newPassword = password_hash($_POST['new_password'], PASSWORD_BCRYPT);
            $stmt = $db->prepare("UPDATE User SET password = ? WHERE email = ?");
            $stmt->execute([$newPassword, 'admin@blockcopy.com']);

            echo '<div class="status success">';
            echo '✅ تم تحديث كلمة المرور بنجاح!';
            echo '</div>';

            echo '<a href="test.html" class="btn">🧪 اختبار تسجيل الدخول</a>';
        }
    } else {
        echo '<div class="status error">';
        echo '❌ مستخدم admin غير موجود';
        echo '</div>';

        echo '<form method="POST">';
        echo '<div class="form-group">';
        echo '<label>اسم المستخدم:</label>';
        echo '<input type="text" name="name" value="Admin User" required>';
        echo '</div>';
        echo '<div class="form-group">';
        echo '<label>البريد الإلكتروني:</label>';
        echo '<input type="email" name="email" value="admin@blockcopy.com" required>';
        echo '</div>';
        echo '<div class="form-group">';
        echo '<label>كلمة المرور:</label>';
        echo '<input type="password" name="password" value="admin123" required>';
        echo '</div>';
        echo '<button type="submit" name="create_admin" class="btn">➕ إنشاء مستخدم Admin</button>';
        echo '</form>';

        // Handle admin creation
        if (isset($_POST['create_admin'])) {
            $name = $_POST['name'];
            $email = $_POST['email'];
            $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

            $stmt = $db->prepare("INSERT INTO User (name, email, password) VALUES (?, ?, ?)");
            $stmt->execute([$name, $email, $password]);

            echo '<div class="status success">';
            echo '✅ تم إنشاء مستخدم admin بنجاح!';
            echo '<br><br>';
            echo '<strong>بيانات الدخول:</strong><br>';
            echo 'Email: ' . htmlspecialchars($email) . '<br>';
            echo 'Password: ' . htmlspecialchars($_POST['password']);
            echo '</div>';

            echo '<a href="test.html" class="btn">🧪 اختبار تسجيل الدخول</a>';
        }
    }

} catch (Exception $e) {
    echo '<div class="status error">';
    echo '❌ حدث خطأ:<br><br>';
    echo htmlspecialchars($e->getMessage());
    echo '</div>';
}
?>

    </div>
</body>
</html>
