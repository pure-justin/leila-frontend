import { NextResponse } from 'next/server';

export async function GET() {
  // Only show this in development or with proper authorization
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Check which Firebase-related environment variables are available
  const envCheck = {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    firebaseEnvVars: {
      // Client-side (NEXT_PUBLIC) variables
      'NEXT_PUBLIC_FIREBASE_API_KEY': !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      'NEXT_PUBLIC_FIREBASE_APP_ID': !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      
      // Server-side Admin SDK variables
      'FIREBASE_SERVICE_ACCOUNT_PATH': !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      'FIREBASE_PROJECT_ID': !!process.env.FIREBASE_PROJECT_ID,
      'FIREBASE_CLIENT_EMAIL': !!process.env.FIREBASE_CLIENT_EMAIL,
      'FIREBASE_PRIVATE_KEY': !!process.env.FIREBASE_PRIVATE_KEY,
    },
    projectIdValues: {
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
      'FIREBASE_PROJECT_ID': isDevelopment ? (process.env.FIREBASE_PROJECT_ID || 'not set') : 'hidden',
    },
    privateKeyInfo: process.env.FIREBASE_PRIVATE_KEY ? {
      hasKey: true,
      startsWithBegin: process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN'),
      endsWithEnd: process.env.FIREBASE_PRIVATE_KEY.includes('END'),
      hasNewlines: process.env.FIREBASE_PRIVATE_KEY.includes('\\n') || process.env.FIREBASE_PRIVATE_KEY.includes('\n'),
      length: process.env.FIREBASE_PRIVATE_KEY.length,
      firstChars: isDevelopment ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 30) + '...' : 'hidden'
    } : {
      hasKey: false
    }
  };

  return NextResponse.json(envCheck);
}