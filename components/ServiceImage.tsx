'use client';

import dynamic from 'next/dynamic';
import { getServiceImage } from '@/lib/service-images-local';

// Lazy load the LazyImage component itself
const LazyImage = dynamic(() => import('./LazyImage'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded" />,
  ssr: false
});

interface ServiceImageProps {
  serviceId: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  variant?: 'thumbnail' | 'hero' | 'card';
}

export default function ServiceImage({
  serviceId,
  className = '',
  width = 400,
  height = 300,
  priority = false,
  variant = 'card'
}: ServiceImageProps) {
  const image = getServiceImage(serviceId);
  
  // Adjust dimensions based on variant
  const dimensions = {
    thumbnail: { width: 150, height: 150 },
    hero: { width: 1200, height: 600 },
    card: { width: 400, height: 300 }
  };
  
  const { width: w, height: h } = dimensions[variant] || { width, height };
  
  return (
    <LazyImage
      src={image.url}
      alt={image.alt}
      width={w}
      height={h}
      className={className}
      priority={priority}
      quality={variant === 'thumbnail' ? 60 : 75}
    />
  );
}