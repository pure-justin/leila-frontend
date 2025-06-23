import { useState, useEffect, useRef } from 'react';

interface UseOptimizedImageOptions {
  src: string;
  srcSet?: string;
  sizes?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

interface UseOptimizedImageReturn {
  imageSrc: string;
  isLoading: boolean;
  isError: boolean;
  isInView: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
}

export function useOptimizedImage({
  src,
  srcSet,
  sizes,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect width="1" height="1" fill="%23f3f4f6"/%3E%3C/svg%3E',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}: UseOptimizedImageOptions): UseOptimizedImageReturn {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!imageRef.current || !('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(imageRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView) return;

    let isMounted = true;
    const img = new Image();

    // Preload image
    img.onload = () => {
      if (isMounted) {
        setImageSrc(src);
        setIsLoading(false);
        setIsError(false);
        onLoad?.();
      }
    };

    img.onerror = () => {
      if (isMounted) {
        setIsLoading(false);
        setIsError(true);
        onError?.();
      }
    };

    // Set image attributes
    img.src = src;
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;

    // Decode image for smoother rendering
    if ('decode' in img) {
      img.decode().catch(() => {
        // Fallback if decode fails
      });
    }

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, srcSet, sizes, isInView, onLoad, onError]);

  return {
    imageSrc,
    isLoading,
    isError,
    isInView,
    imageRef
  };
}

// Utility function to generate responsive image srcSet
export function generateSrcSet(baseSrc: string, sizes: number[]): string {
  const extension = baseSrc.split('.').pop();
  const baseWithoutExt = baseSrc.replace(`.${extension}`, '');
  
  return sizes
    .map(size => `${baseWithoutExt}-${size}w.${extension} ${size}w`)
    .join(', ');
}

// Utility function to preload critical images
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to preload ${url}`));
        img.src = url;
      });
    })
  );
}

// Hook for progressive image loading with blur-up effect
export function useProgressiveImage(lowQualitySrc: string, highQualitySrc: string) {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoading, setIsLoading] = useState(true);
  const [blur, setBlur] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;
    
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoading(false);
      
      // Remove blur after a short delay for smooth transition
      setTimeout(() => setBlur(false), 100);
    };
    
    return () => {
      img.onload = null;
    };
  }, [highQualitySrc]);

  return { src, isLoading, blur };
}