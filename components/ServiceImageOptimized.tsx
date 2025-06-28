'use client';

import { useEffect, useState } from 'react';
import OptimizedImage from './OptimizedImage';
import { getServiceImage } from '@/lib/service-images-local';

interface ServiceImageOptimizedProps {
  serviceId: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  variant?: 'thumbnail' | 'hero' | 'card';
  useFirebase?: boolean; // Flag to gradually enable Firebase Storage
}

// Firebase Storage URLs (will be populated after migration)
const FIREBASE_URLS: Record<string, any> = {
  // Example structure after migration:
  // 'drain-cleaning': {
  //   thumbnail: 'https://firebasestorage.googleapis.com/...',
  //   card: 'https://firebasestorage.googleapis.com/...',
  //   hero: 'https://firebasestorage.googleapis.com/...',
  // }
};

export default function ServiceImageOptimized({
  serviceId,
  className = '',
  width = 400,
  height = 300,
  priority = false,
  variant = 'card',
  useFirebase = false // Default to false for gradual rollout
}: ServiceImageOptimizedProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const localImage = getServiceImage(serviceId);
  
  useEffect(() => {
    if (useFirebase && FIREBASE_URLS[serviceId]) {
      // Use Firebase Storage URL
      const firebaseImage = FIREBASE_URLS[serviceId];
      setImageUrl(firebaseImage[variant] || firebaseImage.card || localImage.url);
    } else {
      // Use local image
      setImageUrl(localImage.url);
    }
  }, [serviceId, variant, useFirebase, localImage.url]);
  
  return (
    <OptimizedImage
      src={imageUrl}
      alt={localImage.alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      variant={variant}
      fallbackSrc="/images/services/placeholder.jpg"
    />
  );
}