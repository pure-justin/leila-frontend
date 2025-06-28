import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
let sharp: any;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp not available, cannot run migration');
  process.exit(1);
}
import dotenv from 'dotenv';

dotenv.config({ path: join(process.cwd(), '../.env') });

// Initialize Firebase Admin
const serviceAccountPath = join(process.cwd(), '../service-account-key.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
});

const bucket = getStorage().bucket();

interface ImageVariant {
  width: number;
  height: number;
  quality: number;
  suffix: string;
  format: 'webp' | 'jpeg';
}

const IMAGE_VARIANTS: Record<string, ImageVariant> = {
  thumbnail: { width: 150, height: 150, quality: 60, suffix: '_thumb', format: 'webp' },
  card: { width: 400, height: 300, quality: 75, suffix: '_card', format: 'webp' },
  hero: { width: 1200, height: 600, quality: 85, suffix: '_hero', format: 'webp' },
  original: { width: 2400, height: 1800, quality: 90, suffix: '', format: 'jpeg' }
};

async function processImage(filePath: string, outputPath: string): Promise<void> {
  const image = sharp(filePath);
  const metadata = await image.metadata();
  
  console.log(`Processing ${basename(filePath)}...`);
  
  // Generate variants
  for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
    try {
      const variantOutputPath = outputPath.replace(
        extname(outputPath),
        `${config.suffix}.${config.format}`
      );
      
      // Calculate dimensions maintaining aspect ratio
      let width = config.width;
      let height = config.height;
      
      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height;
        if (aspectRatio > width / height) {
          height = Math.round(width / aspectRatio);
        } else {
          width = Math.round(height * aspectRatio);
        }
      }
      
      // Process and save
      let pipeline = sharp(filePath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        });
      
      if (config.format === 'webp') {
        pipeline = pipeline.webp({ quality: config.quality });
      } else {
        pipeline = pipeline.jpeg({ quality: config.quality, progressive: true });
      }
      
      const buffer = await pipeline.toBuffer();
      
      // Upload to Firebase Storage
      const file = bucket.file(variantOutputPath);
      await file.save(buffer, {
        metadata: {
          contentType: config.format === 'webp' ? 'image/webp' : 'image/jpeg',
          cacheControl: 'public, max-age=31536000',
          metadata: {
            variant: variantName,
            originalName: basename(filePath),
            processedAt: new Date().toISOString()
          }
        }
      });
      
      // Make public
      await file.makePublic();
      
      console.log(`  ✓ Uploaded ${variantName} variant: ${variantOutputPath}`);
    } catch (error) {
      console.error(`  ✗ Error processing ${variantName} variant:`, error);
    }
  }
}

async function migrateImages(directory: string, firebasePath: string): Promise<void> {
  const files = readdirSync(directory);
  
  for (const file of files) {
    const fullPath = join(directory, file);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await migrateImages(fullPath, `${firebasePath}/${file}`);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      // Process image file
      const outputPath = `${firebasePath}/${file}`;
      try {
        await processImage(fullPath, outputPath);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
}

async function generateImageManifest(): Promise<void> {
  console.log('\nGenerating image manifest...');
  
  const [files] = await bucket.getFiles();
  const manifest: Record<string, any> = {};
  
  files.forEach(file => {
    if (file.name.startsWith('images/services/')) {
      const path = file.name.replace('images/services/', '');
      const parts = path.split('/');
      
      let current = manifest;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      const filename = parts[parts.length - 1];
      const baseFilename = filename.replace(/_thumb|_card|_hero/, '').replace(/\.\w+$/, '');
      
      if (!current[baseFilename]) {
        current[baseFilename] = {
          variants: {}
        };
      }
      
      const publicUrl = file.publicUrl();
      
      if (filename.includes('_thumb')) {
        current[baseFilename].variants.thumbnail = publicUrl;
      } else if (filename.includes('_card')) {
        current[baseFilename].variants.card = publicUrl;
      } else if (filename.includes('_hero')) {
        current[baseFilename].variants.hero = publicUrl;
      } else {
        current[baseFilename].variants.original = publicUrl;
      }
    }
  });
  
  // Save manifest
  const manifestPath = join(process.cwd(), 'lib/firebase-image-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Image manifest saved to ${manifestPath}`);
}

async function main() {
  try {
    console.log('Starting image migration to Firebase Storage...\n');
    
    const imagesDir = join(process.cwd(), 'public/images/services');
    const firebasePath = 'images/services';
    
    // Check if source directory exists
    if (!existsSync(imagesDir)) {
      console.error(`Error: Images directory not found at ${imagesDir}`);
      process.exit(1);
    }
    
    // Migrate images
    await migrateImages(imagesDir, firebasePath);
    
    // Generate manifest
    await generateImageManifest();
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your components to use the new Firebase Storage URLs');
    console.log('2. Test image loading in your application');
    console.log('3. Consider removing local images from public folder to reduce build size');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Import statements for fs
import { existsSync, writeFileSync } from 'fs';

main();