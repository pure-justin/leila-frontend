import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse, validators } from '@/lib/api/secure-handler';
import { generateToken, generateRefreshToken } from '@/lib/auth/jwt';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export const POST = secureApiHandler(async (request: NextRequest) => {
  const { email, password, idToken } = await request.json();

  // Validate input
  if (!email || !validators.isEmail(email)) {
    return ApiResponse.error('Valid email is required', 400);
  }

  if (!password && !idToken) {
    return ApiResponse.error('Password or ID token is required', 400);
  }

  try {
    let uid: string;
    let userRecord: any;

    // Option 1: Verify Firebase ID token (from client SDK login)
    if (idToken) {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      uid = decodedToken.uid;
      userRecord = await getAuth().getUser(uid);
    } else {
      // Option 2: This would require custom authentication
      // For now, we'll require Firebase Auth
      return ApiResponse.error('Please use Firebase Authentication', 400);
    }

    // Get user data from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return ApiResponse.error('User not found', 404);
    }

    const userData = userDoc.data()!;
    
    // Generate JWT tokens
    const accessToken = await generateToken({
      userId: uid,
      email: userRecord.email || email,
      role: userData.role || 'customer',
    });

    const refreshToken = await generateRefreshToken(uid);

    // Update last login
    await db.collection('users').doc(uid).update({
      lastLogin: new Date(),
      lastLoginIP: request.ip || 'unknown',
    });

    // Log authentication event
    await db.collection('auth_logs').add({
      userId: uid,
      event: 'login',
      timestamp: new Date(),
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return ApiResponse.success({
      accessToken,
      refreshToken,
      user: {
        id: uid,
        email: userRecord.email,
        name: userData.name,
        role: userData.role,
        profileImage: userData.profileImage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponse.error('Authentication failed', 401);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: false,
  rateLimit: 5, // 5 login attempts per minute
});