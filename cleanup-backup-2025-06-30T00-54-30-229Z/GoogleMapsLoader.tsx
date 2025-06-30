'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface GoogleMapsLoaderProps {
  onLoad?: () => void;
}

export default function GoogleMapsLoader({ onLoad }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      onLoad?.();
    }

    // Listen for authentication errors
    window.gm_authFailure = () => {
      const errorMsg = 'Google Maps authentication failed. Please check API key restrictions in Google Cloud Console.';
      console.error(errorMsg);
      console.error('See /docs/GOOGLE_MAPS_SETUP.md for setup instructions');
      setError(errorMsg);
    };
  }, [onLoad]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // Only log in development and client-side
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.log('GoogleMapsLoader: API Key status:', {
      exists: !!apiKey,
      length: apiKey?.length,
      prefix: apiKey?.substring(0, 10) + '...',
      currentDomain: window.location.hostname
    });
  }
  
  if (!apiKey) {
    console.error('Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
    // Return null instead of error UI - let the map component handle the fallback
    return null;
  }

  // Show error message if authentication failed
  if (error) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
        <h4 className="font-semibold text-red-800 mb-2">Maps API Error</h4>
        <p className="text-sm text-red-700 mb-3">{error}</p>
        <div className="text-xs text-red-600 space-y-1">
          <p>Quick fix:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to Google Cloud Console</li>
            <li>Add {window.location.origin}/* to allowed referrers</li>
            <li>Wait 5 minutes and refresh</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry,visualization&v=beta`}
      strategy="afterInteractive"
      onLoad={() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          onLoad?.();
          console.log('Google Maps loaded successfully');
        } else {
          console.error('Google Maps failed to load properly');
          setError('Google Maps failed to initialize. Please refresh the page.');
        }
      }}
      onError={(e) => {
        console.error('Failed to load Google Maps script:', e);
        setError('Failed to load Google Maps. Please check your internet connection.');
      }}
    />
  );
}