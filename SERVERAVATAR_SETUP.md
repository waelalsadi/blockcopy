# إعداد BlockCopy على ServerAvatar

## 1. إعداد قاعدة البيانات

### من لوحة تحكم ServerAvatar:

1. اذهب إلى **Databases**
2. أنشئ قاعدة بيانات جديدة:
   - **Database Name**: `blockcopy` (أو أي اسم تفضله)
   - **Username**: `blockcopy` (أو أي اسم)
   - **Password**: (اختر كلمة مرور قوية)

3. استورد سكريمة قاعدة البيانات:
   - اذهب إلى **phpMyAdmin**
   - اختر قاعدة البيانات
   - اضغط **Import**
   - ارفع ملف `api/database/setup.sql`

### تحديث إعدادات قاعدة البيانات

في ملف `api/config/database.php`، غيّر:

```php
define('DB_HOST', 'localhost');  // غيّر هذا
define('DB_NAME', 'your_db_name');  // اسم قاعدة البيانات التي أنشأتها
define('DB_USER', 'your_db_user');  // اسم المستخدم
define('DB_PASS', 'your_db_password');  // كلمة المرور
```

---

## 2. إعداد PHP Backend

### في ServerAvatar:

1. اذهب إلى **Applications**
2. اذهب إلى تطبيق PHP
3. **System User**: جعل المستخدم صاحب المجلدات
4. **Document Root**: تأكد أنه `/public_html` أو مجلد الـ API

### رفع ملفات PHP:

**الخيار 1: SFTP/SSH**
```bash
cd public_html
mkdir -p api
# ارفع محتويات مجلد api
```

**الخيار 2: من File Manager في ServerAvatar**
1. افتح File Manager
2. ادخل إلى `public_html`
3. ارفع مجلد `api` كامل

### تأكد من الملفات المرفوعة:
```
public_html/
├── api/
│   ├── .htaccess
│   ├── index.php
│   ├── config/
│   ├── auth/
│   ├── projects/
│   ├── blocks/
│   ├── files/
│   ├── chat/
│   └── start-section/
```

---

## 3. إعداد Next.js Frontend

### في ServerAvatar - تطبيق Node.js:

**Application Settings:**
- **Application Name**: `blockcopy-frontend`
- **Application Root**: `/home/your-user/blockcopy` (مسار المشروع)
- **Startup Command**: `npm run dev`
- **Port**: `3000`

### قبل التشغيل:

1. **ثبت المكتبات:**
```bash
cd /path/to/your/project
npm install
```

2. **أنشئ ملف .env:**
```bash
nano .env
```

أضف:
```env
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

3. **تشغيل التطبيق:**
```bash
npm run dev
```

---

## 4. إعدادات Nginx

### من ServerAvatar:

اذهب إلى **Application Settings** > **Nginx Settings**

أضف هذا الكود:

```nginx
# PHP API
location ~ ^/api/.*\.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}

location /api {
    try_files $uri $uri/ /api/index.php?$query_string;
}

# Next.js Proxy
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 5. اختبار التطبيق

### اختبار PHP API:
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@blockcopy.com","password":"admin123"}'
```

### اختبار Next.js:
افتح المتصفح:
```
https://your-domain.com
```

---

## 6. حل المشاكل

### خطأ 403 على API:
- تأكد من صلاحيات المجلدات: `chmod 755 api`
- تأكد من تفعيل PHP-FPM

### خطأ 502 على Next.js:
- تأكد من تشغيل `npm run dev`
- تأكد من المنفذ 3000

### خطأ اتصال قاعدة البيانات:
- تحقق من البيانات في `api/config/database.php`
- تأكد من أن قاعدة البيانات تعمل

---

## 7. الروابط

بعد الإعداد الناجح:
- **Frontend**: `https://your-domain.com`
- **API**: `https://your-domain.com/api/*`
- **phpMyAdmin**: `https://your-domain.com/phpmyadmin`

---

## ملاحظة مهمة

للإنتاج (Production)، استخدم `npm run build` و `npm start` بدلاً من `npm run dev`.
