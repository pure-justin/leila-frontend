# 🚨 URGENT: Google Maps API Fix Instructions

## Issue Found
Your production `.env.production` file had the wrong API key for Google Maps (it was using the Gemini API key). This has been fixed.

## Immediate Actions Required:

### 1. Update Google Cloud Console (Do This Now!)

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your Maps API key: `AIzaSyDVIg-mcJMYLK0l7ddEtmDRjaU4grcQg6Q`
5. Click on it to edit

### 2. Set HTTP Referrer Restrictions

Under **Application restrictions**, select **HTTP referrers** and add ALL of these:

```
http://localhost:3000/*
https://localhost:3000/*
http://localhost:*
https://*.vercel.app/*
https://heyleila.com/*
https://www.heyleila.com/*
https://*.heyleila.com/*
```

### 3. Enable Required APIs

Make sure these APIs are ENABLED in your project:
- ✅ Maps JavaScript API
- ✅ Places API  
- ✅ Geocoding API
- ✅ Solar API (optional but used in your app)

Go to **APIs & Services** → **Library** to enable them.

### 4. Update Vercel Environment Variables

1. Go to your Vercel dashboard
2. Go to Project Settings → Environment Variables
3. Make sure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set to: `AIzaSyDVIg-mcJMYLK0l7ddEtmDRjaU4grcQg6Q`
4. Redeploy your app

### 5. Check Billing

Ensure billing is enabled on your Google Cloud project. Google provides $200/month free credit.

## Testing

1. Clear your browser cache
2. Open Chrome DevTools → Network tab
3. Look for requests to `maps.googleapis.com`
4. Check for any 403 errors or "RefererNotAllowedMapError"

## Debug URL

Visit: https://yoursite.com/api-debug to see API configuration status

## Still Not Working?

If you still see errors after 10 minutes:
1. Try removing ALL restrictions temporarily (set to "None" in Google Cloud Console)
2. Test if it works unrestricted
3. Then add restrictions back one by one

The issue is 99% likely to be the HTTP referrer restrictions not matching your domain.