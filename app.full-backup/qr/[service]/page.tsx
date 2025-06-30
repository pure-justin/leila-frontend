'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function QRRedirect() {
  const params = useParams();
  const router = useRouter();
  const service = params.service as string;

  useEffect(() => {
    // Detect if iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // App Clip URL - this will open the App Clip if available
      // Format: https://heyleila.com/qr/{service}
      const appClipUrl = `https://appclip.apple.com/id?p=com.heyleila.homeservice.clip&service=${service}`;
      
      // First try to open App Clip
      window.location.href = appClipUrl;
      
      // Fallback to App Store after 2 seconds if App Clip doesn't open
      setTimeout(() => {
        window.location.href = 'https://apps.apple.com/app/leila-home-services/id6747648334';
      }, 2000);
    } else {
      // Android or other platforms - redirect to mobile landing
      router.push(`/m?service=${service}`);
    }
  }, [service, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-12 h-12 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Opening Leila...</h1>
        <p className="text-white/80">
          {service ? `Quick book ${service} service` : 'Loading your service request'}
        </p>
      </div>
    </div>
  );
}