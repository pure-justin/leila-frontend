'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ServiceImageProps {
  category: string;
  subcategory: string;
  variant?: 'thumbnail' | 'hero' | 'card';
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ServiceImage({
  category,
  subcategory,
  variant = 'card',
  alt,
  className = '',
  priority = false
}: ServiceImageProps) {
  // Determine the correct image path based on variant
  const getImagePath = () => {
    switch (variant) {
      case 'thumbnail':
        return `/images/services/${category}/${subcategory}-1-thumb.webp`;
      case 'hero':
        return `/images/services/${category}/${subcategory}-hero.jpg`;
      case 'card':
      default:
        return `/images/services/${category}/${subcategory}-1.webp`;
    }
  };
  
  const [imgSrc, setImgSrc] = useState(getImagePath);
  const [hasError, setHasError] = useState(false);
  
  // Dimensions based on variant
  const dimensions = {
    thumbnail: { width: 150, height: 150 },
    hero: { width: 1200, height: 600 },
    card: { width: 400, height: 300 }
  };
  
  const { width, height } = dimensions[variant];
  
  // Handle image loading error
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('/images/services/placeholder.jpg');
    }
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className="object-cover w-full h-full"
        priority={priority}
        onError={handleError}
        unoptimized={imgSrc.includes('placeholder')} // Don't optimize placeholder
      />
    </div>
  );
}