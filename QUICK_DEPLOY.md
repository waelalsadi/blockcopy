#!/bin/bash
# Quick Deploy Script - Copy PHP files to public_html

echo "🚀 BlockCopy - Quick Deploy"
echo "================================"

# Path to public_html
PUBLIC_HTML="/home/2LWnXk20zTjyMZrr/blockcopy/public_html"

# Copy PHP frontend files
echo "📁 Copying PHP frontend files..."
cp -r php/* "$PUBLIC_HTML/"

# Copy API files (if not exists)
echo "📁 Copying API files..."
if [ ! -d "$PUBLIC_HTML/api" ]; then
    cp -r api "$PUBLIC_HTML/"
fi

# Fix permissions
echo "🔒 Fixing permissions..."
chmod -R 755 "$PUBLIC_HTML"
find "$PUBLIC_HTML" -type f -name "*.php" -exec chmod 644 {} \;

echo "✅ Done!"
echo ""
echo "Now you can access:"
echo "  - Frontend: http://blockcopy.satest.online/"
echo "  - Install:  http://blockcopy.satest.online/install.php"
echo "  - Login:    http://blockcopy.satest.online/login.php"
