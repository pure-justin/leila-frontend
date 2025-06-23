'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedServiceImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedServiceImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  priority = false
}: OptimizedServiceImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  
  // Preload image for instant display
  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imgSrc;
      document.head.appendChild(link);
    }
  }, [imgSrc, priority]);

  const handleError = () => {
    // If WebP fails, fallback to PNG
    if (imgSrc.endsWith('.webp')) {
      setImgSrc(imgSrc.replace('.webp', '.png'));
    } else if (imgSrc.includes('-thumb')) {
      // If thumbnail fails, try without thumb
      setImgSrc(imgSrc.replace('-thumb', ''));
    } else {
      // Final fallback
      setImgSrc('/shared-assets/images/services/placeholder.svg');
    }
  };

  const imageProps = fill 
    ? { fill: true, sizes: sizes || "(max-width: 768px) 100vw, 50vw" }
    : { width: width || 400, height: height || 300 };

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        {...imageProps}
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        priority={priority}
        quality={85}
        loading={priority ? 'eager' : 'lazy'}
      />
    </>
  );
}