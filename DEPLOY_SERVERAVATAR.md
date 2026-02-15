# النشر على ServerAvatar

## 🎯 الهدف
رفع المشروع على ServerAvatar على نفس IP قاعدة البيانات: `91.98.150.167`

## 📋 المتطلبات

### 1. إعدادات ServerAvatar
- PHP: غير مطلوب (Next.js يعمل على Node.js)
- Node.js: 18+ (متوفر في ServerAvatar)
- Port: 3000 (أو أي port متاح)

### 2. ملفات المشروع المحضرة
تم تجهيز الملفات التالية:
- ✅ `.env.local` - متغيرات البيئة (لا ترفع)
- ✅ `.env.example` - قالب للمتغيرات
- ✅ `ecosystem.config.js` - إعداد PM2
- ✅ `DEPLOY_SERVERAVATAR.md` - هذا الملف

## 🚀 خطوات النشر

### الخطوة 1: ضغط المشروع
```bash
# داخل مجلد my-app
# تأكد من أن node_modules لا ترفع
rm -rf node_modules
rm -rf .next

# ضغط المشروع
cd ..
zip -r project-manager.zip my-app -x "my-app/node_modules/*" "my-app/.next/*" "my-app/.git/*"
```

### الخطوة 2: رفع الملفات
```bash
# في ServerAvatar Terminal
# أو عبر SSH
cd /home/username
curl -o project-manager.zip "رابط_التحميل"
unzip project-manager.zip
cd my-app
```

### الخطوة 3: إعداد المشروع
```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إعداد Prisma
npx prisma generate

# 3. بناء المشروع
npm run build

# 4. تشغيل بـ PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### الخطوة 4: إعداد Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name your-domain.com;  # أو IP: 91.98.150.167

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📁 ملفات مهمة

### ecosystem.config.js (PM2)
```javascript
module.exports = {
  apps: [{
    name: 'project-manager',
    script: 'npm',
    args: 'start',
    cwd: '/home/username/my-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/username/logs/project-manager-error.log',
    out_file: '/home/username/logs/project-manager-out.log',
    time: true
  }]
};
```

### .env.local (على الخادم)
```env
# هذا الملف يُنشأ يدوياً على الخادم
# لا ترفعه مع المشروع

# Database (localhost لأننا على نفس الخادم)
DATABASE_URL="mysql://copywael:St%401088371529@localhost:3306/copywael"

# NextAuth
NEXTAUTH_URL="http://91.98.150.167"  # أو نطاقك
NEXTAUTH_SECRET="your-secret-here"

# Cloudinary
CLOUDINARY_CLOUD_NAME=dpuxysd8p
CLOUDINARY_API_KEY=617459669219474
CLOUDINARY_API_SECRET=yVUYEgVldEbKdPfidaDsUxlq3Ik
```

## ⚙️ إعدادات خاصة بـ ServerAvatar

### 1. إنشاء تطبيق Node.js
- اذهب إلى "Applications"
- اختر "Node.js"
- اسم التطبيق: `project-manager`
- Port: `3000`

### 2. إعداد Git (اختياري)
```bash
# داخل مجلد التطبيق
git init
git remote add origin https://github.com/username/project-manager.git
git pull origin main
```

### 3. الـ Startup Command
```bash
cd /home/username/applications/project-manager
npm install
npx prisma generate
npm run build
npm start
```

## 🔧 أوامر مفيدة

### إدارة PM2
```bash
# عرض الحالة
pm2 status

# إعادة تشغيل
pm2 restart project-manager

# السجلات
pm2 logs project-manager

# إيقاف
pm2 stop project-manager
```

### تحديث المشروع
```bash
cd /home/username/my-app

# سحب التحديثات (إذا كنت تستخدم Git)
git pull origin main

# أو رفع ملفات جديدة
# ثم:
npm install
npx prisma generate
npm run build
pm2 restart project-manager
```

## 🐛 استكشاف الأخطاء

### مشكلة: Port 3000 مشغول
```bash
# البحث عن العملية
lsof -i :3000

# قتل العملية
kill -9 <PID>

# أو تغيير Port في ecosystem.config.js
PORT: 3001
```

### مشكلة: خطأ في Prisma
```bash
# إعادة توليد Prisma Client
npx prisma generate

# التحقق من الاتصال
npx prisma db pull
```

### مشكلة: لا يمكن الوصول للموقع
```bash
# التحقق من Nginx
sudo nginx -t
sudo systemctl restart nginx

# التحقق من PM2
pm2 status
pm2 logs
```

## ✅ قائمة التحقق النهائية

قبل النشر، تأكد من:
- [ ] إنشاء `.env.local` على الخادم
- [ ] تغيير `DATABASE_URL` إلى `localhost`
- [ ] إنشاء مجلد `logs`
- [ ] فتح Port 3000 في الجدار الناري
- [ ] إعداد Nginx Reverse Proxy
- [ ] تشغيل `npx prisma db push`

## 📞 دعم

إذا واجهت مشاكل في ServerAvatar:
1. تحقق من سجلات الأخطاء: `pm2 logs`
2. تأكد من صلاحيات الملفات
3. تحقق من أن الخدمات تعمل

**بالتوفيق! 🚀**
