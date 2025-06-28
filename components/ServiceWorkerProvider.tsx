'use client';

import { useEffect } from 'react';
import { useServiceWorker, useMemoryMonitor } from '@/hooks/useServiceWorker';

export default function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { isSupported, isReady, clearOldCaches, preloadCriticalImages } = useServiceWorker();
  const memoryInfo = useMemoryMonitor();
  
  useEffect(() => {
    if (!isReady) return;
    
    // Preload critical images on app start
    preloadCriticalImages();
    
    // Clear old caches periodically
    const cleanupInterval = setInterval(() => {
      clearOldCaches();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
    
    return () => clearInterval(cleanupInterval);
  }, [isReady, clearOldCaches, preloadCriticalImages]);
  
  useEffect(() => {
    // Monitor memory usage and warn if high
    if (memoryInfo && memoryInfo.usagePercentage > 90) {
      console.warn('High memory usage detected:', memoryInfo.usagePercentage.toFixed(2) + '%');
      // Could trigger additional cleanup or reduced image quality here
    }
  }, [memoryInfo]);
  
  // Development mode logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Service Worker Support:', isSupported);
      console.log('Service Worker Ready:', isReady);
      if (memoryInfo) {
        console.log('Memory Usage:', memoryInfo.usagePercentage.toFixed(2) + '%');
      }
    }
  }, [isSupported, isReady, memoryInfo]);
  
  return <>{children}</>;
}