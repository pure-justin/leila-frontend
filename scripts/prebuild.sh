#!/bin/bash
# Pre-build cleanup script

echo "🧹 Pre-build cleanup..."

# Remove all cache directories
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.vite

# Remove unnecessary image files to reduce memory during build
find public/images/services -name "*-2.*" -delete 2>/dev/null || true
find public/images/services -name "*-3.*" -delete 2>/dev/null || true
find public/images/services -name "*-4.*" -delete 2>/dev/null || true
find public/images/services -name "*-large.*" -delete 2>/dev/null || true

echo "✅ Cleanup complete"