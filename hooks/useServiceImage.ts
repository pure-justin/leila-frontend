'use client';

import useSWR from 'swr';
import { imageService, IMAGE_SWR_CONFIG, ServiceImage } from '@/lib/image-service';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

interface UseServiceImageOptions {
  variant?: 'thumbnail' | 'card' | 'hero' | 'original';
  fallbackUrl?: string;
  preload?: boolean;
  lazy?: boolean;
}

export function useServiceImage(
  serviceId: string,
  options: UseServiceImageOptions = {}
) {
  const {
    variant = 'card',
    fallbackUrl = '/images/services/placeholder.jpg',
    preload = false,
    lazy = true
  } = options;
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '50px',
    skip: !lazy || preload
  });
  
  const shouldFetch = !lazy || inView || preload;
  
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? serviceId : null,
    IMAGE_SWR_CONFIG.fetcher,
    IMAGE_SWR_CONFIG
  );
  
  const [imageUrl, setImageUrl] = useState<string>(fallbackUrl);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (data) {
      const url = data[variant] || data.url || fallbackUrl;
      setImageUrl(url);
      
      // Preload the image
      if (typeof window !== 'undefined') {
        const img = new Image();
        img.onload = () => setIsReady(true);
        img.onerror = () => {
          setImageUrl(fallbackUrl);
          setIsReady(true);
        };
        img.src = url;
      }
    }
  }, [data, variant, fallbackUrl]);
  
  return {
    imageUrl,
    isLoading: isLoading || !isReady,
    error,
    imageData: data,
    ref,
    refetch: mutate
  };
}