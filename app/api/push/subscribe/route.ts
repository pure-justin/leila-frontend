import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export const POST = secureApiHandler(async (request: NextRequest) => {
  const { subscription, userAgent, userId } = await request.json();

  if (!subscription || !subscription.endpoint) {
    return ApiResponse.error('Valid subscription is required', 400);
  }

  try {
    const db = getFirestore();
    
    // Create subscription document
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: userAgent || 'unknown',
      userId: userId || null,
      ip: request.ip || 'unknown',
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
      platform: getUserPlatform(userAgent),
      browser: getUserBrowser(userAgent),
    };
    
    // Check if subscription already exists
    const existingSubscription = await db
      .collection('push_subscriptions')
      .where('endpoint', '==', subscription.endpoint)
      .limit(1)
      .get();
    
    if (!existingSubscription.empty) {
      // Update existing subscription
      const docRef = existingSubscription.docs[0].ref;
      await docRef.update({
        ...subscriptionData,
        updatedAt: new Date(),
      });
      
      return ApiResponse.success({
        message: 'Subscription updated successfully',
        subscriptionId: docRef.id,
      });
    } else {
      // Create new subscription
      const docRef = await db.collection('push_subscriptions').add(subscriptionData);
      
      // Log subscription event
      await db.collection('notification_logs').add({
        type: 'subscription_created',
        subscriptionId: docRef.id,
        userId: userId || null,
        timestamp: new Date(),
        metadata: { userAgent, ip: request.ip },
      });
      
      return ApiResponse.success({
        message: 'Subscription created successfully',
        subscriptionId: docRef.id,
      });
    }
  } catch (error) {
    console.error('Push subscription error:', error);
    return ApiResponse.error('Failed to save subscription', 500);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: false, // Allow anonymous subscriptions
  rateLimit: 10,
});

function getUserPlatform(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  if (ua.includes('windows')) return 'windows';
  if (ua.includes('macintosh')) return 'macos';
  if (ua.includes('linux')) return 'linux';
  
  return 'unknown';
}

function getUserBrowser(userAgent: string): string {
  if (!userAgent) return 'unknown';
  
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('edge')) return 'edge';
  if (ua.includes('opera')) return 'opera';
  
  return 'unknown';
}