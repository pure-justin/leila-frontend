import { put, list } from '@vercel/blob';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

/**
 * Upload all service images to Vercel Blob Storage
 */
async function uploadServiceImages() {
  const IMAGES_DIR = join(process.cwd(), 'public/images/services');
  const categories = await readdir(IMAGES_DIR);
  
  let totalUploaded = 0;
  
  for (const category of categories) {
    const categoryPath = join(IMAGES_DIR, category);
    const images = await readdir(categoryPath);
    
    console.log(`📁 Uploading ${images.length} images from ${category}...`);
    
    for (const image of images) {
      if (!image.match(/\.(jpg|jpeg|png|webp)$/i)) continue;
      
      const imagePath = join(categoryPath, image);
      const imageBuffer = await readFile(imagePath);
      const blobPath = `services/${category}/${image}`;
      
      try {
        const blob = await put(blobPath, imageBuffer, {
          access: 'public',
          addRandomSuffix: false,
        });
        
        console.log(`✅ Uploaded: ${blob.url}`);
        totalUploaded++;
      } catch (error) {
        console.error(`❌ Failed to upload ${image}:`, error);
      }
    }
  }
  
  console.log(`\n🎉 Upload complete! Total images: ${totalUploaded}`);
  
  // List all blobs to verify
  const { blobs } = await list();
  console.log(`\n📋 Vercel Blob contains ${blobs.length} files`);
}

uploadServiceImages().catch(console.error);