#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';

const SOURCE_DIR = path.join(process.cwd(), '../shared-assets/images/services');
const DEST_DIR = path.join(process.cwd(), 'public/images/services');

// Define which images we need for the web app (thumbnails and hero images only)
const ESSENTIAL_PATTERNS = [
  '*-1-thumb.webp',  // Thumbnail images
  '*-1.webp',        // Main images
  '*-hero.jpg',      // Hero images
  'placeholder.jpg'   // Placeholder
];

// Categories to include
const WEB_CATEGORIES = [
  'electrical',
  'plumbing', 
  'hvac',
  'cleaning',
  'handyman',
  'landscaping',
  'appliance',
  'pest-control',
  'automotive',
  'moving'
];

async function copyWebImages() {
  console.log('Copying essential images for web app...');
  
  // Ensure destination directory exists
  await fs.mkdir(DEST_DIR, { recursive: true });
  
  let copiedCount = 0;
  
  for (const category of WEB_CATEGORIES) {
    const categorySource = path.join(SOURCE_DIR, category);
    const categoryDest = path.join(DEST_DIR, category);
    
    try {
      // Check if category exists
      await fs.access(categorySource);
      
      // Create category directory
      await fs.mkdir(categoryDest, { recursive: true });
      
      // Read all files in category
      const files = await fs.readdir(categorySource);
      
      // Copy only essential files
      for (const file of files) {
        // Check if file matches essential patterns
        const isEssential = ESSENTIAL_PATTERNS.some(pattern => {
          const regex = new RegExp(pattern.replace('*', '.*'));
          return regex.test(file);
        });
        
        if (isEssential) {
          const sourcePath = path.join(categorySource, file);
          const destPath = path.join(categoryDest, file);
          
          // Check if file already exists and has same size
          try {
            const sourceStats = await fs.stat(sourcePath);
            const destStats = await fs.stat(destPath);
            
            if (sourceStats.size === destStats.size) {
              // Skip if file already exists with same size
              continue;
            }
          } catch {
            // File doesn't exist in destination, proceed with copy
          }
          
          await fs.copyFile(sourcePath, destPath);
          copiedCount++;
          console.log(`✓ Copied ${category}/${file}`);
        }
      }
    } catch (error) {
      console.log(`⚠ Category ${category} not found, skipping...`);
    }
  }
  
  // Copy placeholder image
  try {
    const placeholderSource = path.join(SOURCE_DIR, 'placeholder.jpg');
    const placeholderDest = path.join(DEST_DIR, 'placeholder.jpg');
    await fs.copyFile(placeholderSource, placeholderDest);
    copiedCount++;
  } catch (error) {
    console.log('⚠ Placeholder image not found');
  }
  
  // Copy favicons
  const faviconSource = path.join(process.cwd(), '../shared-assets/favicons');
  const faviconDest = path.join(process.cwd(), 'public');
  
  try {
    await fs.copyFile(
      path.join(faviconSource, 'favicon.ico'),
      path.join(faviconDest, 'favicon.ico')
    );
    await fs.copyFile(
      path.join(faviconSource, 'favicon.png'),
      path.join(faviconDest, 'favicon.png')
    );
    console.log('✓ Copied favicon files');
  } catch (error) {
    console.log('⚠ Some favicon files not found');
  }
  
  console.log(`\n✅ Copied ${copiedCount} essential images for web app`);
  console.log('💡 Full image set remains available in shared-assets for native apps');
}

// Run the script
copyWebImages().catch(console.error);