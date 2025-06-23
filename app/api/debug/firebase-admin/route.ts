import { NextResponse } from 'next/server';

export async function GET() {
  // Only allow in development or with proper authorization
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Check environment variables (without exposing sensitive data)
  const envCheck = {
    hasServiceAccountPath: !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    hasPublicProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  };
  
  // Check if private key format looks correct (if exists)
  let privateKeyFormat = null;
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const key = process.env.FIREBASE_PRIVATE_KEY;
    privateKeyFormat = {
      startsWithBegin: key.includes('-----BEGIN'),
      endsWithEnd: key.includes('-----END'),
      hasNewlines: key.includes('\\n') || key.includes('\n'),
      isWrappedInQuotes: key.startsWith('"') && key.endsWith('"'),
      length: key.length,
    };
  }
  
  // Try to initialize and test Firebase Admin
  let adminStatus = 'not_tested';
  let adminError = null;
  
  try {
    const { verifyAdminInit } = await import('@/lib/firebase-admin');
    const isValid = await verifyAdminInit();
    adminStatus = isValid ? 'working' : 'failed';
  } catch (error: any) {
    adminStatus = 'error';
    adminError = error.message;
  }
  
  const response = {
    status: adminStatus,
    timestamp: new Date().toISOString(),
    environment: envCheck,
    privateKeyFormat: privateKeyFormat,
    error: adminError,
    recommendation: getRecommendation(envCheck, adminStatus),
  };
  
  // In production, only return limited info unless there's an error
  if (!isDevelopment && adminStatus === 'working') {
    return NextResponse.json({
      status: 'healthy',
      message: 'Firebase Admin is properly configured',
      timestamp: response.timestamp,
    });
  }
  
  return NextResponse.json(response);
}

function getRecommendation(envCheck: any, status: string): string {
  if (status === 'working') {
    return 'Firebase Admin is properly configured and working.';
  }
  
  if (!envCheck.hasPrivateKey || !envCheck.hasClientEmail || !envCheck.hasProjectId) {
    return 'Missing required environment variables. Please ensure FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID are set in Vercel.';
  }
  
  if (!envCheck.hasPublicProjectId) {
    return 'Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID. This should match your Firebase project ID.';
  }
  
  return 'Environment variables are present but Firebase Admin initialization is failing. Check the private key format and ensure it includes proper newlines.';
}