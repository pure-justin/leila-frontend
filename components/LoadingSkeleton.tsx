'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  animation = 'pulse',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 rounded',
    animation === 'pulse' && 'animate-pulse',
    variant === 'text' && 'h-4 rounded',
    variant === 'circular' && 'rounded-full',
    variant === 'rectangular' && 'rounded-lg',
    className
  );

  const style = {
    width: width || (variant === 'circular' ? height : undefined),
    height: height || (variant === 'circular' ? width : undefined)
  };

  if (animation === 'wave') {
    return (
      <div className={baseClasses} style={style}>
        <motion.div
          className="h-full w-full relative overflow-hidden"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
        >
          <motion.div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ translateX: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    );
  }

  return <div className={baseClasses} style={style} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl shadow-lg p-6', className)}>
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      <Skeleton variant="text" className="mb-2 w-3/4" />
      <Skeleton variant="text" className="mb-4 w-full" />
      <div className="flex gap-4">
        <Skeleton variant="text" className="w-20" />
        <Skeleton variant="text" className="w-20" />
      </div>
    </div>
  );
}

export function SkeletonServiceGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <SkeletonCard />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number, className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? 'w-2/3' : 'w-full'} 
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return (
    <Skeleton 
      variant="rectangular" 
      height={40} 
      className={cn('rounded-xl', className)} 
    />
  );
}