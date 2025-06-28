import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { generateApiKey, hashApiKey } from '@/lib/auth/jwt';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export const POST = secureApiHandler(async (request: any) => {
  const userId = request.userId;
  const userRole = request.userRole;
  
  // Only allow contractors and admins to create API keys
  if (!['contractor', 'admin'].includes(userRole)) {
    return ApiResponse.forbidden('Only contractors and admins can create API keys');
  }

  const { name, permissions, expiresIn } = await request.json();

  if (!name) {
    return ApiResponse.error('API key name is required', 400);
  }

  try {
    const db = getFirestore();
    
    // Check user's API key limit
    const existingKeys = await db
      .collection('api_keys')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();
    
    const maxKeys = userRole === 'admin' ? 10 : 3;
    if (existingKeys.size >= maxKeys) {
      return ApiResponse.error(`Maximum ${maxKeys} API keys allowed`, 400);
    }

    // Generate new API key
    const apiKey = generateApiKey();
    const hashedKey = await hashApiKey(apiKey);
    
    // Calculate expiry
    const expiryDate = expiresIn 
      ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) // days to ms
      : null; // No expiry

    // Store API key metadata
    const keyDoc = await db.collection('api_keys').add({
      userId,
      name: name.trim(),
      keyHash: hashedKey,
      keyPrefix: apiKey.substring(0, 8), // Store prefix for identification
      permissions: permissions || ['read'],
      status: 'active',
      createdAt: new Date(),
      expiresAt: expiryDate,
      lastUsed: null,
      usageCount: 0,
    });

    // Log API key creation
    await db.collection('security_logs').add({
      userId,
      event: 'api_key_created',
      keyId: keyDoc.id,
      timestamp: new Date(),
      ip: request.ip || 'unknown',
    });

    return ApiResponse.success({
      apiKey, // Only returned once, user must save it
      keyId: keyDoc.id,
      name,
      expiresAt: expiryDate,
      message: 'Save this API key securely. It will not be shown again.',
    });
  } catch (error) {
    console.error('API key creation error:', error);
    return ApiResponse.error('Failed to create API key', 500);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: true,
  rateLimit: 5, // 5 key creations per minute
});