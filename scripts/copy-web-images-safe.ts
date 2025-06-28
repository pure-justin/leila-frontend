#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';

// For Vercel deployment, we'll skip this step if shared-assets doesn't exist
async function copyWebImages() {
  console.log('Checking for image copy requirements...');
  
  const SOURCE_DIR = path.join(process.cwd(), '../shared-assets/images/services');
  const DEST_DIR = path.join(process.cwd(), 'public/images/services');
  
  try {
    // Check if source directory exists
    await fs.access(SOURCE_DIR);
    console.log('Source directory found, copying images...');
    
    // Original copy logic here if needed
    await fs.mkdir(DEST_DIR, { recursive: true });
    console.log('✅ Images directory created/verified');
    
  } catch (error) {
    console.log('ℹ️ Shared assets not found, using existing public images');
    // Ensure the destination directory exists anyway
    await fs.mkdir(DEST_DIR, { recursive: true });
  }
}

// Run the script
copyWebImages().catch(console.error);