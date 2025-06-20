'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface GoogleMapsLoaderProps {
  onLoad?: () => void;
}

export default function GoogleMapsLoader({ onLoad }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [onLoad]);

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,drawing,geometry&v=beta`}
      strategy="afterInteractive"
      onLoad={() => {
        setIsLoaded(true);
        onLoad?.();
      }}
    />
  );
}