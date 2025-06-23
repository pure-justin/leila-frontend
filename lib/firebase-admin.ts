import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App | null = null;

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    // Check if we're in a server environment
    if (typeof window === 'undefined') {
      // Debug: Log available environment variables (without exposing sensitive data)
      console.log('Firebase Admin initialization - checking credentials:', {
        hasServiceAccountPath: !!process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasPublicProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      // Option 1: Use service account from file path (local development)
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      
      if (serviceAccountPath) {
        // Load service account from file
        const serviceAccount = require(serviceAccountPath);
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      } 
      // Option 2: Use service account from environment variables
      else if (
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        (process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
      ) {
        // Parse the private key properly - handle both escaped and unescaped newlines
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // If the key is wrapped in quotes, remove them
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }
        
        // Replace escaped newlines with actual newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
          }),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        
        console.log('Firebase Admin initialized with service account credentials');
      }
      // Option 3: Use default credentials (Google Cloud environments)
      else {
        app = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
        console.warn(
          'Firebase Admin initialized with default credentials. ' +
          'For production, please provide service account credentials.'
        );
      }
    } else {
      throw new Error('Firebase Admin SDK should only be used on the server side');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Don't throw error during build - just log it
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Firebase Admin initialization failed - continuing without admin SDK');
      app = null;
    } else {
      throw error;
    }
  }
} else {
  app = getApps()[0];
}

// Export admin services (with null checks)
export const adminAuth = app ? getAuth(app) : null;
export const adminDb = app ? getFirestore(app) : null;
export const adminStorage = app ? getStorage(app) : null;

// Export the app instance if needed
export { app as adminApp };

// Helper function to verify admin initialization
export async function verifyAdminInit(): Promise<boolean> {
  try {
    // Try to perform a simple operation
    const timestamp = Date.now();
    const testRef = adminDb.collection('_admin_test').doc('init');
    await testRef.set({ timestamp, test: true });
    await testRef.delete();
    return true;
  } catch (error) {
    console.error('Admin SDK verification failed:', error);
    return false;
  }
}