'use client';

import { useEffect, useState } from 'react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
}

export default function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Fix viewport height for mobile browsers
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(`${window.innerHeight}px`);
    };

    checkMobile();
    updateViewportHeight();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  return (
    <div 
      className="min-h-screen"
      style={{
        minHeight: isMobile ? viewportHeight : '100vh',
        touchAction: 'manipulation', // Prevent double-tap zoom
      }}
    >
      {children}
    </div>
  );
}