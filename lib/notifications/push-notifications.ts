/**
 * Push Notifications System
 * Handles web push notifications for PWA
 */

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  
  // VAPID keys - these should be in environment variables
  private readonly vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  
  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }
    
    try {
      // Register service worker
      // Temporarily disabled for deployment
      // this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registration temporarily disabled');
      
      // Check for existing subscription
      // this.subscription = await this.registration.pushManager.getSubscription();
      
      return false; // Temporarily return false
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }
  
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }
    
    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      
      this.subscription = subscription;
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }
  
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }
    
    try {
      const result = await this.subscription.unsubscribe();
      
      if (result) {
        // Notify server about unsubscription
        await this.removeSubscriptionFromServer(this.subscription);
        this.subscription = null;
      }
      
      return result;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }
  
  isSubscribed(): boolean {
    return this.subscription !== null;
  }
  
  getSubscription(): PushSubscription | null {
    return this.subscription;
  }
  
  // Show local notification (for testing or immediate feedback)
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return;
    }
    
    const options = {
      body: payload.body,
      icon: payload.icon || '/favicon-new.ico',
      badge: payload.badge || '/favicon-new.ico',
      tag: payload.tag || 'default',
      data: payload.data || {},
      actions: payload.actions || [],
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };
    
    await this.registration.showNotification(payload.title, options);
  }
  
  // Predefined notification templates
  async showBookingConfirmation(bookingId: string, serviceName: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Booking Confirmed! 🎉',
      body: `Your ${serviceName} service has been booked successfully`,
      tag: `booking-${bookingId}`,
      data: {
        type: 'booking_confirmed',
        bookingId
      },
      actions: [
        {
          action: 'view',
          title: 'View Details'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true
    };
    
    await this.showLocalNotification(payload);
  }
  
  async showContractorAssigned(bookingId: string, contractorName: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Contractor Assigned! 👷',
      body: `${contractorName} has been assigned to your service`,
      tag: `contractor-${bookingId}`,
      data: {
        type: 'contractor_assigned',
        bookingId
      },
      actions: [
        {
          action: 'view',
          title: 'View Profile'
        },
        {
          action: 'contact',
          title: 'Contact'
        }
      ]
    };
    
    await this.showLocalNotification(payload);
  }
  
  async showContractorArriving(bookingId: string, eta: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Contractor Arriving! 🚗',
      body: `Your contractor will arrive in ${eta}`,
      tag: `arriving-${bookingId}`,
      data: {
        type: 'contractor_arriving',
        bookingId
      },
      actions: [
        {
          action: 'view',
          title: 'Track'
        }
      ],
      requireInteraction: true
    };
    
    await this.showLocalNotification(payload);
  }
  
  async showServiceCompleted(bookingId: string): Promise<void> {
    const payload: NotificationPayload = {
      title: 'Service Completed! ✅',
      body: 'Please rate your experience',
      tag: `completed-${bookingId}`,
      data: {
        type: 'service_completed',
        bookingId
      },
      actions: [
        {
          action: 'view',
          title: 'Rate Service'
        }
      ],
      requireInteraction: true
    };
    
    await this.showLocalNotification(payload);
  }
  
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
      
      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }
  
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
      
      console.log('Subscription removed from server successfully');
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }
  
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
}

// Export singleton instance
export const pushNotifications = new PushNotificationManager();

// React hook for push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const initialize = async () => {
      const supported = await pushNotifications.initialize();
      setIsSupported(supported);
      setIsSubscribed(pushNotifications.isSubscribed());
    };
    
    initialize();
  }, []);
  
  const subscribe = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const permission = await pushNotifications.requestPermission();
      if (!permission) {
        return false;
      }
      
      const subscription = await pushNotifications.subscribe();
      setIsSubscribed(subscription !== null);
      return subscription !== null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const unsubscribe = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await pushNotifications.unsubscribe();
      setIsSubscribed(!result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    showNotification: pushNotifications.showLocalNotification.bind(pushNotifications)
  };
}

import { useState, useEffect } from 'react';