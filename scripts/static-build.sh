#!/bin/bash
# Static export build - no server-side features

echo "📦 Building as static export..."

# Clean everything
rm -rf .next out

# Remove API routes (not supported in static export)
mv app/api .backup-api 2>/dev/null || true

# Build as static site
next build -c next.config.static.js

# Restore API routes
mv .backup-api app/api 2>/dev/null || true

echo "✅ Static build complete"