'use client';

import { useEffect, useCallback, useState } from 'react';

interface ServiceWorkerHookResult {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  isReady: boolean;
  cacheImages: (urls: string[]) => Promise<void>;
  clearOldCaches: () => Promise<void>;
  preloadCriticalImages: () => Promise<void>;
}

export function useServiceWorker(): ServiceWorkerHookResult {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
  
  useEffect(() => {
    if (!isSupported) return;
    
    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        setIsReady(true);
        
        // Check for updates periodically
        setInterval(() => {
          reg.update();
        }, 60 * 60 * 1000); // Check every hour
        
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };
    
    registerServiceWorker();
    
    // Handle service worker updates
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
    
  }, [isSupported]);
  
  const sendMessage = useCallback(async (message: any): Promise<void> => {
    if (!isReady || !navigator.serviceWorker.controller) {
      console.warn('Service worker not ready');
      return;
    }
    
    navigator.serviceWorker.controller.postMessage(message);
  }, [isReady]);
  
  const cacheImages = useCallback(async (urls: string[]): Promise<void> => {
    await sendMessage({ type: 'CACHE_IMAGES', urls });
  }, [sendMessage]);
  
  const clearOldCaches = useCallback(async (): Promise<void> => {
    await sendMessage({ type: 'CLEAR_OLD_CACHES' });
  }, [sendMessage]);
  
  const preloadCriticalImages = useCallback(async (): Promise<void> => {
    await sendMessage({ type: 'PRELOAD_CRITICAL_IMAGES' });
  }, [sendMessage]);
  
  return {
    registration,
    isSupported,
    isReady,
    cacheImages,
    clearOldCaches,
    preloadCriticalImages
  };
}

// Memory monitoring hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
    usagePercentage: number;
  } | null>(null);
  
  useEffect(() => {
    if (!('memory' in performance)) return;
    
    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage
      });
    };
    
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryInfo;
}

// Image preloading utility
export function useImagePreloader() {
  const { cacheImages } = useServiceWorker();
  
  const preloadImages = useCallback(async (urls: string[]) => {
    // Browser preloading
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
    
    // Service worker caching
    await cacheImages(urls);
  }, [cacheImages]);
  
  return { preloadImages };
}

