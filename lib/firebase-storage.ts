import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export interface ImageVariant {
  width: number;
  height: number;
  quality: number;
  suffix: string;
}

export const IMAGE_VARIANTS: Record<string, ImageVariant> = {
  thumbnail: { width: 150, height: 150, quality: 60, suffix: '_thumb' },
  card: { width: 400, height: 300, quality: 75, suffix: '_card' },
  hero: { width: 1200, height: 600, quality: 85, suffix: '_hero' },
  original: { width: 2400, height: 1800, quality: 90, suffix: '' }
};

export interface UploadResult {
  originalUrl: string;
  variants: Record<string, string>;
  metadata: {
    size: number;
    contentType: string;
    uploadedAt: Date;
  };
}

export async function uploadImageToStorage(
  file: File,
  path: string,
  generateVariants = true
): Promise<UploadResult> {
  const timestamp = Date.now();
  const basePath = path.replace(/\.[^.]+$/, '');
  const extension = path.split('.').pop() || 'jpg';
  
  const results: Record<string, string> = {};
  let originalSize = 0;
  
  try {
    // Upload original
    const originalPath = `${basePath}_${timestamp}.${extension}`;
    const originalRef = ref(storage, originalPath);
    const uploadResult = await uploadBytes(originalRef, file, {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000', // 1 year cache
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    });
    
    const originalUrl = await getDownloadURL(originalRef);
    results.original = originalUrl;
    originalSize = uploadResult.metadata.size;
    
    // Generate and upload variants if needed
    if (generateVariants && file.type.startsWith('image/')) {
      const variants = await generateImageVariants(file);
      
      for (const [variantName, variantBlob] of Object.entries(variants)) {
        const variantPath = `${basePath}_${timestamp}${IMAGE_VARIANTS[variantName].suffix}.webp`;
        const variantRef = ref(storage, variantPath);
        
        await uploadBytes(variantRef, variantBlob, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
          customMetadata: {
            variant: variantName,
            originalPath: originalPath
          }
        });
        
        results[variantName] = await getDownloadURL(variantRef);
      }
    }
    
    return {
      originalUrl: results.original,
      variants: results,
      metadata: {
        size: originalSize,
        contentType: file.type,
        uploadedAt: new Date()
      }
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

async function generateImageVariants(file: File): Promise<Record<string, Blob>> {
  const variants: Record<string, Blob> = {};
  
  // Create an image element
  const img = new Image();
  const url = URL.createObjectURL(file);
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  
  // Generate each variant
  for (const [name, config] of Object.entries(IMAGE_VARIANTS)) {
    if (name === 'original') continue; // Skip original
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;
    
    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = img.width / img.height;
    let width = config.width;
    let height = config.height;
    
    if (aspectRatio > width / height) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw and compress
    ctx.drawImage(img, 0, 0, width, height);
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/webp',
        config.quality / 100
      );
    });
    
    variants[name] = blob;
  }
  
  URL.revokeObjectURL(url);
  return variants;
}

export async function deleteImageFromStorage(path: string): Promise<void> {
  try {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export function getOptimizedImageUrl(
  originalUrl: string,
  variant: keyof typeof IMAGE_VARIANTS = 'card'
): string {
  // If it's already a Firebase Storage URL, modify it for the variant
  if (originalUrl.includes('firebasestorage.googleapis.com')) {
    const baseUrl = originalUrl.split('?')[0];
    const extension = baseUrl.split('.').pop();
    const suffix = IMAGE_VARIANTS[variant].suffix;
    
    if (suffix && extension) {
      const variantUrl = baseUrl.replace(`.${extension}`, `${suffix}.webp`);
      // Add the same token from original URL
      const token = originalUrl.match(/token=([^&]+)/)?.[1];
      if (token) {
        return `${variantUrl}?alt=media&token=${token}`;
      }
      return variantUrl;
    }
  }
  
  return originalUrl;
}

// Cache management utilities
export class ImageCache {
  private static CACHE_NAME = 'leila-images-v1';
  private static MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  
  static async cacheImage(url: string): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        const response = await fetch(url);
        await cache.put(url, response);
      } catch (error) {
        console.error('Error caching image:', error);
      }
    }
  }
  
  static async getCachedImage(url: string): Promise<Response | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        const response = await cache.match(url);
        return response || null;
      } catch (error) {
        console.error('Error getting cached image:', error);
        return null;
      }
    }
    return null;
  }
  
  static async clearOldCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.CACHE_NAME);
        const requests = await cache.keys();
        
        // Remove oldest entries if cache is too large
        if (requests.length > 100) {
          const toDelete = requests.slice(0, requests.length - 100);
          await Promise.all(toDelete.map(req => cache.delete(req)));
        }
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }
  }
}