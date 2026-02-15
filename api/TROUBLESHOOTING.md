# حل مشكلة 403 Forbidden

## المشكلة
عند محاولة الوصول إلى الـ API تظهر رسالة:
```
403 Forbidden
nginx/1.24.0 (Ubuntu)
```

## الحلول

### الحل 1: تأكد من تفعيل PHP على الخادم

1. تحقق من تثبيت PHP-FPM:
```bash
php -v
```

2. تأكد من تشغيل PHP-FPM:
```bash
sudo systemctl status php8.1-fpm  # أو php8.2-fpm حسب الإصدار
```

3. إذا لم يكن مثبتاً، ثبت PHP-FPM:
```bash
sudo apt update
sudo apt install php-fpm php-mysql
```

### الحل 2: إعدادات nginx

أضف التالي إلى إعدادات nginx الخاص بك:

```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

ثم أعد تشغيل nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### الحل 3: إصلاح الأذونات

```bash
# تأكد من ملكية المجلدات
sudo chown -R www-data:www-data /path/to/public_html/api

# تأكد من صلاحيات القراءة والتنفيذ
sudo chmod -R 755 /path/to/public_html/api
```

### الحل 4: استخدام ملف index.php

إذا كنت تستخدم استضافة مشتركة (Shared Hosting):

1. تأكد من رفع جميع الملفات إلى `public_html/api`
2. تأكد من وجود ملف `.htaccess` في مجلد `api`
3. للوصول إلى API، استخدم الروابط:
   - `https://your-domain.com/api/auth/login`
   - `https://your-domain.com/api/projects`

### الحل 5: إعدادات cPanel

إذا كنت تستخدم cPanel:

1. تأكد من تفعيل PHP على حسابك
2. قد تحتاج لاختيار إصدار PHP من cPanel > Select PHP Version
3. تأكد من تثبيت PDO extension

### اختبار الـ API

بعد تطبيق الحل، اختبـر بهذا الأمر:

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blockcopy.com","password":"admin123"}'
```

## استضافة مشتركة (Shared Hosting)

إذا كنت تستخدم استضافة مشتركة ولم تنجح الحلول:

1. تأكد من رفع المجلدات كاملة:
   - `api/auth/`
   - `api/projects/`
   - `api/blocks/`
   - `api/config/`
   - `api/helpers/`
   - وغيرها...

2. تأكد من رفع ملف `.htaccess`

3. تحقق من error_log من cPanel

## للدعم الفني

إذا استمرت المشكلة:
1. راجع سجل الأخطاء: `/var/log/nginx/error.log`
2. تحقق من إعدادات firewall
3. تواصل مع الدعم الفني لاستضافتك
