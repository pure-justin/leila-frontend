'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import AnimatedImagePlaceholder from './AnimatedImagePlaceholder';

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
  const [hasError, setHasError] = useState(false);
  
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
    // Try different fallback patterns
    const basePath = imgSrc.substring(0, imgSrc.lastIndexOf('/') + 1);
    const filename = imgSrc.substring(imgSrc.lastIndexOf('/') + 1);
    
    // Extract the base name (e.g., 'pipe-installation' from 'pipe-installation-1-thumb.webp')
    const match = filename.match(/^([a-z-]+)/);
    const baseName = match ? match[1] : '';
    
    // Define fallback patterns
    const fallbackPatterns = [
      filename.replace('.webp', '.png'), // Try PNG version
      `${baseName}-thumbnail.jpg`, // Try -thumbnail pattern
      `${baseName}-card.jpg`, // Try -card pattern  
      `${baseName}-1.webp`, // Try numbered pattern
      `${baseName}-1.png`, // Try numbered PNG
      `${baseName}.jpg`, // Try base name
    ];
    
    // Find the current pattern index
    const currentIndex = fallbackPatterns.findIndex(pattern => 
      imgSrc.endsWith(pattern) || filename === pattern
    );
    
    // Try next pattern
    if (currentIndex < fallbackPatterns.length - 1) {
      const nextPattern = fallbackPatterns[currentIndex + 1] || fallbackPatterns[0];
      setImgSrc(basePath + nextPattern);
    } else {
      // Final fallback - show animated placeholder
      setHasError(true);
    }
  };

  const imageProps = fill 
    ? { fill: true, sizes: sizes || "(max-width: 768px) 100vw, 50vw" }
    : { width: width || 400, height: height || 300 };

  // If error occurred, show animated placeholder
  if (hasError) {
    return <AnimatedImagePlaceholder className={className} />;
  }

  return (
    <>
      {isLoading && (
        <AnimatedImagePlaceholder className="absolute inset-0" />
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