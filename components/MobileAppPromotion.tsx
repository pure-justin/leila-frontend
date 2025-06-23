'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Star, Shield, Clock, QrCode } from 'lucide-react';
import Image from 'next/image';

interface MobileAppPromotionProps {
  onDismiss?: () => void;
}

export default function MobileAppPromotion({ onDismiss }: MobileAppPromotionProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroidDevice = /android/i.test(userAgent);
    
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // PWA install prompt for Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleIOSInstall = () => {
    // Deep link to App Store
    window.location.href = 'https://apps.apple.com/app/leila-home-services/id6747648334';
  };

  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      // Show PWA install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback to Play Store (when available)
      window.location.href = 'https://play.google.com/store/apps/details?id=com.heyleila.homeservice';
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Store dismissal in localStorage with timestamp
    localStorage.setItem('appPromoDismissed', new Date().toISOString());
    onDismiss?.();
  };

  // Check if previously dismissed (within 7 days)
  useEffect(() => {
    const dismissedTime = localStorage.getItem('appPromoDismissed');
    if (dismissedTime) {
      const dismissedDate = new Date(dismissedTime);
      const daysSinceDismissed = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowBanner(false);
      }
    }
  }, []);

  if (!showBanner) return null;

  return (
    <>
      {/* Smart App Banner for iOS - Native style */}
      {isIOS && (
        <meta 
          name="apple-itunes-app" 
          content="app-id=6747648334, app-argument=https://heyleila.com" 
        />
      )}

      {/* Full-Screen Mobile Promotion */}
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* App Icon */}
          <div className="relative mb-6">
            <div className="w-32 h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                L
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
              <Download className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* App Name & Tagline */}
          <h1 className="text-4xl font-bold text-white mb-2">
            Leila
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Home Services Made Simple
          </p>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white/80">Instant Booking</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white/80">Verified Pros</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white/80">5-Star Service</span>
            </div>
          </div>

          {/* Download Button */}
          {isIOS ? (
            <button
              onClick={handleIOSInstall}
              className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <Smartphone className="w-6 h-6" />
              Download on App Store
            </button>
          ) : isAndroid ? (
            <button
              onClick={handleAndroidInstall}
              className="bg-white text-purple-700 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <Smartphone className="w-6 h-6" />
              Install App
            </button>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleIOSInstall}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center gap-3 hover:bg-gray-900 transition-colors"
              >
                <Image 
                  src="/apple-logo.svg" 
                  alt="Apple" 
                  width={20} 
                  height={20}
                  className="invert"
                />
                Download on App Store
              </button>
              <button
                onClick={handleAndroidInstall}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium flex items-center gap-3 hover:bg-gray-100 transition-colors"
              >
                <Image 
                  src="/google-play.svg" 
                  alt="Google Play" 
                  width={20} 
                  height={20}
                />
                Get it on Google Play
              </button>
            </div>
          )}

          {/* Continue to Web */}
          <button
            onClick={handleDismiss}
            className="mt-6 text-white/70 underline text-sm hover:text-white transition-colors"
          >
            Continue to mobile web
          </button>
        </div>

        {/* QR Code Section for Desktop */}
        {!isIOS && !isAndroid && (
          <div className="pb-8 px-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-sm mx-auto">
              <div className="flex items-center gap-4">
                <QrCode className="w-16 h-16 text-white/60" />
                <div className="text-left">
                  <p className="text-white font-medium">Scan to download</p>
                  <p className="text-white/70 text-sm">Point your phone camera at QR codes to instantly try Leila</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}