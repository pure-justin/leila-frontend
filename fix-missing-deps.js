#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create stub files for missing dependencies
const stubs = [
  {
    path: 'lib/api/secure-handler.ts',
    content: `export const secureHandler = (handler: Function) => handler;`
  },
  {
    path: 'lib/auth/jwt.ts',
    content: `export const generateToken = (payload: any) => 'stub-token';
export const verifyToken = (token: string) => ({ valid: true });`
  },
  {
    path: 'lib/referral/referral-system.ts',
    content: `export const referralSystem = {
  createReferralCode: () => 'REF123',
  validateReferralCode: () => true,
};`
  },
  {
    path: 'lib/types/property-profile.ts',
    content: `export interface PropertyProfile {
  id: string;
  address: string;
  type: string;
}`
  },
  {
    path: 'lib/proprietary/pricing-algorithm.ts',
    content: `export const calculatePrice = (service: any) => 100;`
  },
  {
    path: 'lib/firebase-storage.ts',
    content: `export const uploadImage = async (file: any) => ({ url: '/placeholder.jpg' });`
  },
  {
    path: 'lib/image-service.ts',
    content: `export const imageService = {
  getServiceImage: (id: string) => '/images/placeholder.jpg',
  uploadImage: async (file: any) => ({ url: '/placeholder.jpg' }),
};`
  },
  {
    path: 'hooks/useServiceImage.ts',
    content: `export const useServiceImage = (serviceId: string) => ({
  imageUrl: '/images/placeholder.jpg',
  loading: false,
  error: null,
});`
  }
];

console.log('🔧 Creating stub files for missing dependencies...\n');

for (const stub of stubs) {
  const dir = path.dirname(stub.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(stub.path, stub.content);
  console.log(`✅ Created: ${stub.path}`);
}

console.log('\n🎉 All stub files created successfully!');