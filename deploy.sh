#!/bin/bash

# سكربت نشر المشروع على ServerAvatar
# هذا السكربت يُنفذ على الخادم

echo "🚀 بدء نشر مدير المشاريع..."

# إنشاء مجلد Logs
mkdir -p logs

# تثبيت الاعتماديات
echo "📦 تثبيت الاعتماديات..."
npm install

# توليد Prisma Client
echo "🔄 توليد Prisma Client..."
npx prisma generate

# بناء المشروع
echo "🏗️ بناء المشروع..."
npm run build

# التحقق من وجود PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 غير مثبت. جاري التثبيت..."
    npm install -g pm2
fi

# إيقاف التطبيق إذا كان يعمل
pm2 stop project-manager 2>/dev/null || true

# بدء التطبيق
echo "🚀 بدء التطبيق..."
pm2 start ecosystem.config.js

# حفظ إعدادات PM2
pm2 save

echo "✅ تم النشر بنجاح!"
echo "📊 حالة التطبيق:"
pm2 status

echo ""
echo "📋 الأوامر المفيدة:"
echo "  - عرض السجلات: pm2 logs project-manager"
echo "  - إعادة تشغيل: pm2 restart project-manager"
echo "  - إيقاف: pm2 stop project-manager"
echo ""
echo "🌐 الموقع يعمل على: http://$(hostname -I | awk '{print $1}'):3000"
