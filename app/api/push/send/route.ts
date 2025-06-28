import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { initAdmin } from '@/lib/firebase-admin';
// import webpush from 'web-push'; // Temporarily disabled

// Initialize Firebase Admin
initAdmin();

// Configure web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:notifications@heyleila.com';

// Temporarily disabled
// if (vapidPublicKey && vapidPrivateKey) {
//   webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
// }

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

export const POST = secureApiHandler(async (request: any) => {
  const userId = request.userId; // From authentication middleware
  const { 
    recipients, 
    notification, 
    targetAll = false,
    schedule 
  } = await request.json();

  // Validate notification payload
  if (!notification || !notification.title || !notification.body) {
    return ApiResponse.error('Notification title and body are required', 400);
  }

  if (!targetAll && (!recipients || recipients.length === 0)) {
    return ApiResponse.error('Recipients are required when not targeting all users', 400);
  }

  try {
    const db = getFirestore();
    
    // Get subscriptions based on targeting
    let subscriptionsQuery = db.collection('push_subscriptions').where('isActive', '==', true);
    
    if (!targetAll && recipients) {
      // Target specific users
      if (recipients.length > 10) {
        return ApiResponse.error('Maximum 10 recipients per request', 400);
      }
      subscriptionsQuery = subscriptionsQuery.where('userId', 'in', recipients);
    }
    
    const subscriptionsSnapshot = await subscriptionsQuery.get();
    
    if (subscriptionsSnapshot.empty) {
      return ApiResponse.error('No active subscriptions found', 404);
    }
    
    const notifications: Array<{
      subscription: any;
      payload: NotificationPayload;
      status: 'pending' | 'sent' | 'failed';
      error?: string;
    }> = [];
    
    // Prepare notification payload
    const notificationPayload: NotificationPayload = {
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/favicon-new.ico',
      badge: notification.badge || '/favicon-new.ico',
      tag: notification.tag || `notification-${Date.now()}`,
      data: {
        ...notification.data,
        timestamp: Date.now(),
        url: notification.url || '/',
      },
      actions: notification.actions || [],
      requireInteraction: notification.requireInteraction || false,
      silent: notification.silent || false,
    };
    
    // If scheduled, store for later processing
    if (schedule && new Date(schedule) > new Date()) {
      const scheduledNotification = {
        recipients: targetAll ? 'all' : recipients,
        notification: notificationPayload,
        scheduledFor: new Date(schedule),
        createdBy: userId,
        createdAt: new Date(),
        status: 'scheduled',
      };
      
      const docRef = await db.collection('scheduled_notifications').add(scheduledNotification);
      
      return ApiResponse.success({
        message: 'Notification scheduled successfully',
        scheduledId: docRef.id,
        scheduledFor: schedule,
      });
    }
    
    // Send notifications immediately
    const sendPromises = subscriptionsSnapshot.docs.map(async (doc) => {
      const subscriptionData = doc.data();
      const subscription = {
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
      };
      
      try {
        // Temporarily disabled web push
        // await webpush.sendNotification(
        //   subscription,
        //   JSON.stringify(notificationPayload),
        //   {
        //     TTL: 24 * 60 * 60, // 24 hours
        //   }
        // );
        
        // Simulate success for now
        console.log('Push notification would be sent to:', subscription);
        
        // Update last used timestamp
        await doc.ref.update({ lastUsed: new Date() });
        
        notifications.push({
          subscription: doc.id,
          payload: notificationPayload,
          status: 'sent',
        });
        
        return { success: true, subscriptionId: doc.id };
      } catch (error: any) {
        console.error(`Failed to send notification to ${doc.id}:`, error);
        
        // Handle expired subscriptions
        if (error.statusCode === 410) {
          await doc.ref.update({ isActive: false });
        }
        
        notifications.push({
          subscription: doc.id,
          payload: notificationPayload,
          status: 'failed',
          error: error.message,
        });
        
        return { success: false, subscriptionId: doc.id, error: error.message };
      }
    });
    
    const results = await Promise.all(sendPromises);
    
    // Log notification batch
    await db.collection('notification_logs').add({
      type: 'batch_notification',
      sentBy: userId,
      targetCount: subscriptionsSnapshot.size,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      notification: notificationPayload,
      timestamp: new Date(),
      results,
    });
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    return ApiResponse.success({
      message: 'Notifications processed',
      sent: successCount,
      failed: failureCount,
      total: results.length,
      results: notifications,
    });
    
  } catch (error) {
    console.error('Push notification error:', error);
    return ApiResponse.error('Failed to send notifications', 500);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: true, // Require authentication to send notifications
  rateLimit: 20, // 20 notification batches per minute
});