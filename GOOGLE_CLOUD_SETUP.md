# 🚀 Google Cloud Run - The REAL Solution

## Why Google Cloud Run Destroys Vercel

### Raw Power Comparison:

**Vercel (Toy Hosting):**
- ❌ 1GB memory limit (Pro: 3GB)
- ❌ 10 second API timeout (Pro: 60s)
- ❌ 50MB function size limit
- ❌ No WebSocket support
- ❌ Builds fail constantly
- ❌ $20/user/month + usage

**Google Cloud Run (Enterprise Infrastructure):**
- ✅ Up to 32GB memory per container
- ✅ 60 minute timeout (configurable)
- ✅ 10GB container size
- ✅ Full WebSocket support
- ✅ 99.95% SLA guarantee
- ✅ Pay only for what you use

## Setup Instructions

### 1. Prerequisites
```bash
# Install Google Cloud SDK
brew install google-cloud-sdk

# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create leila-home-services --name="Leila Home Services"
gcloud config set project leila-home-services

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
```

### 2. Enable Required APIs
```bash
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 3. Deploy Your App
```bash
# One command deployment - that's it!
./deploy-to-google-cloud.sh deploy
```

## Advanced Configuration

### Environment Variables
Create a `.env.yaml` file:
```yaml
NODE_ENV: production
NEXT_PUBLIC_FIREBASE_API_KEY: your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: your-domain
# ... other env vars
```

Deploy with env vars:
```bash
gcloud run deploy leila-frontend \
  --env-vars-file .env.yaml \
  --source .
```

### Custom Domain
```bash
# Map your domain
gcloud run domain-mappings create \
  --service leila-frontend \
  --domain heyleila.com \
  --region us-central1
```

### WebSocket Support
Cloud Run automatically supports WebSockets! Just deploy and it works.

### CI/CD with GitHub Actions
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_CREDENTIALS }}
      - uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: leila-frontend
          source: .
          region: us-central1
```

## Cost Breakdown

### Free Tier (Monthly):
- 2 million requests
- 360,000 vCPU-seconds
- 180,000 GiB-seconds
- 1 GiB network egress

### After Free Tier:
- ~$0.40 per million requests
- ~$0.084 per vCPU-hour
- ~$0.009 per GiB-hour

**Real world: Most apps stay under $100/month**

## Monitoring & Debugging

### View Logs
```bash
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### View Metrics
```bash
# Or use the console
open https://console.cloud.google.com/run
```

### SSH into Container (for debugging)
```bash
gcloud run services update leila-frontend --args="/bin/sh"
gcloud run services proxy leila-frontend
```

## Performance Optimizations

1. **Cold Start Optimization**
   - Set min-instances: 1 (keeps one warm)
   - Use --cpu-boost flag during startup

2. **Global Distribution**
   - Deploy to multiple regions
   - Use Cloud Load Balancing

3. **Caching**
   - Cloud CDN for static assets
   - Redis via Cloud Memorystore

## The Bottom Line

Google Cloud Run gives you:
- **Real infrastructure** (not toy limits)
- **Same ecosystem** as your Firebase backend
- **Proven scale** (YouTube, Gmail run on this)
- **Better pricing** than Vercel at scale
- **No vendor lock-in** (it's just containers)

Stop playing with amateur hour hosting. This is what real companies use.

Ready to deploy? Run:
```bash
./deploy-to-google-cloud.sh deploy
```