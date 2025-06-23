#!/bin/bash
# Emergency build script - builds only core pages

echo "🚨 Emergency build mode - minimal pages only"

# Backup non-essential pages
mkdir -p .backup-pages

# Move heavy pages temporarily
mv app/admin .backup-pages/ 2>/dev/null || true
mv app/contractor .backup-pages/ 2>/dev/null || true
mv app/solar-analysis .backup-pages/ 2>/dev/null || true
mv app/api-health .backup-pages/ 2>/dev/null || true

# Remove all images except essentials
find public/images/services -type f ! -name "*-1-thumb.webp" ! -name "*-1.webp" ! -name "placeholder.jpg" -delete 2>/dev/null || true

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

echo "Building core pages only..."

# Build with minimal memory
NODE_OPTIONS='--max-old-space-size=2048' next build

# Restore pages after build
cp -r .backup-pages/* app/ 2>/dev/null || true
rm -rf .backup-pages

echo "✅ Emergency build complete"