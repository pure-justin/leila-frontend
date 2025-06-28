import { NextRequest } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { generateApiKey, hashApiKey } from '@/lib/auth/jwt';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin
initAdmin();

export const POST = secureApiHandler(async (request: any) => {
  const userId = request.userId;
  const { keyId } = await request.json();

  if (!keyId) {
    return ApiResponse.error('API key ID is required', 400);
  }

  try {
    const db = getFirestore();
    
    // Get the existing key
    const keyDoc = await db.collection('api_keys').doc(keyId).get();
    
    if (!keyDoc.exists) {
      return ApiResponse.notFound('API key not found');
    }
    
    const keyData = keyDoc.data()!;
    
    // Verify ownership
    if (keyData.userId !== userId) {
      return ApiResponse.forbidden('You do not own this API key');
    }
    
    // Check if key is active
    if (keyData.status !== 'active') {
      return ApiResponse.error('Can only rotate active keys', 400);
    }
    
    // Generate new API key
    const newApiKey = generateApiKey();
    const newHashedKey = await hashApiKey(newApiKey);
    
    // Start transaction to rotate keys
    await db.runTransaction(async (transaction) => {
      // Mark old key as rotated
      transaction.update(keyDoc.ref, {
        status: 'rotated',
        rotatedAt: new Date(),
        replacedBy: newHashedKey.substring(0, 8),
      });
      
      // Create new key with same permissions
      const newKeyRef = db.collection('api_keys').doc();
      transaction.set(newKeyRef, {
        userId: keyData.userId,
        name: `${keyData.name} (Rotated)`,
        keyHash: newHashedKey,
        keyPrefix: newApiKey.substring(0, 8),
        permissions: keyData.permissions,
        status: 'active',
        createdAt: new Date(),
        expiresAt: keyData.expiresAt,
        lastUsed: null,
        usageCount: 0,
        rotatedFrom: keyId,
      });
    });
    
    // Log rotation event
    await db.collection('security_logs').add({
      userId,
      event: 'api_key_rotated',
      oldKeyId: keyId,
      timestamp: new Date(),
      ip: request.ip || 'unknown',
    });
    
    return ApiResponse.success({
      newApiKey,
      message: 'API key rotated successfully. Save the new key securely.',
      oldKeyId: keyId,
    });
  } catch (error) {
    console.error('API key rotation error:', error);
    return ApiResponse.error('Failed to rotate API key', 500);
  }
}, {
  allowedMethods: ['POST'],
  requireAuth: true,
  rateLimit: 5,
});