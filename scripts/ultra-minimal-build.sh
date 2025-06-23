#!/bin/bash
# Ultra-minimal build for extreme memory constraints

echo "🚀 Starting ultra-minimal build..."

# Set aggressive memory constraints
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1
export DISABLE_SERVERLESS_FUNCTION_BUILDER=1

# Clean everything
rm -rf .next
rm -rf node_modules/.cache
rm -rf public/images/services/*/*-[2-4].*
rm -rf public/images/services/*/*-large.*

# Remove non-critical pages during build
mkdir -p .backup-pages
mv app/admin .backup-pages/ 2>/dev/null || true
mv app/contractor .backup-pages/ 2>/dev/null || true
mv app/solar-analysis .backup-pages/ 2>/dev/null || true

# Build with minimal config
node --max-old-space-size=3072 --optimize-for-size node_modules/.bin/next build -c next.config.production.js

# Restore pages after build
mv .backup-pages/* app/ 2>/dev/null || true
rm -rf .backup-pages

echo "✅ Ultra-minimal build complete"