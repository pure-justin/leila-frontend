'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { getOptimizedImageUrl, ImageCache } from '@/lib/firebase-storage';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  variant?: 'thumbnail' | 'card' | 'hero' | 'original';
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Memory monitoring utility
class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryThreshold = 0.8; // 80% memory usage threshold
  
  static getInstance(): MemoryMonitor {
    if (!this.instance) {
      this.instance = new MemoryMonitor();
    }
    return this.instance;
  }
  
  async checkMemoryPressure(): Promise<boolean> {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return usageRatio > this.memoryThreshold;
    }
    return false;
  }
  
  async shouldLoadImage(priority: boolean): Promise<boolean> {
    if (priority) return true;
    
    const hasMemoryPressure = await this.checkMemoryPressure();
    if (hasMemoryPressure) {
      // Under memory pressure, be more selective
      return false;
    }
    
    return true;
  }
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  fill = false,
  sizes,
  variant = 'card',
  fallbackSrc = '/images/services/placeholder.jpg',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const loadAttempts = useRef(0);
  const memoryMonitor = MemoryMonitor.getInstance();
  
  // Optimize image URL for Firebase Storage
  useEffect(() => {
    if (src.includes('firebasestorage.googleapis.com')) {
      const optimizedUrl = getOptimizedImageUrl(src, variant);
      setImageSrc(optimizedUrl);
    }
  }, [src, variant]);
  
  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      async (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const canLoad = await memoryMonitor.shouldLoadImage(false);
            if (canLoad) {
              setIsInView(true);
              setShouldLoad(true);
              observer.disconnect();
            }
          }
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before viewport
        threshold: 0.01,
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority, shouldLoad, memoryMonitor]);
  
  // Handle image loading with retry logic
  const handleLoad = useCallback(async () => {
    setIsLoading(false);
    setHasError(false);
    loadAttempts.current = 0;
    
    // Cache the image for offline use
    if (imageSrc.includes('firebasestorage.googleapis.com')) {
      await ImageCache.cacheImage(imageSrc);
    }
    
    onLoad?.();
  }, [imageSrc, onLoad]);
  
  const handleError = useCallback(async () => {
    loadAttempts.current += 1;
    
    // Try to load from cache first
    const cachedResponse = await ImageCache.getCachedImage(imageSrc);
    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      const objectUrl = URL.createObjectURL(blob);
      setImageSrc(objectUrl);
      return;
    }
    
    // Retry with exponential backoff
    if (loadAttempts.current < 3) {
      const delay = Math.pow(2, loadAttempts.current) * 1000;
      setTimeout(() => {
        setImageSrc(src + '?retry=' + loadAttempts.current);
      }, delay);
    } else {
      // Fall back to placeholder
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  }, [imageSrc, src, fallbackSrc, onError]);
  
  // Progressive enhancement: show low-quality placeholder first
  const placeholderDataUrl = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect width="100%" height="100%" fill="url(#gradient)" opacity="0.5"/>
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>`
  ).toString('base64')}`;
  
  if (!isInView || !shouldLoad) {
    return (
      <div
        ref={imgRef}
        className={`${className} bg-gray-100 animate-pulse relative overflow-hidden`}
        style={fill ? {} : { width, height }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
      </div>
    );
  }
  
  return (
    <div ref={imgRef} className={`relative ${className}`} style={fill ? {} : { width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
        </div>
      )}
      
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          quality={variant === 'thumbnail' ? 60 : variant === 'hero' ? 85 : 75}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={placeholderDataUrl}
          className={hasError ? 'opacity-50' : ''}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          quality={variant === 'thumbnail' ? 60 : variant === 'hero' ? 85 : 75}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          placeholder="blur"
          blurDataURL={placeholderDataUrl}
          className={hasError ? 'opacity-50' : ''}
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
}