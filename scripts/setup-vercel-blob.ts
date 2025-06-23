#!/usr/bin/env node

/**
 * Setup Vercel Blob Storage for service images
 * This will handle image hosting with global CDN distribution
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface BlobConfig {
  storeName: string;
  region: 'iad1' | 'sfo1' | 'sin1' | 'syd1' | 'fra1';
}

export class VercelBlobSetup {
  private config: BlobConfig = {
    storeName: 'leila-service-images',
    region: 'iad1' // US East for best performance
  };

  async setupInstructions() {
    console.log('🚀 Vercel Blob Storage Setup Guide\n');
    
    console.log('1️⃣ Install Vercel Blob SDK:');
    console.log('   npm install @vercel/blob');
    console.log('');
    
    console.log('2️⃣ Create Blob Store in Vercel Dashboard:');
    console.log('   - Go to your Vercel project dashboard');
    console.log('   - Navigate to Storage tab');
    console.log('   - Click "Create Database"');
    console.log('   - Select "Blob" as the storage type');
    console.log(`   - Name: ${this.config.storeName}`);
    console.log(`   - Region: ${this.config.region}`);
    console.log('');
    
    console.log('3️⃣ Get your Blob Read/Write Token:');
    console.log('   - In the Blob dashboard, go to ".env.local" tab');
    console.log('   - Copy the BLOB_READ_WRITE_TOKEN');
    console.log('   - Add to your .env.local:');
    console.log('     BLOB_READ_WRITE_TOKEN=vercel_blob_...');
    console.log('');
    
    console.log('4️⃣ Configure Next.js for Blob Storage:');
    console.log('   Add to next.config.js:');
    console.log(`   images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.blob.vercel-storage.com',
        },
      ],
    }`);
    console.log('');
    
    console.log('5️⃣ Update ServiceImage component:');
    console.log('   The ServiceImage component will automatically use Blob URLs');
    console.log('');
    
    console.log('✅ Benefits of Vercel Blob:');
    console.log('   - Global CDN distribution');
    console.log('   - Automatic image optimization');
    console.log('   - No size limits on Pro plan');
    console.log('   - Built-in caching');
    console.log('   - Direct integration with Vercel');
  }

  async createUploadScript() {
    const uploadScript = `import { put, list } from '@vercel/blob';
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
    
    console.log(\`📁 Uploading \${images.length} images from \${category}...\`);
    
    for (const image of images) {
      if (!image.match(/\\.(jpg|jpeg|png|webp)$/i)) continue;
      
      const imagePath = join(categoryPath, image);
      const imageBuffer = await readFile(imagePath);
      const blobPath = \`services/\${category}/\${image}\`;
      
      try {
        const blob = await put(blobPath, imageBuffer, {
          access: 'public',
          addRandomSuffix: false,
        });
        
        console.log(\`✅ Uploaded: \${blob.url}\`);
        totalUploaded++;
      } catch (error) {
        console.error(\`❌ Failed to upload \${image}:\`, error);
      }
    }
  }
  
  console.log(\`\\n🎉 Upload complete! Total images: \${totalUploaded}\`);
  
  // List all blobs to verify
  const { blobs } = await list();
  console.log(\`\\n📋 Vercel Blob contains \${blobs.length} files\`);
}

uploadServiceImages().catch(console.error);`;

    await this.saveFile('upload-to-blob.ts', uploadScript);
    console.log('📝 Created upload-to-blob.ts script');
  }

  async createServiceImageComponent() {
    const component = `import Image from 'next/image';
import { useState } from 'react';

interface ServiceImageProps {
  serviceName: string;
  category: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * ServiceImage component with Vercel Blob Storage support
 */
export function ServiceImage({
  serviceName,
  category,
  className = '',
  width = 400,
  height = 300,
  priority = false
}: ServiceImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Generate image URL
  const getImageUrl = () => {
    // Check if we're using Vercel Blob Storage
    if (process.env.NEXT_PUBLIC_USE_BLOB_STORAGE === 'true') {
      // Vercel Blob URL format
      return \`https://\${process.env.NEXT_PUBLIC_BLOB_STORE_ID}.public.blob.vercel-storage.com/services/\${category}/\${serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}.jpg\`;
    }
    
    // Fallback to local images
    return \`/images/services/\${category}/\${serviceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}.jpg\`;
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error with fallback
  const handleError = () => {
    // Try alternative formats
    const currentExt = imgSrc.split('.').pop();
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];
    const nextExt = extensions.find(ext => ext !== currentExt);
    
    if (nextExt) {
      setImgSrc(imgSrc.replace(/\\.[^.]+$/, \`.\${nextExt}\`));
    } else {
      // Final fallback to placeholder
      setImgSrc(\`/images/services/placeholder.jpg\`);
    }
  };

  // Initialize image source
  if (!imgSrc) {
    setImgSrc(getImageUrl());
  }

  return (
    <div className={\`relative overflow-hidden \${className}\`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={imgSrc}
        alt={\`\${serviceName} service\`}
        width={width}
        height={height}
        className={\`object-cover \${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300\`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
      />
    </div>
  );
}`;

    await this.saveFile('../components/ServiceImage.tsx', component);
    console.log('📝 Updated ServiceImage component for Blob Storage');
  }

  private async saveFile(filename: string, content: string) {
    const fs = await import('fs/promises');
    await fs.writeFile(join(process.cwd(), 'scripts', filename), content);
  }
}

// Run setup
async function main() {
  const setup = new VercelBlobSetup();
  
  await setup.setupInstructions();
  await setup.createUploadScript();
  await setup.createServiceImageComponent();
  
  console.log('\n✨ Setup complete! Follow the instructions above to configure Vercel Blob Storage.');
}

main().catch(console.error);