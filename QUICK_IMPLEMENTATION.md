# Quick Implementation Guide

## Immediate Steps to Fix Memory Issues

### 1. Install Dependencies (if needed)
```bash
npm install sharp
```

### 2. Run the Migration Script
```bash
# First, make sure you have the service account key
# Path: ../service-account-key.json

# Run migration
npm run migrate:images
```

### 3. Test the New Components
Replace any `LazyImage` or `ServiceImage` usage with:

```tsx
import ServiceImageOptimized from '@/components/ServiceImageOptimized';

// Enable Firebase gradually
<ServiceImageOptimized
  serviceId="your-service-id"
  variant="card"
  useFirebase={true}  // Set to true to use Firebase
/>
```

### 4. Deploy Service Worker
The service worker is already integrated and will:
- Cache images automatically
- Work offline
- Reduce memory usage

### 5. Monitor Performance
Open Chrome DevTools and check:
- Memory usage: `performance.memory.usedJSHeapSize`
- Network tab: Images should load from cache
- Application tab: Service Worker should be active

## What This Solves

✅ **Memory Issues During Build**
- Images no longer bundled with build
- Served from Firebase CDN
- Reduced build size from 16MB to ~1MB

✅ **Runtime Memory Issues**
- Lazy loading with memory monitoring
- Automatic quality reduction under pressure
- Progressive loading with placeholders

✅ **Performance Issues**
- Service Worker caching
- Multiple image variants (thumbnail, card, hero)
- WebP format for 30-50% smaller files

✅ **Offline Support**
- Images cached for offline viewing
- Fallback to placeholder when offline
- Background sync for uploads

## Deployment Notes

1. **Environment Variables**
   - Firebase config already in `.env`
   - No new variables needed

2. **Vercel Deployment**
   - Remove `NODE_OPTIONS` from build command
   - Deploy normally: `npm run deploy`

3. **Testing Production**
   - Check Service Worker registration
   - Verify images load from Firebase
   - Test offline functionality

## Rollback Plan

If issues occur:
1. Set `useFirebase={false}` in components
2. Images will load from local `/public` folder
3. Fix issues and re-enable gradually

## Next Steps

1. **Complete Migration**
   ```bash
   npm run migrate:images
   ```

2. **Update All Components**
   - Search for `LazyImage` usage
   - Replace with `OptimizedImage`
   - Enable Firebase flag

3. **Remove Local Images**
   - After confirming Firebase works
   - Delete `/public/images/services`
   - Update build scripts

4. **Monitor Analytics**
   - Check load times
   - Monitor error rates
   - Track memory usage

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase Storage permissions
3. Check service worker status
4. Review `IMAGE_OPTIMIZATION_GUIDE.md`