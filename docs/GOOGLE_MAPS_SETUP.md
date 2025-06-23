# Google Maps API Setup Guide

## Current Issue
You're seeing "RefererNotAllowedMapError" because the Google Maps API key has HTTP referrer restrictions that don't match your current domain.

## Quick Fix

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key: `AIzaSyDVIg-mcJMYLK0l7ddEtmDRjaU4grcQg6Q`
4. Under **Application restrictions**, select **HTTP referrers (web sites)**
5. Add these allowed referrers:
   ```
   http://localhost:3000/*
   https://localhost:3000/*
   http://localhost:*
   https://*.vercel.app/*
   https://heyleila.com/*
   https://www.heyleila.com/*
   https://*.heyleila.com/*
   ```

6. Under **API restrictions**, ensure these APIs are selected:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Solar API (optional)

7. Click **Save** and wait 5-10 minutes for changes to propagate

## Required APIs

Make sure these APIs are enabled in your Google Cloud Project:

1. **Maps JavaScript API** - Core mapping functionality
2. **Places API** - Address autocomplete and place details
3. **Geocoding API** - Convert addresses to coordinates
4. **Solar API** - For solar potential features (optional)

## Billing

Ensure billing is enabled on your Google Cloud project. Google provides $200/month free credit which covers:
- 28,000 map loads/month
- 28,000 place autocomplete requests/month
- 40,000 geocoding requests/month

## Environment Variables

Your `.env.local` file should contain:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Testing

1. Visit `/api-debug` to check API configuration
2. Check browser console for specific error messages
3. Test on different domains (localhost, Vercel preview, production)

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use HTTP referrer restrictions** to prevent unauthorized use
3. **Set up billing alerts** in Google Cloud Console
4. **Monitor usage** in the Google Cloud Console dashboard
5. **Rotate keys periodically** for security

## Troubleshooting

If maps still don't load after updating restrictions:

1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check if APIs are enabled in Google Cloud Console
4. Verify billing is active on the project
5. Check quota limits haven't been exceeded
6. Use browser DevTools Network tab to see the exact error

## Alternative Solution

If you need to bypass referrer restrictions temporarily:

1. In Google Cloud Console, change to **"None"** under Application restrictions
2. Add API restrictions instead to limit which APIs can be used
3. This is less secure but useful for debugging