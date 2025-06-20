import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDHXHgYwVT5SoQht-TNQ2-AzSA6mR7bqjw",
  authDomain: "leila-platform.firebaseapp.com",
  projectId: "leila-platform",
  storageBucket: "leila-platform.firebasestorage.app",
  messagingSenderId: "242136952710",
  appId: "1:242136952710:web:b76f7c1c8aaaab9e724607",
  measurementId: "G-6X3ETQ9RGZ"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, 'us-central1');
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? 
  isSupported().then(yes => yes ? getAnalytics(app) : null) : 
  null;

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment to use local emulators
  // connectFunctionsEmulator(functions, 'localhost', 5555);
}

export default app;