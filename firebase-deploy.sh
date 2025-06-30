#!/bin/bash

echo "🔥 FIREBASE HOSTING - WORLD DOMINATION DEPLOYMENT"
echo "================================================="
echo ""
echo "🌍 Deploying to Firebase Hosting global CDN..."
echo "💪 150+ edge locations worldwide"
echo "⚡ 0ms cold starts, infinite scale"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already)
echo "🔐 Checking Firebase authentication..."
firebase login --no-localhost 2>/dev/null || echo "Already logged in to Firebase"

# Initialize Firebase if not already done
if [ ! -f "firebase.json" ]; then
    echo "🚀 Initializing Firebase project..."
    firebase init hosting --project leila-platform
fi

# Build the Next.js app for static export
echo "🏗️ Building Next.js for static export..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting --project leila-platform

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 WORLD DOMINATION INITIATED!"
    echo "==============================================="
    echo ""
    echo "🌐 Your app is live on Firebase global CDN:"
    echo "   https://leila-platform.web.app"
    echo "   https://leila-platform.firebaseapp.com"
    echo ""
    echo "🔥 Firebase Hosting Features:"
    echo "   ✅ Global CDN (150+ edge locations)"
    echo "   ✅ Free SSL certificates"
    echo "   ✅ Atomic deployments"
    echo "   ✅ Custom domain support"
    echo "   ✅ Unlimited bandwidth"
    echo "   ✅ Lightning fast delivery"
    echo ""
    echo "📊 View your deployment:"
    echo "   https://console.firebase.google.com/project/leila-platform/hosting"
    echo ""
    echo "🌍 Ready to take over the world!"
else
    echo "❌ Deployment failed! Check the errors above."
fi