import Image from 'next/image';
import { useState } from 'react';

interface SimpleServiceImageProps {
  serviceName: string;
  category: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function SimpleServiceImage({ 
  serviceName, 
  category, 
  className = '',
  width = 400,
  height = 300 
}: SimpleServiceImageProps) {
  const [error, setError] = useState(false);
  const [imgNumber, setImgNumber] = useState(1);

  // Clean service name for file path
  const cleanName = serviceName.toLowerCase()
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
    .replace(/\s+/g, '-');

  // Try different image paths
  const getImagePath = () => {
    if (error && imgNumber < 4) {
      return `/shared-assets/images/services/${category}/${cleanName}-${imgNumber + 1}.webp`;
    }
    return `/shared-assets/images/services/${category}/${cleanName}-${imgNumber}.webp`;
  };

  const handleError = () => {
    if (imgNumber < 4) {
      setImgNumber(imgNumber + 1);
    } else {
      setError(true);
    }
  };

  // Fallback to placeholder
  if (error && imgNumber >= 4) {
    return (
      <img
        src="/shared-assets/images/services/placeholder.jpg"
        alt={serviceName}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  return (
    <img
      src={getImagePath()}
      alt={serviceName}
      onError={handleError}
      className={className}
      width={width}
      height={height}
    />
  );
}