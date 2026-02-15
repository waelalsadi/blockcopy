<?php
session_start();
require_once __DIR__ . '/api/helpers/functions.php';

$error = '';
$success = '';

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        $data = $_POST;
    }

    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        $error = 'البريد الإلكتروني وكلمة المرور مطلوبان';
    } else {
        // API Call to login
        $apiUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/api/auth/login.php';
        $postData = json_encode(['email' => $email, 'password' => $password]);

        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $result = json_decode($response, true);

        if ($httpCode === 200 && isset($result['token'])) {
            $_SESSION['user_token'] = $result['token'];
            $_SESSION['user_id'] = $result['user']['id'];
            $_SESSION['user_name'] = $result['user']['name'];
            $_SESSION['user_email'] = $result['user']['email'];

            if (isset($data['redirect']) && $data['redirect'] === 'false') {
                echo json_encode(['success' => true, 'redirect' => '/index.php']);
                exit();
            }

            header('Location: /index.php');
            exit();
        } else {
            $error = $result['error'] ?? 'فشل تسجيل الدخول';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تسجيل الدخول - BlockCopy</title>
    <link rel="stylesheet" href="/assets/css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="auth-page">
    <div class="auth-container">
        <div class="auth-header">
            <h1>🚀 BlockCopy</h1>
            <p>تسجيل الدخول إلى حسابك</p>
        </div>

        <?php if ($error): ?>
        <div class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <?php echo htmlspecialchars($error); ?>
        </div>
        <?php endif; ?>

        <?php if ($success): ?>
        <div class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            <?php echo htmlspecialchars($success); ?>
        </div>
        <?php endif; ?>

        <form class="auth-form" method="POST" action="/login.php">
            <div class="form-group">
                <label for="email">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" required value="<?php echo htmlspecialchars($_POST['email'] ?? ''); ?>">
            </div>
            <div class="form-group">
                <label for="password">كلمة المرور</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">
                <i class="fas fa-sign-in-alt"></i>
                تسجيل الدخول
            </button>
        </form>

        <div class="auth-footer">
            <p>ليس لديك حساب؟ <a href="/register.php">إنشاء حساب جديد</a></p>
            <p><a href="/forgot-password.php">نسيت كلمة المرور؟</a></p>
        </div>

        <div class="demo-credentials">
            <p><strong>للتجربة:</strong></p>
            <p>البريد: admin@blockcopy.com</p>
            <p>كلمة المرور: admin123</p>
        </div>
    </div>

    <script>
    // AJAX Login
    document.querySelector('.auth-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            redirect: 'false'
        };

        try {
            const response = await fetch('/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = result.redirect;
            } else {
                location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    </script>
</body>
</html>
