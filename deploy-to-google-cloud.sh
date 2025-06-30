#!/bin/bash

echo "🚀 GOOGLE CLOUD RUN DEPLOYMENT SETUP"
echo "===================================="
echo "The REAL deal - not some budget bullshit"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Installing..."
    echo "Run: brew install google-cloud-sdk"
    exit 1
fi

PROJECT_ID="leila-platform"
SERVICE_NAME="leila-frontend"
REGION="us-central1"

echo "📋 Deployment Steps:"
echo ""
echo "1️⃣ Set up Google Cloud Project"
echo "   gcloud auth login"
echo "   gcloud projects create $PROJECT_ID --name='Leila Home Services'"
echo "   gcloud config set project $PROJECT_ID"
echo ""
echo "2️⃣ Enable required APIs"
echo "   gcloud services enable run.googleapis.com"
echo "   gcloud services enable cloudbuild.googleapis.com"
echo "   gcloud services enable artifactregistry.googleapis.com"
echo ""
echo "3️⃣ Deploy directly from source (no Docker BS needed)"
echo "   gcloud run deploy $SERVICE_NAME \\"
echo "     --source . \\"
echo "     --region $REGION \\"
echo "     --platform managed \\"
echo "     --allow-unauthenticated \\"
echo "     --memory 2Gi \\"
echo "     --cpu 2 \\"
echo "     --timeout 60 \\"
echo "     --concurrency 1000 \\"
echo "     --max-instances 100"
echo ""
echo "💰 PRICING:"
echo "   - First 2 million requests/month: FREE"
echo "   - 360,000 vCPU-seconds/month: FREE"
echo "   - 180,000 GiB-seconds/month: FREE"
echo "   - After that: ~$40-100/month for most apps"
echo ""
echo "🔥 BENEFITS over Vercel:"
echo "   ✅ No build timeouts"
echo "   ✅ No memory limits (up to 32GB)"
echo "   ✅ WebSocket support"
echo "   ✅ Same ecosystem as Firebase"
echo "   ✅ Global CDN included"
echo "   ✅ Auto-scaling to millions of requests"
echo "   ✅ Built-in monitoring and logging"
echo ""
echo "Ready to deploy? Run this script with 'deploy' argument:"
echo "./deploy-to-google-cloud.sh deploy"

# Handle deployment
if [ "$1" = "deploy" ]; then
    echo ""
    echo "🚀 DEPLOYING TO GOOGLE CLOUD RUN..."
    echo ""
    
    # Build the app first
    echo "📦 Building Next.js app..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed! Fix errors before deploying."
        exit 1
    fi
    
    echo ""
    echo "☁️  Deploying to Cloud Run..."
    gcloud run deploy $SERVICE_NAME \
        --source . \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --memory 2Gi \
        --cpu 2 \
        --timeout 60 \
        --concurrency 1000 \
        --max-instances 100 \
        --set-env-vars="NODE_ENV=production"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ DEPLOYMENT SUCCESSFUL!"
        echo ""
        SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
        echo "🌐 Your app is live at: $SERVICE_URL"
        echo ""
        echo "📊 View logs: gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME' --limit 50"
        echo "📈 View metrics: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics"
    else
        echo "❌ Deployment failed! Check the errors above."
    fi
fi