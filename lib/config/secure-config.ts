// Temporary stub to fix circular dependencies
export const getSecureConfig = () => ({
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT || '{}',
  JWT_SECRET: process.env.JWT_SECRET || 'temporary-secret',
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
});

export const secureConfig = getSecureConfig();
EOF < /dev/null