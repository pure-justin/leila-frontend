# Firebase Admin SDK Setup Guide

The Firebase Admin SDK is currently using default credentials, which is causing the warning during build. To fix this, you need to add your Firebase service account credentials to Vercel.

## Steps to Fix:

### 1. Get Your Service Account Key from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **leila-platform**
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

### 2. Extract Required Values

From the downloaded JSON file, you need these three values:
- `project_id` (should be "leila-platform")
- `client_email` (looks like something@leila-platform.iam.gserviceaccount.com)
- `private_key` (starts with "-----BEGIN PRIVATE KEY-----")

### 3. Add to Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these three variables:

```
FIREBASE_PROJECT_ID=leila-platform
FIREBASE_CLIENT_EMAIL=<your-service-account-email>
FIREBASE_PRIVATE_KEY=<your-private-key>
```

**Important for FIREBASE_PRIVATE_KEY:**
- Copy the entire private key including the BEGIN and END lines
- Make sure to preserve the \n characters
- In Vercel, paste it exactly as it appears in the JSON file

### 4. For Local Development (Optional)

For local development, you can either:

**Option A: Use the JSON file directly**
1. Save the service account JSON file somewhere secure (NOT in your repo)
2. Add to `.env.local`:
```
FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/your/service-account.json
```

**Option B: Use environment variables**
Add the same three variables to your `.env.local`:
```
FIREBASE_PROJECT_ID=leila-platform
FIREBASE_CLIENT_EMAIL=<your-service-account-email>
FIREBASE_PRIVATE_KEY="<your-private-key>"
```

### 5. Redeploy

After adding the environment variables to Vercel:
1. Go to your deployments
2. Click the three dots on the latest deployment
3. Select "Redeploy"

## Why This Is Important

- **Security**: Proper authentication for Firebase Admin operations
- **Performance**: Removes the warning during builds
- **Production Ready**: Required for server-side Firebase operations like creating bookings

## Current Status

The app will still work without these credentials, but you'll see warnings and some server-side features may be limited. The client-side Firebase SDK (used in the browser) is already properly configured and working.