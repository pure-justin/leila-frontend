#!/bin/bash

echo "🚀 Google Cloud Run with Artifact Registry"
echo "=========================================="

PROJECT_ID="leila-platform"
SERVICE_NAME="leila-frontend"
REGION="us-central1"
REPO_NAME="leila-repo"

# Create Artifact Registry repository
echo "📦 Setting up Artifact Registry..."
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID 2>/dev/null || echo "Repository already exists"

# Configure Docker for Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${SERVICE_NAME}"

# Build the image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.cloudrun -t $IMAGE_URI .

# Push the image
echo "📤 Pushing to Artifact Registry..."
docker push $IMAGE_URI

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_URI \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --concurrency 1000 \
  --max-instances 10 \
  --set-env-vars="NODE_ENV=production,PORT=8080" \
  --project $PROJECT_ID

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL! VERCEL CAN SUCK IT!"
    echo ""
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)')
    echo "🌐 Your app is live at: $SERVICE_URL"
    echo ""
    echo "🎉 Welcome to REAL infrastructure!"
else
    echo "❌ Deployment failed"
fi