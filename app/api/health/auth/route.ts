import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';

export async function GET() {
  try {
    // Check if Firebase Auth is initialized
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    // Check current user (if any)
    const currentUser = auth.currentUser;
    
    // Test auth configuration by checking if we can access auth methods
    const authReady = typeof auth.onAuthStateChanged === 'function';
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Firebase Auth is operational',
      timestamp: new Date().toISOString(),
      details: {
        initialized: true,
        authReady,
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
          emailVerified: currentUser.emailVerified
        } : null,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'not configured'
      }
    });
  } catch (error: any) {
    console.error('Auth health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error',
      message: 'Firebase Auth health check failed',
      details: {
        code: error.code,
        name: error.name,
        hint: 'Check Firebase configuration and API keys'
      }
    }, { status: 500 });
  }
}