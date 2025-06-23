import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin-lazy';

export async function GET() {
  try {
    // Initialize admin DB only when the endpoint is called (runtime, not build time)
    const adminDb = getAdminDb();
    
    // Test Firestore connection by attempting to read a collection
    const timestamp = Date.now();
    
    // Try to write and read a test document
    const testRef = adminDb.collection('_health_check').doc('test');
    await testRef.set({
      timestamp,
      test: true
    });
    
    const doc = await testRef.get();
    
    // Clean up
    await testRef.delete();
    
    if (doc.exists) {
      return NextResponse.json({
        status: 'healthy',
        message: 'Firestore connection successful',
        timestamp: new Date().toISOString(),
        latency: Date.now() - timestamp,
        details: {
          canRead: true,
          canWrite: true,
          canDelete: true
        }
      });
    } else {
      throw new Error('Could not verify document creation');
    }
  } catch (error: any) {
    console.error('Firestore health check failed:', error);
    
    // Check if it's a configuration error
    if (error.message?.includes('FIREBASE_')) {
      return NextResponse.json({
        status: 'error',
        error: 'Firebase configuration error',
        message: 'Missing or invalid Firebase configuration',
        details: {
          hint: 'Check your environment variables and service account credentials'
        }
      }, { status: 500 });
    }
    
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      return NextResponse.json({
        status: 'error',
        error: 'Permission denied',
        message: 'Firestore security rules are blocking access',
        details: {
          code: error.code,
          hint: 'Check your Firestore security rules'
        }
      }, { status: 403 });
    }
    
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error',
      message: 'Failed to connect to Firestore',
      details: {
        code: error.code,
        name: error.name
      }
    }, { status: 500 });
  }
}