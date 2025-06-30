import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export const POST = secureApiHandler(async (request: any) => {
  const userId = request.userId; // From authentication middleware
  
  if (!userId) {
    return ApiResponse.error('User ID not found', 400);
  }

  try {
    const db = getFirestore();
    
    // Log logout event
    await db.collection('auth_logs').add({
      userId: userId,
      event: 'logout',
      timestamp: new Date(),
      ip: request.ip || 'unknown',
    });

    // Optional: Blacklist the token (implement token blacklist if needed)
    // This would require storing tokens in a blacklist collection
    
    return ApiResponse.success({
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return ApiResponse.error('Logout failed', 500);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: true, // Require authentication to logout
  rateLimit: 20,
});