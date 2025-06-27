'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Smartphone, Globe, Download } from 'lucide-react';

export default function MobileRedirectPage() {
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(true);
  const [appNotInstalled, setAppNotInstalled] = useState(false);

  const platform = searchParams.get('platform') || 'ios';
  const storeUrl = searchParams.get('storeUrl') || '';
  const deepLink = searchParams.get('deepLink') || '';
  const returnUrl = searchParams.get('returnUrl') || '/';

  useEffect(() => {
    // Try to open the app with deep link
    if (deepLink) {
      // Create an invisible iframe to attempt opening the app
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      // Wait to see if the app opens
      const timeout = setTimeout(() => {
        // If we're still here after 2.5 seconds, the app probably isn't installed
        setAppNotInstalled(true);
        setRedirecting(false);
        document.body.removeChild(iframe);
      }, 2500);

      // Clean up on unmount
      return () => {
        clearTimeout(timeout);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      };
    } else {
      // No deep link, just show the download options
      setAppNotInstalled(true);
      setRedirecting(false);
    }
  }, [deepLink]);

  const handleContinueToWeb = () => {
    // Set cookie to remember preference
    document.cookie = 'prefer-web-version=true; max-age=604800; path=/'; // 7 days
    window.location.href = returnUrl;
  };

  const handleDownloadApp = () => {
    window.location.href = storeUrl;
  };

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Image
              src="/logo.png"
              alt="Leila"
              width={120}
              height={120}
              className="mx-auto rounded-2xl shadow-lg"
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Opening Leila app...
          </h2>
          <p className="text-gray-600">
            Redirecting you to the app
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-4">
          <Image
            src="/logo.png"
            alt="Leila"
            width={100}
            height={100}
            className="mx-auto rounded-2xl shadow-md"
          />
          
          <h1 className="text-2xl font-bold text-gray-900">
            Get the Leila App
          </h1>
          
          <p className="text-gray-600">
            For the best experience, download our mobile app
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleDownloadApp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-medium rounded-xl flex items-center justify-center space-x-3"
          >
            <Download className="w-5 h-5" />
            <span>
              Download for {platform === 'ios' ? 'iPhone' : 'Android'}
            </span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <Button
            onClick={handleContinueToWeb}
            variant="outline"
            className="w-full py-6 text-lg font-medium rounded-xl flex items-center justify-center space-x-3 border-2 border-gray-300 hover:border-gray-400"
          >
            <Globe className="w-5 h-5" />
            <span>Continue to Web Version</span>
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>Native app experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Offline support</span>
            </div>
          </div>
        </div>

        {platform === 'ios' && (
          <div className="text-center text-xs text-gray-500">
            Requires iOS 15.0 or later
          </div>
        )}
        
        {platform === 'android' && (
          <div className="text-center text-xs text-gray-500">
            Requires Android 7.0 or later
          </div>
        )}
      </div>
    </div>
  );
}