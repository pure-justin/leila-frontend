#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for Firebase Hosting...');

// Backup current next.config.js
const configPath = path.join(__dirname, '..', 'next.config.js');
const backupPath = path.join(__dirname, '..', 'next.config.js.backup');
const firebaseConfigPath = path.join(__dirname, '..', 'next.config.firebase.js');

try {
  // Backup original config
  console.log('📋 Backing up original config...');
  fs.copyFileSync(configPath, backupPath);
  
  // Use Firebase config
  console.log('🔧 Switching to Firebase config...');
  fs.copyFileSync(firebaseConfigPath, configPath);
  
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  execSync('rm -rf out .next', { stdio: 'inherit' });
  
  // Build with static export
  console.log('🏗️  Building Next.js app...');
  execSync('NODE_OPTIONS="--max-old-space-size=4096" next build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Build complete!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} finally {
  // Restore original config
  if (fs.existsSync(backupPath)) {
    console.log('♻️  Restoring original config...');
    fs.copyFileSync(backupPath, configPath);
    fs.unlinkSync(backupPath);
  }
}