#!/bin/bash

echo "🚀 Simple Google Cloud Run Deployment"
echo "======================================"

# First build the Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.cloudrun -t gcr.io/leila-platform/leila-frontend .

# Push to Google Container Registry
echo "📤 Pushing to Container Registry..."
docker push gcr.io/leila-platform/leila-frontend

# Deploy the image
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy leila-frontend \
  --image gcr.io/leila-platform/leila-frontend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 1000 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --project leila-platform

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ FUCK YES! DEPLOYED TO GOOGLE CLOUD!"
    echo ""
    SERVICE_URL=$(gcloud run services describe leila-frontend --region us-central1 --format 'value(status.url)')
    echo "🌐 Your app is live at: $SERVICE_URL"
    echo ""
    echo "🎉 VERCEL CAN SUCK IT!"
else
    echo "❌ Deployment failed"
fi