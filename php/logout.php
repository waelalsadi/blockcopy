<?php
session_start();

// Destroy session
$_SESSION = [];

if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 42000, '/');
}

session_destroy();

// Redirect to login
header('Location: /login.php');
exit();
