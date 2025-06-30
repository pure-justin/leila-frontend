#!/bin/bash

echo "🔥 FIREBASE HOSTING - STATIC DEPLOYMENT"
echo "======================================="
echo ""

# Backup API routes temporarily
echo "📦 Backing up API routes..."
if [ -d "app/api" ]; then
    mv app/api app/api.backup
    echo "✅ API routes backed up to app/api.backup"
fi

# Build static export
echo "🏗️ Building static export..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Restoring API routes..."
    if [ -d "app/api.backup" ]; then
        mv app/api.backup app/api
    fi
    exit 1
fi

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting --project leila-platform

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 STATIC SITE DEPLOYED TO FIREBASE!"
    echo "===================================="
    echo ""
    echo "🌐 Your app is live:"
    echo "   https://leila-platform.web.app"
    echo "   https://leila-platform.firebaseapp.com"
    echo ""
    echo "⚡ Firebase Hosting Features:"
    echo "   ✅ Global CDN (150+ edge locations)"
    echo "   ✅ Lightning fast delivery"
    echo "   ✅ Automatic SSL"
    echo "   ✅ Custom domain ready"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Set up custom domain (heyleila.com)"
    echo "   2. Deploy API routes as Firebase Functions"
    echo "   3. Complete world domination"
    echo ""
else
    echo "❌ Deployment failed!"
fi

# Restore API routes
echo "🔄 Restoring API routes..."
if [ -d "app/api.backup" ]; then
    mv app/api.backup app/api
    echo "✅ API routes restored"
fi