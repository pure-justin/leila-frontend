/* eslint-env serviceworker */
/* global self, caches, clients */

// Service Worker for Push Notifications and Advanced Caching
const CACHE_NAME = 'leila-v1';
const IMAGE_CACHE = 'leila-images-v1';
const API_CACHE = 'leila-api-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon-new.ico',
  '/images/services/placeholder.jpg',
  // Add other important assets
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache strategies
const CACHE_STRATEGIES = {
  networkFirst: async (request, cacheName) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      throw error;
    }
  },
  
  cacheFirst: async (request, cacheName) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          caches.open(cacheName).then(cache => {
            cache.put(request, response);
          });
        }
      });
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }
};

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle image requests
  if (request.destination === 'image' || 
      url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i) ||
      url.hostname.includes('firebasestorage.googleapis.com')) {
    event.respondWith(
      CACHE_STRATEGIES.cacheFirst(request, IMAGE_CACHE).catch(() => {
        return caches.match('/images/services/placeholder.jpg');
      })
    );
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      CACHE_STRATEGIES.networkFirst(request, API_CACHE).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }
  
  // Default behavior for other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      notificationData = {
        title: 'Leila Notification',
        body: event.data.text() || 'You have a new notification',
        icon: '/favicon-new.ico',
        badge: '/favicon-new.ico',
        tag: 'default'
      };
    }
  }

  const {
    title = 'Leila Home Services',
    body = 'You have a new notification',
    icon = '/favicon-new.ico',
    badge = '/favicon-new.ico',
    tag = 'default',
    data = {},
    actions = [],
    requireInteraction = false,
    silent = false
  } = notificationData;

  const options = {
    body,
    icon,
    badge,
    tag,
    data,
    actions,
    requireInteraction,
    silent,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  let urlToOpen = '/';
  
  // Determine which URL to open based on notification type
  if (notificationData) {
    switch (notificationData.type) {
      case 'booking_confirmed':
        urlToOpen = `/booking/${notificationData.bookingId}`;
        break;
      case 'contractor_assigned':
        urlToOpen = `/tracking/${notificationData.bookingId}`;
        break;
      case 'contractor_arriving':
        urlToOpen = `/tracking/${notificationData.bookingId}`;
        break;
      case 'service_completed':
        urlToOpen = `/rating/${notificationData.bookingId}`;
        break;
      case 'new_message':
        urlToOpen = `/messages`;
        break;
      case 'payment_reminder':
        urlToOpen = `/payment/${notificationData.bookingId}`;
        break;
      case 'promotional':
        urlToOpen = notificationData.url || '/services';
        break;
      default:
        urlToOpen = '/';
    }
  }
  
  // Handle action button clicks
  if (event.action) {
    switch (event.action) {
      case 'view':
        urlToOpen = notificationData.viewUrl || urlToOpen;
        break;
      case 'dismiss':
        return; // Don't open any URL
      case 'reschedule':
        urlToOpen = `/reschedule/${notificationData.bookingId}`;
        break;
      case 'contact':
        urlToOpen = `/contact/${notificationData.contractorId}`;
        break;
    }
  }
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen.split('/')[1]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'background-booking') {
    event.waitUntil(syncBookings());
  }
  
  if (event.tag === 'background-messages') {
    event.waitUntil(syncMessages());
  }
});

// Sync functions
async function syncBookings() {
  try {
    // Get pending bookings from IndexedDB
    const pendingBookings = await getPendingBookings();
    
    for (const booking of pendingBookings) {
      try {
        const response = await fetch('/api/booking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking.data)
        });
        
        if (response.ok) {
          // Remove from pending bookings
          await removePendingBooking(booking.id);
          
          // Show success notification
          await self.registration.showNotification('Booking Synced', {
            body: 'Your booking has been successfully submitted!',
            icon: '/favicon-new.ico',
            tag: 'sync-success'
          });
        }
      } catch (error) {
        console.error('Failed to sync booking:', error);
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

async function syncMessages() {
  // Similar implementation for syncing messages
  console.log('Syncing messages...');
}

// IndexedDB helpers (simplified)
async function getPendingBookings() {
  // Implementation would use IndexedDB to get pending bookings
  return [];
}

async function removePendingBooking(id) {
  // Implementation would remove booking from IndexedDB
  console.log('Removing pending booking:', id);
}

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');
  
  event.waitUntil(
    // Re-subscribe and update the server
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'your-vapid-public-key'
    }).then((subscription) => {
      // Send new subscription to server
      return fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });
    })
  );
});

// Message handling for advanced caching
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_IMAGES') {
    event.waitUntil(cacheImages(event.data.urls));
  }
  
  if (event.data.type === 'CLEAR_OLD_CACHES') {
    event.waitUntil(clearOldCaches());
  }
  
  if (event.data.type === 'PRELOAD_CRITICAL_IMAGES') {
    event.waitUntil(preloadCriticalImages());
  }
});

// Helper functions for image caching
async function cacheImages(urls) {
  const cache = await caches.open(IMAGE_CACHE);
  return Promise.all(
    urls.map(url => {
      return fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
      }).catch(() => {
        console.log('Failed to cache:', url);
      });
    })
  );
}

async function clearOldCaches() {
  const cache = await caches.open(IMAGE_CACHE);
  const requests = await cache.keys();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  const now = Date.now();
  
  return Promise.all(
    requests.map(async request => {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            return cache.delete(request);
          }
        }
      }
    })
  );
}

async function preloadCriticalImages() {
  const criticalImages = [
    '/images/services/placeholder.jpg',
    // Add other critical images
  ];
  return cacheImages(criticalImages);
}