#!/bin/bash

# Deploy script for Vertex AI Memory System

echo "🚀 Deploying Vertex AI Memory System..."

# Set project variables
PROJECT_ID="leila-platform"
REGION="us-central1"
BUCKET_NAME="leila-ai-memory"

# 1. Set the project
echo "Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
echo "Enabling required Google Cloud APIs..."
gcloud services enable \
  cloudfunctions.googleapis.com \
  vertexai.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  pubsub.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com

# 3. Create storage bucket for memory
echo "Creating Cloud Storage bucket..."
gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME/ || echo "Bucket already exists"

# 4. Create Firestore database (if not exists)
echo "Setting up Firestore..."
gcloud firestore databases create --location=$REGION || echo "Firestore already exists"

# 5. Create PubSub topic
echo "Creating PubSub topic..."
gcloud pubsub topics create memory-updates || echo "Topic already exists"

# 6. Deploy Cloud Functions
echo "Deploying Cloud Functions..."

# Deploy memory API endpoint
gcloud functions deploy memoryApi \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./backend/cloud-functions \
  --entry-point=memoryApi \
  --trigger-http \
  --allow-unauthenticated \
  --memory=4GB \
  --cpu=4 \
  --timeout=540s \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,BUCKET_NAME=$BUCKET_NAME"

# Deploy background processor
gcloud functions deploy processMemoryUpdate \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./backend/cloud-functions \
  --entry-point=processMemoryUpdate \
  --trigger-topic=memory-updates \
  --memory=2GB \
  --timeout=300s \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,BUCKET_NAME=$BUCKET_NAME"

# Deploy file processor
gcloud functions deploy processLargeUpload \
  --gen2 \
  --runtime=nodejs20 \
  --region=$REGION \
  --source=./backend/cloud-functions \
  --entry-point=processLargeUpload \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=$BUCKET_NAME" \
  --memory=8GB \
  --cpu=4 \
  --timeout=540s \
  --set-env-vars="GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID,BUCKET_NAME=$BUCKET_NAME"

# 7. Create service account for Vertex AI
echo "Setting up service account..."
gcloud iam service-accounts create vertex-memory-sa \
  --display-name="Vertex AI Memory System" || echo "Service account exists"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-memory-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-memory-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:vertex-memory-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# 8. Create indexes for Firestore
echo "Creating Firestore indexes..."
cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "memory_contexts",
      "fields": [
        { "fieldPath": "type", "order": "ASCENDING" },
        { "fieldPath": "metadata.createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "memory_contexts",
      "fields": [
        { "fieldPath": "metadata.version", "order": "ASCENDING" },
        { "fieldPath": "metadata.createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
EOF

gcloud firestore indexes create --file=firestore.indexes.json

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env.local with:"
echo "   GOOGLE_CLOUD_PROJECT_ID=$PROJECT_ID"
echo "   MEMORY_API_URL=https://$REGION-$PROJECT_ID.cloudfunctions.net/memoryApi"
echo "   MEMORY_BUCKET=$BUCKET_NAME"
echo ""
echo "2. Set up Upstash Redis:"
echo "   Visit https://upstash.com and create a new Redis database"
echo "   Add UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN to .env.local"
echo ""
echo "3. Test the system:"
echo "   npm run test:memory"