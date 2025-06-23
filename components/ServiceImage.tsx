import Image from 'next/image';
import { useState } from 'react';

interface ServiceImageProps {
  category: string;
  subcategory: string;
  variant?: 'hero' | 'thumbnail' | 'card' | 'mobile';
  alt?: string;
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
  const [imgSrc, setImgSrc] = useState(`/shared-assets/images/services/${category}/${subcategory}-${variant}.jpg`);
  const [hasError, setHasError] = useState(false);
  
  const dimensions = {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  };
  
  const { width, height } = dimensions[variant];
  
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback to placeholder
      setImgSrc('/shared-assets/images/services/placeholder.jpg');
    }
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imgSrc}
        alt={alt || `${category} - ${subcategory} service`}
        width={width}
        height={height}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onError={handleError}
        className="object-cover w-full h-full"
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}

export default ServiceImage;