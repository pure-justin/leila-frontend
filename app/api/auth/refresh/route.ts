import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { generateToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export const POST = secureApiHandler(async (request: NextRequest) => {
  const { refreshToken } = await request.json();

  if (!refreshToken) {
    return ApiResponse.error('Refresh token is required', 400);
  }

  try {
    // Verify refresh token
    const { userId } = await verifyRefreshToken(refreshToken);

    // Get user data
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return ApiResponse.error('User not found', 404);
    }

    const userData = userDoc.data()!;

    // Check if user is active
    if (userData.status === 'suspended' || userData.status === 'deleted') {
      return ApiResponse.error('Account is not active', 403);
    }

    // Generate new access token
    const accessToken = await generateToken({
      userId: userId,
      email: userData.email,
      role: userData.role || 'customer',
    });

    // Log token refresh
    await db.collection('auth_logs').add({
      userId: userId,
      event: 'token_refresh',
      timestamp: new Date(),
      ip: request.ip || 'unknown',
    });

    return ApiResponse.success({
      accessToken,
      user: {
        id: userId,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      },
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    if (error.message === 'Refresh token expired') {
      return ApiResponse.error('Refresh token expired', 401);
    }
    
    return ApiResponse.error('Invalid refresh token', 401);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: false,
  rateLimit: 10, // 10 refresh attempts per minute
});