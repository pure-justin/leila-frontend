/**
 * Secure Configuration System
 * All API keys and sensitive data should be accessed through this module
 */

// Server-side only configuration
export const serverConfig = {
  // These should NEVER be exposed to the client
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  // Email service
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
  },
  // Database
  database: {
    url: process.env.DATABASE_URL || '',
  },
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'development-jwt-secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'development-encryption-key',
  },
  // Voice services
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
  },
  // SMS service  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
};

// Client-side configuration (public keys only)
export const clientConfig = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  google: {
    mapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  },
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://heyleila.com',
    name: 'Leila',
    description: 'AI-powered home service booking',
  },
};

// Security validation
export function validateServerConfig(): void {
  const requiredServerKeys = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'GEMINI_API_KEY',
    'JWT_SECRET',
  ];

  const missingKeys = requiredServerKeys.filter(key => !process.env[key]);
  
  if (missingKeys.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
}

// Secure key access with logging
export function getSecureKey(keyPath: string): string {
  // Log access attempts in production
  if (process.env.NODE_ENV === 'production') {
    console.log(`[SECURITY] Accessing secure key: ${keyPath}`);
  }
  
  // Parse the key path
  const parts = keyPath.split('.');
  let value: any = serverConfig;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      throw new Error(`Invalid key path: ${keyPath}`);
    }
  }
  
  return value;
}

// API key validation
export function isValidApiKey(key: string): boolean {
  // Basic validation
  if (!key || key.length < 20) return false;
  
  // Check for test keys in production
  if (process.env.NODE_ENV === 'production') {
    const testPatterns = ['test', 'demo', 'sample', 'example'];
    if (testPatterns.some(pattern => key.toLowerCase().includes(pattern))) {
      console.error('[SECURITY] Test API key detected in production!');
      return false;
    }
  }
  
  return true;
}

// Sanitize configuration for logging
export function sanitizeConfig(config: any): any {
  const sanitized = JSON.parse(JSON.stringify(config));
  
  const sensitiveKeys = ['key', 'secret', 'token', 'password', 'credential'];
  
  function maskSensitive(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        maskSensitive(obj[key]);
      } else if (typeof obj[key] === 'string') {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = obj[key] ? '***REDACTED***' : '';
        }
      }
    }
  }
  
  maskSensitive(sanitized);
  return sanitized;
}