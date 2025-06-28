import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { clientConfig } from './config/secure-config';

// Use secure config for Firebase
export const firebaseConfig = clientConfig.firebase;

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

// Initialize App Check only on client side
let appCheck;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
  // Temporarily skip App Check initialization until properly configured
  console.log('App Check initialization temporarily disabled');
  // try {
  //   appCheck = initializeAppCheck(app, {
  //     provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
  //     isTokenAutoRefreshEnabled: true
  //   });
  //   console.log('Firebase App Check initialized successfully');
  // } catch (error) {
  //   console.warn('Firebase App Check initialization failed:', error);
  // }
}
export { appCheck };

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment to use local emulators
  // connectFunctionsEmulator(functions, 'localhost', 5555);
}

export default app;