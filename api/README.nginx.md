# إعدادات Nginx للـ API

## المشكلة
عند استخدام nginx، لا تعمل `.htaccess` ولذا الروابط مثل `/api/auth/login` لا تعمل.

## الحل

### الخيار 1: استخدم الروابط المباشرة (الأسهل)

بدلاً من:
```
/api/auth/login
```

استخدم:
```
/api/auth/login.php
```

### الخيار 2: أضف إعدادات nginx

من لوحة تحكم ServerAvatar:

1. اذهب إلى **Applications** > **Your App** > **Nginx**
2. أضف هذا الكود:

```nginx
location /api {
    alias /home/2LWnXk20zTjyMZrr/public_html/api;
    try_files $uri $uri/ @api;
}

location @api {
    rewrite ^/api/(.*)$ /api/index.php?q=$1 last;
}

location ~ ^//api/.*\.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### اختبار

بعد إضافة الإعدادات:

```bash
# امسح الكاش
sudo nginx -t
sudo systemctl reload nginx
```

ثم اختبر:
```bash
curl -X POST http://blockcopy.tempavatar.click/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blockcopy.com","password":"admin123"}'
```

## الروابط الصحيحة

### بدون إعدادات nginx (استخدم .php):
- `/api/auth/login.php`
- `/api/auth/register.php`
- `/api/auth/me.php`
- `/api/auth/logout.php`
- `/api/projects.php` (مع GET أو POST)
- `/api/projects/project.php?id=1`

### مع إعدادات nginx (بدون .php):
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/me`
- `/api/auth/logout`
- `/api/projects`
- `/api/projects/1`
