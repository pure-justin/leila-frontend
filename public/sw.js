/* eslint-env serviceworker */
/* global self, caches, clients */

// Service Worker for Push Notifications
const CACHE_NAME = 'leila-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon-new.ico',
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

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
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