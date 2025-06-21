'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface GoogleMapsLoaderProps {
  onLoad?: () => void;
}

export default function GoogleMapsLoader({ onLoad }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      onLoad?.();
    }
  }, [onLoad]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('GoogleMapsLoader: API Key status:', {
      exists: !!apiKey,
      length: apiKey?.length,
      prefix: apiKey?.substring(0, 10) + '...'
    });
  }
  
  if (!apiKey) {
    console.error('Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
    // Return null instead of error UI - let the map component handle the fallback
    return null;
  }

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry,visualization,solarLayer&v=beta`}
      strategy="afterInteractive"
      onLoad={() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          onLoad?.();
        } else {
          console.error('Google Maps failed to load');
          setError(true);
        }
      }}
      onError={() => {
        console.error('Failed to load Google Maps script');
        setError(true);
      }}
    />
  );
}