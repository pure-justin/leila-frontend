import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App;

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    // Check if we're in a server environment
    if (typeof window === 'undefined') {
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
        process.env.FIREBASE_PROJECT_ID
      ) {
        app = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace escaped newlines in private key
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
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
    throw error;
  }
} else {
  app = getApps()[0];
}

// Export admin services
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

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