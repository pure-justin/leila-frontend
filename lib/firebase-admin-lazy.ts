import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app: App | null = null;
let isInitialized = false;

// Lazy initialization function - only initialize when actually needed
function getAdminApp(): App {
  if (!isInitialized && !getApps().length) {
    try {
      // Only initialize in server environment
      if (typeof window !== 'undefined') {
        throw new Error('Firebase Admin SDK should only be used on the server side');
      }

      // Option 1: Use service account from file path (local development)
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      
      if (serviceAccountPath) {
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
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        
        // Handle private key formatting
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
          privateKey = privateKey.slice(1, -1);
        }
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
      }
      // Option 3: Use default credentials
      else {
        app = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
      }
      
      isInitialized = true;
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  } else if (getApps().length > 0) {
    app = getApps()[0];
  }
  
  if (!app) {
    throw new Error('Failed to initialize Firebase Admin');
  }
  
  return app;
}

// Lazy-loaded admin services
export const adminAuth = {
  get: () => getAuth(getAdminApp())
};

export const adminDb = {
  get: () => getFirestore(getAdminApp())
};

export const adminStorage = {
  get: () => getStorage(getAdminApp())
};

// For backward compatibility
export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminStorage() {
  return getStorage(getAdminApp());
}