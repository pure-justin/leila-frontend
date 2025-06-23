#!/bin/bash
# Minimal build script for production
# Reduces memory usage by cleaning up before build

echo "🧹 Cleaning up before build..."

# Remove dev dependencies from node_modules
rm -rf node_modules/.cache
rm -rf node_modules/.vite
rm -rf node_modules/.turbo

# Clean Next.js cache
rm -rf .next/cache

# Remove source maps from previous builds
find .next -name "*.map" -type f -delete 2>/dev/null || true

# Clean up old build artifacts
rm -rf out
rm -rf build
rm -rf dist

echo "🔨 Starting optimized build..."

# Set production environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Run the build with memory limit
exec node --max-old-space-size=4096 node_modules/.bin/next build