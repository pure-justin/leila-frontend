import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseConfig } from './firebase';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize App Check
let appCheck;

if (typeof window !== 'undefined') {
  // Only initialize App Check on client side
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN) {
    // Development mode with debug token
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN;
  }
  
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
    isTokenAutoRefreshEnabled: true
  });
}

export { appCheck };