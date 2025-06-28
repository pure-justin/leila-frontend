#!/usr/bin/env node
/**
 * API Key Rotation Script
 * Automatically rotates API keys that are older than specified threshold
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { generateApiKey, hashApiKey } from '../lib/auth/jwt';

// Configuration
const ROTATION_THRESHOLD_DAYS = 90; // Rotate keys older than 90 days
const EXPIRY_WARNING_DAYS = 7; // Warn about keys expiring in 7 days

async function rotateApiKeys() {
  console.log('🔄 Starting API Key Rotation Process...\n');
  
  // Initialize Firebase Admin
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  
  if (!serviceAccount.project_id) {
    console.error('❌ Firebase service account not configured');
    process.exit(1);
  }
  
  initializeApp({
    credential: cert(serviceAccount),
  });
  
  const db = getFirestore();
  const now = new Date();
  const rotationThreshold = new Date(now.getTime() - ROTATION_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
  const expiryWarning = new Date(now.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);
  
  try {
    // Get all active API keys
    const snapshot = await db
      .collection('api_keys')
      .where('status', '==', 'active')
      .get();
    
    console.log(`Found ${snapshot.size} active API keys\n`);
    
    const rotationCandidates = [];
    const expiringKeys = [];
    
    // Check each key
    for (const doc of snapshot.docs) {
      const keyData = doc.data();
      const createdAt = keyData.createdAt.toDate();
      
      // Check if key needs rotation
      if (createdAt < rotationThreshold) {
        rotationCandidates.push({
          id: doc.id,
          name: keyData.name,
          userId: keyData.userId,
          createdAt,
          daysOld: Math.floor((now.getTime() - createdAt.getTime()) / (24 * 60 * 60 * 1000)),
        });
      }
      
      // Check if key is expiring soon
      if (keyData.expiresAt) {
        const expiresAt = keyData.expiresAt.toDate();
        if (expiresAt < expiryWarning && expiresAt > now) {
          expiringKeys.push({
            id: doc.id,
            name: keyData.name,
            userId: keyData.userId,
            expiresAt,
            daysUntilExpiry: Math.floor((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
          });
        }
      }
    }
    
    // Report findings
    console.log(`📊 Rotation Summary:`);
    console.log(`- Keys needing rotation: ${rotationCandidates.length}`);
    console.log(`- Keys expiring soon: ${expiringKeys.length}\n`);
    
    // Display keys needing rotation
    if (rotationCandidates.length > 0) {
      console.log('🔑 Keys to Rotate:');
      rotationCandidates.forEach(key => {
        console.log(`  - ${key.name} (${key.daysOld} days old) - User: ${key.userId}`);
      });
      console.log('');
    }
    
    // Display expiring keys
    if (expiringKeys.length > 0) {
      console.log('⚠️  Keys Expiring Soon:');
      expiringKeys.forEach(key => {
        console.log(`  - ${key.name} (expires in ${key.daysUntilExpiry} days) - User: ${key.userId}`);
      });
      console.log('');
    }
    
    // Perform automatic rotation if enabled
    if (process.env.AUTO_ROTATE_KEYS === 'true') {
      console.log('🔄 Performing automatic rotation...\n');
      
      for (const candidate of rotationCandidates) {
        try {
          // Generate new key
          const newApiKey = generateApiKey();
          const newHashedKey = await hashApiKey(newApiKey);
          
          // Get original key data
          const keyDoc = await db.collection('api_keys').doc(candidate.id).get();
          const keyData = keyDoc.data()!;
          
          // Rotate key in transaction
          await db.runTransaction(async (transaction) => {
            // Mark old key as auto-rotated
            transaction.update(keyDoc.ref, {
              status: 'auto_rotated',
              rotatedAt: now,
              rotationReason: `Automatic rotation after ${ROTATION_THRESHOLD_DAYS} days`,
            });
            
            // Create new key
            const newKeyRef = db.collection('api_keys').doc();
            transaction.set(newKeyRef, {
              ...keyData,
              keyHash: newHashedKey,
              keyPrefix: newApiKey.substring(0, 8),
              status: 'active',
              createdAt: now,
              lastUsed: null,
              usageCount: 0,
              rotatedFrom: candidate.id,
              autoRotated: true,
            });
          });
          
          // Send notification to user (implement your notification system)
          await db.collection('notifications').add({
            userId: candidate.userId,
            type: 'api_key_rotated',
            title: 'API Key Automatically Rotated',
            message: `Your API key "${candidate.name}" has been automatically rotated for security.`,
            keyId: candidate.id,
            timestamp: now,
            read: false,
          });
          
          console.log(`✅ Rotated: ${candidate.name}`);
        } catch (error) {
          console.error(`❌ Failed to rotate ${candidate.name}:`, error);
        }
      }
    } else {
      console.log('ℹ️  Automatic rotation is disabled. Set AUTO_ROTATE_KEYS=true to enable.\n');
    }
    
    // Generate rotation report
    const report = {
      timestamp: now.toISOString(),
      keysChecked: snapshot.size,
      keysNeedingRotation: rotationCandidates.length,
      keysExpiringSoon: expiringKeys.length,
      rotationThresholdDays: ROTATION_THRESHOLD_DAYS,
      autoRotateEnabled: process.env.AUTO_ROTATE_KEYS === 'true',
      rotatedKeys: rotationCandidates.map(k => ({
        id: k.id,
        name: k.name,
        daysOld: k.daysOld,
      })),
      expiringKeys: expiringKeys.map(k => ({
        id: k.id,
        name: k.name,
        daysUntilExpiry: k.daysUntilExpiry,
      })),
    };
    
    // Save report
    await db.collection('security_reports').add({
      type: 'api_key_rotation',
      report,
      createdAt: now,
    });
    
    console.log('\n✅ API Key rotation check completed!');
    console.log('📄 Report saved to security_reports collection');
    
  } catch (error) {
    console.error('❌ Error during API key rotation:', error);
    process.exit(1);
  }
}

// Run the rotation check
rotateApiKeys()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });