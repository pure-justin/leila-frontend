'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SmartAppBannerProps {
  appStoreId?: string;
  playStoreId?: string;
}

export default function SmartAppBanner({ 
  appStoreId = '6747648334',
  playStoreId = 'com.heyleila.homeservice' 
}: SmartAppBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('app-banner-dismissed');
    if (dismissed === 'true') return;

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);

    if (isIOS) {
      setPlatform('ios');
      setShowBanner(true);
      
      // Add iOS meta tag for native smart banner
      const meta = document.createElement('meta');
      meta.name = 'apple-itunes-app';
      meta.content = `app-id=${appStoreId}`;
      document.head.appendChild(meta);
    } else if (isAndroid) {
      setPlatform('android');
      setShowBanner(true);
    }
  }, [appStoreId]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('app-banner-dismissed', 'true');
  };

  const handleInstall = () => {
    if (platform === 'ios') {
      window.location.href = `https://apps.apple.com/app/id${appStoreId}`;
    } else if (platform === 'android') {
      window.location.href = `https://play.google.com/store/apps/details?id=${playStoreId}`;
    }
  };

  if (!showBanner || !platform) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 p-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Image
            src="/icon-72x72.png"
            alt="Leila"
            width={48}
            height={48}
            className="rounded-xl"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Leila - Home Services</h3>
            <p className="text-xs text-gray-600">
              Get our free app - better experience & offline access
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-full flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span>Get</span>
          </Button>
          
          <button
            onClick={handleDismiss}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}