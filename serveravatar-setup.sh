#!/bin/bash
# سكريبت إعداد سريع لـ ServerAvatar

echo "🚀 إعداد BlockCopy على ServerAvatar"
echo "===================================="

# إعداد الأذونات
echo "📂 إعداد الأذونات..."
chmod -R 755 api/
chmod -R 644 api/**/*.php
chmod 644 api/.htaccess

# التأكد من وجود .env
if [ ! -f .env ]; then
    echo "⚙️  إنشاء ملف .env..."
    cp .env.example .env
    echo "⚠️  يرجى تعديل ملف .env بإعدادات قاعدة البيانات الصحيحة"
fi

# إعداد قاعدة البيانات
echo ""
echo "📊 إعدادات قاعدة البيانات:"
echo "1. افتح phpMyAdmin من لوحة تحكم ServerAvatar"
echo "2. استورد ملف api/database/setup.sql"
echo "3. غيّر الإعدادات في api/config/database.php"
echo ""
echo "إعدادات api/config/database.php الحالية:"
grep "define('DB_" api/config/database.php | head -4

# تثبيت المكتبات
echo ""
echo "📦 تثبيت مكتبات Node.js..."
npm install

echo ""
echo "✅ اكتمل الإعداد الأساسي!"
echo ""
echo "الخطوات التالية:"
echo "1. ارفع مجلد api إلى public_html عبر File Manager أو SFTP"
echo "2. غيّر إعدادات قاعدة البيانات في api/config/database.php"
echo "3. استورد setup.sql إلى قاعدة البيانات"
echo "4. شغّل Next.js: npm run dev"
echo "5. أضف إعدادات Nginx من SERVERAVATAR_SETUP.md"
