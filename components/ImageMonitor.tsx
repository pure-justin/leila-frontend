'use client';

import { useEffect } from 'react';

export function ImageMonitor() {
  useEffect(() => {
    // Monitor all image loading errors
    const handleImageError = (event: Event) => {
      const target = event.target as HTMLImageElement;
      if (target && target.tagName === 'IMG') {
        console.error('Image failed to load:', {
          src: target.src,
          alt: target.alt,
          naturalWidth: target.naturalWidth,
          naturalHeight: target.naturalHeight,
          complete: target.complete,
          currentSrc: target.currentSrc
        });

        // Log to a monitoring service in production
        if (process.env.NODE_ENV === 'production') {
          // Example: Send to analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'image_load_error', {
              event_category: 'errors',
              event_label: target.src,
              value: 1
            });
          }
        }
      }
    };

    // Monitor all image load events
    const handleImageLoad = (event: Event) => {
      const target = event.target as HTMLImageElement;
      if (target && target.tagName === 'IMG') {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Image loaded successfully:', {
            src: target.src,
            dimensions: `${target.naturalWidth}x${target.naturalHeight}`
          });
        }
      }
    };

    // Add global listeners
    window.addEventListener('error', handleImageError, true);
    window.addEventListener('load', handleImageLoad, true);

    // Monitor dynamically added images
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IMG') {
            const img = node as HTMLImageElement;
            
            // Check if already loaded
            if (img.complete && img.naturalWidth === 0) {
              console.error('Image failed to load (from MutationObserver):', img.src);
            }
            
            // Add individual listeners
            img.addEventListener('error', handleImageError);
            img.addEventListener('load', handleImageLoad);
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Log initial image status
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (img.complete && img.naturalWidth === 0) {
        console.error('Image failed to load (initial check):', img.src);
      }
    });

    // Cleanup
    return () => {
      window.removeEventListener('error', handleImageError, true);
      window.removeEventListener('load', handleImageLoad, true);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}