# Firebase Admin SDK Troubleshooting Guide

## Current Issue
The Firebase Admin SDK is showing warnings about using default credentials, even though you mentioned the credentials are already set up in Vercel.

## Diagnostic Steps

### 1. Check Current Configuration
Visit: `https://your-app.vercel.app/api/debug/firebase-admin`

This endpoint will show:
- Which environment variables are detected
- If the private key format is correct
- The current initialization status

### 2. Verify Environment Variables in Vercel

Go to your Vercel project settings and ensure these exact variable names are set:
- `FIREBASE_PROJECT_ID` (should be "leila-platform")
- `FIREBASE_CLIENT_EMAIL` (should look like something@leila-platform.iam.gserviceaccount.com)
- `FIREBASE_PRIVATE_KEY` (the private key from your service account JSON)

### 3. Common Issues and Solutions

#### Issue: Private Key Format
The most common issue is with the private key format in Vercel.

**Solution 1: Raw Format (Recommended)**
In Vercel, paste the private key exactly as it appears in the JSON file, including:
```
-----BEGIN PRIVATE KEY-----
[key content with \n characters]
-----END PRIVATE KEY-----
```

**Solution 2: If Raw Format Doesn't Work**
Try wrapping the entire key in double quotes:
```
"-----BEGIN PRIVATE KEY-----\n[key content]\n-----END PRIVATE KEY-----"
```

#### Issue: Environment Variable Names Don't Match
Make sure you're using these exact names (case-sensitive):
- `FIREBASE_PROJECT_ID` (NOT `NEXT_PUBLIC_FIREBASE_PROJECT_ID` for admin)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

#### Issue: Vercel Environment Settings
Ensure the variables are set for the correct environment:
- Production
- Preview
- Development (if applicable)

### 4. Testing the Fix

1. After updating environment variables in Vercel, redeploy:
   - Go to your Vercel dashboard
   - Click on your project
   - Go to "Deployments"
   - Click the three dots on the latest deployment
   - Select "Redeploy"

2. Check the build logs for the message:
   ```
   Firebase Admin initialized with service account credentials
   ```
   Instead of:
   ```
   Firebase Admin initialized with default credentials. For production, please provide service account credentials.
   ```

3. Test the Firestore health endpoint:
   ```
   https://your-app.vercel.app/api/health/firestore
   ```

### 5. Alternative: Using a Service Account JSON File

If environment variables continue to cause issues, you can use a service account JSON file:

1. In Vercel, create a single environment variable:
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"leila-platform",...}
   ```
   (paste the entire JSON content)

2. Update `firebase-admin.ts` to parse this:
   ```typescript
   const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
   if (serviceAccountJson) {
     const serviceAccount = JSON.parse(serviceAccountJson);
     app = initializeApp({
       credential: cert(serviceAccount),
       // ... rest of config
     });
   }
   ```

### 6. Debugging Locally

To test locally, create a `.env.local` file:
```
FIREBASE_PROJECT_ID=leila-platform
FIREBASE_CLIENT_EMAIL=your-service-account@leila-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

Then run:
```bash
npm run build
```

Check the console output for initialization messages.

## Need More Help?

If the issue persists:
1. Check the `/api/debug/firebase-admin` endpoint response
2. Review the Vercel function logs for any error messages
3. Ensure your service account has the necessary permissions in Firebase Console

The enhanced `firebase-admin.ts` file now includes:
- Better private key parsing (handles quotes and newlines)
- Debug logging to help identify issues
- Fallback to public project ID if admin project ID is missing