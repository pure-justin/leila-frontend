import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToStorage } from '@/lib/firebase-storage';

let sharp: any;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not available, image optimization disabled');
}

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

interface UploadResponse {
  success: boolean;
  urls?: {
    original: string;
    thumbnail?: string;
    card?: string;
    hero?: string;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string || 'uploads';
    const generateVariants = formData.get('generateVariants') !== 'false';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Convert to buffer for processing
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let processedFile = file;
    
    // Only process if sharp is available
    if (sharp) {
      // Check image dimensions and compress if needed
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // If image is too large, resize it
      if (metadata.width && metadata.width > 2400) {
        const processedBuffer = await image
          .resize(2400, null, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .jpeg({ quality: 90, progressive: true })
          .toBuffer();
        
        // Create new file from processed buffer
        processedFile = new File([processedBuffer], file.name, {
          type: 'image/jpeg'
        });
      }
    }
    
    // Upload to Firebase Storage
    const result = await uploadImageToStorage(
      processedFile,
      `${path}/${file.name}`,
      generateVariants
    );
    
    // Return URLs
    return NextResponse.json({
      success: true,
      urls: {
        original: result.originalUrl,
        thumbnail: result.variants.thumbnail,
        card: result.variants.card,
        hero: result.variants.hero
      }
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to upload image' 
      },
      { status: 500 }
    );
  }
}