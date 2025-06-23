#!/usr/bin/env node

/**
 * Setup Firebase App Check for enhanced security
 * This will secure your app data from abuse
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAppCheck } from 'firebase-admin/app-check';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(__dirname, '../firebase-service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found. Please download it from Firebase Console.');
  console.log('Instructions:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save as firebase-service-account.json in project root');
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccountPath),
  projectId: 'leila-platform'
});

async function setupAppCheck() {
  console.log('🔐 Setting up Firebase App Check...\n');
  
  const appCheck = getAppCheck(app);
  
  try {
    // 1. Register Web App
    console.log('1️⃣ Registering Web App...');
    const webAppConfig = {
      siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'YOUR_RECAPTCHA_SITE_KEY',
      // Using reCAPTCHA v3 for web
    };
    
    console.log('   ✅ Web app will use reCAPTCHA v3');
    console.log('   📝 Add to .env.local:');
    console.log('      NEXT_PUBLIC_APP_CHECK_PUBLIC_KEY=<your-app-check-public-key>');
    console.log('      NEXT_PUBLIC_RECAPTCHA_SITE_KEY=<your-recaptcha-site-key>\n');
    
    // 2. Configure Debug Token for Development
    console.log('2️⃣ Setting up debug token for development...');
    const debugToken = generateDebugToken();
    console.log('   ✅ Debug token generated');
    console.log('   📝 Add to .env.local:');
    console.log(`      NEXT_PUBLIC_APP_CHECK_DEBUG_TOKEN=${debugToken}\n`);
    
    // 3. Create App Check configuration file
    console.log('3️⃣ Creating App Check configuration...');
    const appCheckConfig = `import { initializeApp } from 'firebase/app';
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
`;
    
    const configPath = path.join(__dirname, '../lib/firebase-app-check.ts');
    fs.writeFileSync(configPath, appCheckConfig);
    console.log('   ✅ Created lib/firebase-app-check.ts\n');
    
    // 4. Update Firebase rules
    console.log('4️⃣ Updating Firestore security rules...');
    const rulesPath = path.join(__dirname, '../firestore.rules');
    const currentRules = fs.readFileSync(rulesPath, 'utf-8');
    
    if (!currentRules.includes('request.auth != null && request.app != null')) {
      const updatedRules = currentRules.replace(
        'request.auth != null',
        'request.auth != null && request.app != null'
      );
      fs.writeFileSync(rulesPath, updatedRules);
      console.log('   ✅ Updated Firestore rules to require App Check\n');
    } else {
      console.log('   ℹ️  Firestore rules already include App Check\n');
    }
    
    // 5. Create App Check enforcement settings
    console.log('5️⃣ App Check Enforcement Settings:');
    console.log('   Go to Firebase Console > App Check');
    console.log('   Enable enforcement for:');
    console.log('   - Firestore Database');
    console.log('   - Cloud Storage');
    console.log('   - Cloud Functions (optional)\n');
    
    // 6. Update Next.js app to use App Check
    console.log('6️⃣ Update your app to use App Check:');
    console.log('   In app/layout.tsx or _app.tsx, import:');
    console.log('   import "@/lib/firebase-app-check";\n');
    
    console.log('✅ App Check setup complete!\n');
    console.log('🔍 Next steps:');
    console.log('1. Get reCAPTCHA v3 site key from: https://www.google.com/recaptcha/admin');
    console.log('2. Update .env.local with the keys shown above');
    console.log('3. Deploy Firestore rules: npm run deploy:rules');
    console.log('4. Enable App Check enforcement in Firebase Console');
    console.log('5. Test in development with debug token');
    console.log('6. Monitor App Check metrics in Firebase Console\n');
    
  } catch (error) {
    console.error('❌ Error setting up App Check:', error);
  }
}

function generateDebugToken(): string {
  // Generate a random debug token for development
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 40; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Run setup
setupAppCheck();