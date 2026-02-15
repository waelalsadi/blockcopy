#!/bin/bash
# سكريبت لإصلاح هيكل المجلدات على ServerAvatar

echo "🔧 إصلاح هيكل المجلدات..."

# البحث عن مسار المشروع
PROJECT_PATH=$(pwd)
PUBLIC_PATH="/home/$(whoami)/public_html"

echo "📂 مسار المشروع: $PROJECT_PATH"
echo "📂 مسار public_html: $PUBLIC_PATH"

# نسخ مجلد api إلى public_html
echo "📦 نسخ مجلد api إلى public_html..."
cp -r "$PROJECT_PATH/api" "$PUBLIC_PATH/"

# إصلاح الأذونات
echo "🔒 إصلاح الأذونات..."
chmod -R 755 "$PUBLIC_PATH/api"
find "$PUBLIC_PATH/api" -type f -name "*.php" -exec chmod 644 {} \;
chmod 644 "$PUBLIC_PATH/api/.htaccess"

echo "✅ تم!"
echo ""
echo "الآن يمكن الوصول إلى:"
echo "  - PHP API: http://blockcopy.tempavatar.click/api/auth/login"
echo "  - Frontend: سيتم تشغيله عبر Node.js على المنفذ 3000"
