# Vertex AI Memory System Setup Guide

## Overview
This hybrid memory system allows Claude to leverage Google's Gemini 2.5 Pro/Flash models with their 1M+ token context windows, effectively giving unlimited memory for large codebases and complex projects.

## Architecture
- **Claude Opus**: Primary AI for conversation and decision-making
- **Gemini 2.5 Pro**: Deep analysis with 2M+ token context
- **Gemini 2.5 Flash**: Fast retrieval and indexing with 1M+ tokens
- **Vertex AI**: Enterprise-grade infrastructure
- **Cloud Functions**: Scalable serverless processing
- **Redis**: Ultra-fast caching layer
- **Firestore**: Persistent metadata storage
- **Cloud Storage**: Large context storage (compressed)

## Setup Instructions

### 1. Prerequisites
- Google Cloud account with billing enabled
- Node.js 20+ installed
- gcloud CLI installed and configured
- Upstash Redis account (free tier works)

### 2. Environment Variables
Add to your `.env.local`:

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=leila-platform
GOOGLE_AI_API_KEY=your-gemini-api-key

# Memory System
MEMORY_API_URL=https://us-central1-leila-platform.cloudfunctions.net/memoryApi
MEMORY_BUCKET=leila-ai-memory

# Redis Cache (from Upstash)
UPSTASH_REDIS_URL=your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token

# Optional: Custom API key for memory system
MEMORY_API_KEY=your-custom-api-key
```

### 3. Deploy to Google Cloud

```bash
# Make deployment script executable
chmod +x backend/deploy-memory-system.sh

# Run deployment
./backend/deploy-memory-system.sh
```

### 4. Test the System

```bash
# Run test script
npx tsx test-memory-system.ts
```

## Usage Examples

### Store Entire Codebase
```typescript
// Claude can store the entire project
await claudeMemory.rememberCodebase('/path/to/project');
```

### Analyze with Massive Context
```typescript
// Analyze with 1M+ tokens of context
const result = await claudeMemory.analyze({
  question: 'Explain the entire architecture and all components',
  contextIds: ['codebase_project_123'],
  analysisType: 'architecture',
  options: {
    includeRelated: true,
    outputFormat: 'detailed'
  }
});
```

### Semantic Search
```typescript
// Search across all stored memories
const contexts = await claudeMemory.search('authentication flow', {
  type: 'codebase',
  limit: 10
});
```

## Cost Optimization

### Estimated Costs (per month)
- **Gemini API**: ~$30-50 for moderate usage
- **Cloud Functions**: ~$10-20
- **Cloud Storage**: ~$5
- **Firestore**: ~$5
- **Redis (Upstash)**: Free tier sufficient
- **Total**: ~$50-80/month

### Cost Saving Tips
1. Use Gemini Flash for retrieval (80% cheaper)
2. Enable Redis caching (reduces API calls)
3. Compress large contexts (reduces storage)
4. Use batching for multiple queries

## Performance Optimizations

### Speed Improvements
- **Redis Cache**: <10ms response for cached queries
- **Parallel Processing**: Cloud Functions handle multiple requests
- **Compression**: 70-90% size reduction for storage
- **Smart Indexing**: Semantic search in <100ms

### Context Limits
- **Gemini 2.5 Pro**: 2M tokens (~1.5M words)
- **Gemini 2.5 Flash**: 1M tokens (~750k words)
- **Combined**: Can analyze 1000+ files simultaneously

## Security

### Best Practices
1. Use service accounts with minimal permissions
2. Enable VPC Service Controls
3. Encrypt sensitive data before storage
4. Implement rate limiting
5. Use API keys for authentication

### IAM Roles Required
- `roles/aiplatform.user` - For Vertex AI
- `roles/storage.admin` - For Cloud Storage
- `roles/datastore.user` - For Firestore
- `roles/cloudfunctions.developer` - For deployment

## Monitoring

### Metrics to Track
- API response times
- Token usage per request
- Cache hit rate
- Storage usage
- Error rates

### Logging
All operations are logged to Cloud Logging:
```bash
gcloud logging read "resource.type=cloud_function" --limit=50
```

## Troubleshooting

### Common Issues

1. **"Quota exceeded" error**
   - Check Vertex AI quotas in Cloud Console
   - Implement exponential backoff

2. **Slow responses**
   - Check Redis connection
   - Verify Cloud Function region matches your location

3. **Memory errors**
   - Increase Cloud Function memory allocation
   - Split large contexts into chunks

## Future Enhancements

1. **Vector Embeddings**: Add similarity search with Vertex AI Matching Engine
2. **Multi-Region**: Deploy to multiple regions for lower latency
3. **Streaming**: Implement WebSocket for real-time updates
4. **Auto-Scaling**: Configure autoscaling for high load
5. **ML Pipeline**: Add custom model fine-tuning

## Support

For issues or questions:
1. Check Cloud Function logs
2. Verify environment variables
3. Test with smaller contexts first
4. Contact: support@heyleila.com