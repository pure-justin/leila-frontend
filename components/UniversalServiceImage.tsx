'use client';

import { useServiceImage } from '@/hooks/useServiceImage';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UniversalServiceImageProps {
  serviceId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  variant?: 'thumbnail' | 'card' | 'hero' | 'original';
  animate?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function UniversalServiceImage({
  serviceId,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  fill = false,
  sizes,
  variant = 'card',
  animate = true,
  onLoad,
  onError,
}: UniversalServiceImageProps) {
  const { imageUrl, isLoading, error, ref } = useServiceImage(serviceId, {
    variant,
    preload: priority,
    lazy: !priority
  });
  
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  useEffect(() => {
    if (error) {
      setLoadState('error');
      onError?.();
    }
  }, [error, onError]);
  
  const handleLoad = () => {
    setLoadState('loaded');
    onLoad?.();
  };
  
  const handleError = () => {
    setLoadState('error');
    onError?.();
  };
  
  const shimmer = (
    <div className="absolute inset-0 -translate-x-full" style={{ animation: 'shimmer 2s infinite' }}>
      <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
  
  return (
    <div 
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={fill ? {} : { width, height }}
    >
      <AnimatePresence mode="wait">
        {/* Loading skeleton */}
        {(isLoading || loadState === 'loading') && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
          >
            {animate && shimmer}
          </motion.div>
        )}
        
        {/* Error state */}
        {loadState === 'error' && !isLoading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-100"
          >
            <div className="text-center p-4">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-sm text-gray-500">Image unavailable</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Actual image */}
      {fill ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes={sizes || '100vw'}
          quality={variant === 'thumbnail' ? 60 : variant === 'hero' ? 85 : 75}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${loadState === 'loaded' ? 'opacity-100' : 'opacity-0'}
          `}
        />
      ) : (
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          quality={variant === 'thumbnail' ? 60 : variant === 'hero' ? 85 : 75}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${loadState === 'loaded' ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </div>
  );
}