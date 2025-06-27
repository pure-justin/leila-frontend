#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Configuration
const DOWNLOADS_DIR = path.join(process.env.HOME, 'Downloads');
const OUTPUT_DIR = path.join(__dirname, '../../shared-assets/images/services');

// Image mappings - map downloaded files to service categories
const IMAGE_MAPPINGS = {
  // Add mappings as you download images
  // Example: 'image_2024_electrical.jpg': { category: 'electrical', subcategory: 'outlet-installation' }
};

// Sizes to generate
const SIZES = {
  hero: { width: 1920, height: 1080 },
  thumbnail: { width: 800, height: 800 },
  card: { width: 400, height: 300 },
  mobile: { width: 375, height: 200 }
};

async function processImage(inputPath, category, subcategory) {
  console.log(`\n📸 Processing ${category}/${subcategory}`);
  
  const categoryDir = path.join(OUTPUT_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  
  try {
    // Read the original image
    const imageBuffer = fs.readFileSync(inputPath);
    
    // Generate each size variant
    for (const [sizeName, dimensions] of Object.entries(SIZES)) {
      const outputPath = path.join(categoryDir, `${subcategory}-${sizeName}.jpg`);
      
      await sharp(imageBuffer)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 85, 
          progressive: true,
          mozjpeg: true 
        })
        .toFile(outputPath);
      
      console.log(`✅ Created ${sizeName} (${dimensions.width}x${dimensions.height})`);
    }
    
    // Copy original as backup
    const backupPath = path.join(categoryDir, `${subcategory}-original.jpg`);
    fs.copyFileSync(inputPath, backupPath);
    console.log(`💾 Saved original as backup`);
    
  } catch (error) {
    console.error(`❌ Error processing image:`, error.message);
  }
}

async function watchDownloads() {
  console.log('👀 Watching Downloads folder for new images...');
  console.log(`📁 ${DOWNLOADS_DIR}\n`);
  console.log('Instructions:');
  console.log('1. Download images from Google ImageFX');
  console.log('2. Name them like: electrical-outlet.jpg');
  console.log('3. This script will automatically process them\n');
  
  // Watch for new files
  fs.watch(DOWNLOADS_DIR, async (eventType, filename) => {
    if (eventType === 'rename' && filename) {
      const filePath = path.join(DOWNLOADS_DIR, filename);
      
      // Check if it's an image file
      if (filename.match(/\.(jpg|jpeg|png|webp)$/i) && fs.existsSync(filePath)) {
        // Parse filename to get category and subcategory
        const match = filename.match(/^([a-z-]+)-([a-z-]+)\./);
        
        if (match) {
          const [, category, subcategory] = match;
          console.log(`\n🆕 New image detected: ${filename}`);
          
          // Wait a bit for download to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await processImage(filePath, category, subcategory);
          
          // Move to processed folder
          const processedDir = path.join(DOWNLOADS_DIR, 'processed-leila');
          if (!fs.existsSync(processedDir)) {
            fs.mkdirSync(processedDir);
          }
          
          fs.renameSync(filePath, path.join(processedDir, filename));
          console.log(`📦 Moved to processed folder`);
        } else {
          console.log(`\n⚠️  Invalid filename format: ${filename}`);
          console.log('   Expected format: category-subcategory.jpg');
          console.log('   Example: electrical-outlet.jpg');
        }
      }
    }
  });
}

async function processBatch() {
  console.log('🔄 Processing batch of images...\n');
  
  // Look for images in Downloads folder
  const files = fs.readdirSync(DOWNLOADS_DIR)
    .filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
    .filter(f => f.includes('-'));
  
  if (files.length === 0) {
    console.log('No images found in Downloads folder.');
    console.log('\nExpected filename format: category-subcategory.jpg');
    console.log('Examples:');
    console.log('  electrical-outlet.jpg');
    console.log('  plumbing-faucet.jpg');
    console.log('  hvac-ac.jpg');
    return;
  }
  
  for (const file of files) {
    const match = file.match(/^([a-z-]+)-([a-z-]+)\./);
    if (match) {
      const [, category, subcategory] = match;
      await processImage(path.join(DOWNLOADS_DIR, file), category, subcategory);
    }
  }
  
  console.log('\n✨ Batch processing complete!');
}

// Main execution
const command = process.argv[2];

if (command === 'watch') {
  watchDownloads();
} else if (command === 'batch') {
  processBatch();
} else {
  console.log('📸 Leila Image Processor\n');
  console.log('Usage:');
  console.log('  npm run process:watch    - Watch Downloads folder for new images');
  console.log('  npm run process:batch    - Process all images in Downloads folder');
  console.log('\nFilename format: category-subcategory.jpg');
  console.log('Example: electrical-outlet.jpg');
}