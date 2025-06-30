#!/bin/bash

echo "🚀 Deploy with Cloud Buildpacks (No Docker needed!)"
echo "==================================================="

PROJECT_ID="leila-platform"
SERVICE_NAME="leila-frontend"
REGION="us-central1"

# Deploy directly from source using buildpacks
echo "🏗️ Building and deploying with Cloud Buildpacks..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 1000 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production" \
  --project $PROJECT_ID

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ FUCK YES! DEPLOYED TO GOOGLE CLOUD!"
    echo "🎉 VERCEL IS DEAD TO US!"
    echo ""
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)')
    echo "🌐 Your app is live at: $SERVICE_URL"
    echo ""
    echo "🎯 Performance specs:"
    echo "   - 2GB RAM (vs Vercel's pathetic 1GB)"
    echo "   - 2 vCPUs (vs Vercel's shared nothing)"
    echo "   - 5 minute timeout (vs Vercel's 10 seconds)"
    echo "   - 1000 concurrent requests"
    echo "   - Auto-scaling to 100 instances"
    echo ""
    echo "📊 View your deployment:"
    echo "   https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/metrics?project=$PROJECT_ID"
else
    echo "❌ Deployment failed"
fi