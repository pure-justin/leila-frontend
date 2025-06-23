import Image from 'next/image';
import { useState } from 'react';
import { getPossibleImagePaths, getServiceImageUrl } from '@/lib/service-image-utils';

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
  const [fallbackPaths, setFallbackPaths] = useState<string[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate image URL
  const getImageUrl = () => {
    // Use service image utility to get the URL
    const serviceId = serviceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return getServiceImageUrl(serviceId);
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle image error with fallback
  const handleError = () => {
    // Initialize fallback paths if not already done
    if (fallbackPaths.length === 0) {
      const serviceId = serviceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const paths = getPossibleImagePaths(serviceId);
      setFallbackPaths(paths);
      setCurrentPathIndex(0);
      
      // Try the first fallback
      if (paths.length > 0) {
        setImgSrc(paths[0]);
      }
      return;
    }
    
    // Try next fallback path
    const nextIndex = currentPathIndex + 1;
    if (nextIndex < fallbackPaths.length) {
      setCurrentPathIndex(nextIndex);
      setImgSrc(fallbackPaths[nextIndex]);
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