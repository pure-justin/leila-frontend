# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### 1. Environment Variables
Make sure all required environment variables are set in Vercel:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY` (without NEXT_PUBLIC prefix)
- `GEMINI_API_KEY` (without NEXT_PUBLIC prefix)

### 2. Node Version
Vercel uses Node.js 20.x by default. If you need a specific version, add to package.json:
```json
"engines": {
  "node": "20.x"
}
```

### 3. Build Output Size
Vercel has a 250MB limit for serverless functions. Check if any API routes are too large.

### 4. Memory Issues
If the build runs out of memory, you might need to increase the build memory in vercel.json:
```json
{
  "functions": {
    "app/api/create-payment-intent/route.ts": {
      "maxDuration": 10
    }
  }
}
```

### 5. Firebase Functions Issue (FIXED)
The `functions` directory was removed as it should be deployed separately to Firebase, not Vercel.

### 6. Check Vercel Dashboard
1. Go to your Vercel dashboard
2. Click on the failed deployment
3. Check the "Build Logs" tab for specific error messages
4. Common errors:
   - "Module not found" - missing dependency
   - "Build exceeded maximum allowed runtime" - build timeout
   - "Error: Cannot find module" - import path issues

### 7. Clear Cache and Redeploy
In Vercel dashboard:
1. Go to Settings > Environment Variables
2. Make sure all variables are set
3. Go to Deployments
4. Click "..." menu on the latest deployment
5. Select "Redeploy" and check "Use existing Build Cache: No"

### 8. Stripe API Version
Already fixed - using the correct API version '2025-05-28.basil'

### 9. Suspense Boundary
Already fixed - useSearchParams is wrapped in Suspense

If the deployment still fails, please check the Vercel build logs for the specific error message.