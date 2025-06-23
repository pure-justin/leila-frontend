import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

// IMPORTANT: Use the main shared-assets folder, not the public symlink
const IMAGES_DIR = path.join(process.cwd(), '../../shared-assets/images/services');
const QUALITY = 85; // WebP quality (85 is a good balance)

async function convertToWebP() {
  console.log('🖼️  Converting images to WebP format...');
  
  try {
    const categories = await fs.readdir(IMAGES_DIR);
    let totalConverted = 0;
    
    for (const category of categories) {
      const categoryPath = path.join(IMAGES_DIR, category);
      const stat = await fs.stat(categoryPath);
      
      if (!stat.isDirectory()) continue;
      
      console.log(`\n📁 Processing ${category}...`);
      const files = await fs.readdir(categoryPath);
      
      for (const file of files) {
        if (!file.endsWith('.png')) continue;
        
        const inputPath = path.join(categoryPath, file);
        const outputPath = inputPath.replace('.png', '.webp');
        
        try {
          // Skip if WebP already exists
          try {
            await fs.access(outputPath);
            continue;
          } catch {}
          
          // Convert PNG to WebP
          await sharp(inputPath)
            .webp({ quality: QUALITY })
            .toFile(outputPath);
          
          totalConverted++;
          console.log(`  ✅ ${file} → ${file.replace('.png', '.webp')}`);
        } catch (error) {
          console.error(`  ❌ Failed to convert ${file}:`, error);
        }
      }
    }
    
    console.log(`\n✨ Converted ${totalConverted} images to WebP format!`);
  } catch (error) {
    console.error('Error converting images:', error);
  }
}

// Run the conversion
convertToWebP();