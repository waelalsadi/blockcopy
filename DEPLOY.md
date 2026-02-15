# دليل النشر

## 📤 رفع المشروع على GitHub

### 1. إنشاء repository جديد على GitHub
- اذهب إلى [github.com/new](https://github.com/new)
- أدخل اسم المستودع: `project-manager`
- اجعله Public أو Private حسب رغبتك
- لا تضف README أو .gitignore (لدينا بالفعل)

### 2. رفع المشروع

```bash
# داخل مجلد my-app

# إضافة remote (استبدل username باسم مستخدمك)
git remote add origin https://github.com/username/project-manager.git

# مراجعة الملفات التي سترفع
git status

# إضافة جميع الملفات
git add .

# عمل commit
git commit -m "الإصدار الأول: مدير المشاريع الذكي

المميزات:
- نظام مصادقة كامل
- إدارة المشاريع
- محرر نصوص غني
- تكامل مع الذكاء الاصطناعي
- إدارة الملفات
- محادثات ذكية"

# رفع إلى GitHub
git push -u origin main
```

## 🚀 النشر على Vercel

### الخطوات:

1. **اذهب إلى [vercel.com](https://vercel.com)**
2. **سجل الدخول بـ GitHub**
3. **اضغط "Add New Project"**
4. **استورد المشروع من GitHub**
5. **إعداد متغيرات البيئة**:
   - اذهب إلى "Settings" → "Environment Variables"
   - أضف كل المتغيرات من `.env.local`

### المتغيرات المطلوبة:
```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
```

6. **Deploy!**

## 🛠️ النشر على خادم خاص

### المتطلبات:
- Node.js 18+
- PM2 (للإدارة)
- Nginx (للـ reverse proxy)
- MySQL 8+

### الخطوات:

```bash
# 1. استنساخ المشروع
git clone https://github.com/username/project-manager.git
cd project-manager

# 2. تثبيت الاعتماديات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
nano .env.local  # عدل القيم

# 4. بناء المشروع
npm run build

# 5. تشغيل بـ PM2
pm2 start npm --name "project-manager" -- start

# 6. إعداد Nginx
sudo nano /etc/nginx/sites-available/project-manager
```

### إعداد Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/project-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 أمان إضافي

### 1. NextAuth Secret
```bash
openssl rand -base64 32
```
انسخ الناتج إلى `NEXTAUTH_SECRET`

### 2. Cloudinary
- استخدم حساب Cloudinary منفصل للإنتاج
- قم بتقييد نوعية الملفات

### 3. قاعدة البيانات
- استخدم مستخدم MySQL بصلاحيات محدودة
- فعّل SSL للاتصال
- خذ نسخ احتياطية منتظمة

## ✅ قائمة مراجعة ما قبل النشر

- [ ] كل المتغيرات مضبوطة
- [ ] قاعدة البيانات مهيأة (`npx prisma db push`)
- [ ] البناء ناجح (`npm run build`)
- [ ] اختبار تسجيل الدخول
- [ ] اختبار رفع الملفات
- [ ] اختبار الذكاء الاصطناعي
- [ ] SSL مفعّل
- [ ] نطاق مرتبط (Domain)

## 🐛 استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
```bash
# تحقق من صحة الرابط
npx prisma validate
```

### خطأ في Cloudinary
- تحقق من صحة المفاتيح
- تحقق من إعدادات CORS

### خطأ في NextAuth
- تأكد من `NEXTAUTH_SECRET`
- تأكد من `NEXTAUTH_URL`

## 📞 الدعم

إذا واجهت مشاكل، افتح issue على GitHub.

---

**بالتوفيق!** 🚀
