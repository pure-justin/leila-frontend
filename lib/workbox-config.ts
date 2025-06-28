// Workbox configuration for advanced caching
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

// Precache manifest
declare const self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Image caching strategy - Cache First with expiration
registerRoute(
  ({ request, url }) => {
    return request.destination === 'image' ||
           url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif|ico)$/i) ||
           url.hostname.includes('firebasestorage.googleapis.com');
  },
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// API caching strategy - Network First with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Static assets - Stale While Revalidate
registerRoute(
  ({ request }) => {
    return request.destination === 'script' ||
           request.destination === 'style' ||
           request.destination === 'font';
  },
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Background sync for failed uploads
const uploadQueue = new Queue('upload-queue', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Replayed upload:', entry.request.url);
      } catch (error) {
        console.error('Replay failed:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
    console.log('Upload queue synced!');
  },
});

// Register upload failures for retry
registerRoute(
  ({ url }) => url.pathname === '/api/upload/image',
  async ({ event }) => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (error) {
      await uploadQueue.pushRequest({ request: event.request });
      return new Response(
        JSON.stringify({ 
          error: 'Upload queued for retry',
          queued: true 
        }),
        { 
          headers: { 'Content-Type': 'application/json' },
          status: 202 
        }
      );
    }
  },
  'POST'
);

// Skip waiting and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Enable navigation preload if supported
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

// Handle navigation requests
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Export configuration for webpack
export const workboxConfig = {
  swDest: 'public/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-images',
        expiration: {
          maxEntries: 1000,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
};