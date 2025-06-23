# Firebase Authentication Fix Guide

## Error: auth/invalid-credential

This error typically occurs when authentication providers are not properly configured. Follow these steps to fix it:

### 1. Check Firebase Console Authentication Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `leila-platform`
3. Navigate to **Authentication** → **Sign-in method**
4. Ensure these providers are enabled:
   - **Email/Password** - Should be enabled
   - **Google** - Should be enabled

### 2. Configure Google OAuth

If Google Sign-In is showing the error:

1. In Firebase Console → Authentication → Sign-in method → Google
2. Click on Google provider
3. Make sure it's enabled
4. Copy the **Web client ID** if shown
5. Add authorized domains:
   - `localhost`
   - `heyleila.com`
   - `leila-frontend.vercel.app`
   - Your current development domain

### 3. Update OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Ensure the following:
   - App name is set
   - User support email is configured
   - Authorized domains include:
     - `firebaseapp.com`
     - `heyleila.com`
     - `vercel.app`

### 4. Check API Key Restrictions

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Find your Firebase API key
3. Check if there are any restrictions:
   - HTTP referrer restrictions
   - API restrictions
4. If restricted, ensure these domains are allowed:
   - `http://localhost:3000/*`
   - `http://localhost:3002/*`
   - `https://heyleila.com/*`
   - `https://*.vercel.app/*`

### 5. Quick Fix for Development

If you need a quick fix for development, you can:

1. Create a new Web OAuth 2.0 Client ID in Google Cloud Console
2. Add it to your Firebase project
3. Update the authorized redirect URIs:
   ```
   https://leila-platform.firebaseapp.com/__/auth/handler
   http://localhost:3000
   http://localhost:3002
   ```

### 6. Environment Variables Check

Ensure your `.env.local` has the correct values:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCForPQtgKrRBb21vu5MrAMLKvgYOVOKgI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=leila-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=leila-platform
```

### 7. Clear Browser Cache

Sometimes cached credentials cause issues:
1. Clear browser cache and cookies
2. Try incognito/private mode
3. Try a different browser

### Common Solutions:

1. **For Email/Password auth errors:**
   - Ensure Email/Password is enabled in Firebase Console
   - Check if the user exists in Authentication → Users

2. **For Google Sign-In errors:**
   - Re-enable Google provider in Firebase Console
   - Update OAuth consent screen
   - Check domain whitelist

3. **For general auth errors:**
   - Restart the development server
   - Clear `.next` cache: `rm -rf .next`
   - Rebuild: `npm run build`

### Testing Authentication

After making changes:
1. Test email/password sign in
2. Test Google sign in
3. Test sign out
4. Test creating new account

If the error persists, check the browser console for more detailed error messages.