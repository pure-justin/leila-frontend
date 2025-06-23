import Image from 'next/image';
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
      return `https://${process.env.NEXT_PUBLIC_BLOB_STORE_ID}.public.blob.vercel-storage.com/services/${category}/${serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}.jpg`;
    }
    
    // Fallback to local images
    return `/images/services/${category}/${serviceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}.jpg`;
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
      setImgSrc(imgSrc.replace(/\.[^.]+$/, `.${nextExt}`));
    } else {
      // Final fallback to placeholder
      setImgSrc(`/images/services/placeholder.jpg`);
    }
  };

  // Initialize image source
  if (!imgSrc) {
    setImgSrc(getImageUrl());
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={imgSrc}
        alt={`${serviceName} service`}
        width={width}
        height={height}
        className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
      />
    </div>
  );
}