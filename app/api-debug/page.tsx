'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function APIDebugPage() {
  const [googleStatus, setGoogleStatus] = useState<any>({});
  const [envStatus, setEnvStatus] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    setEnvStatus({
      googleMapsKey: {
        exists: !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        length: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.length,
        prefix: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.substring(0, 10)
      },
      firebaseApiKey: {
        exists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        length: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length
      },
      firebaseProjectId: {
        exists: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      }
    });

    // Check Google Maps loading
    const checkGoogle = () => {
      setGoogleStatus({
        windowExists: typeof window !== 'undefined',
        googleExists: typeof window !== 'undefined' && !!window.google,
        mapsExists: typeof window !== 'undefined' && !!window.google?.maps,
        mapsVersion: typeof window !== 'undefined' && window.google?.maps?.version,
        availableLibraries: {
          places: !!window.google?.maps?.places,
          drawing: !!window.google?.maps?.drawing,
          geometry: !!window.google?.maps?.geometry,
          visualization: !!window.google?.maps?.visualization,
          solarApi: !!(window.google?.maps as any)?.SolarApi,
          solarLayer: !!(window.google?.maps as any)?.SolarLayer,
        }
      });
    };

    // Check immediately
    checkGoogle();

    // Check again after delay
    const interval = setInterval(checkGoogle, 1000);
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 p-8">
      <motion.div 
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          API Debug Dashboard
        </h1>

        {/* Environment Variables */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
            <pre>{JSON.stringify(envStatus, null, 2)}</pre>
          </div>
        </div>

        {/* Google Maps Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Google Maps Status</h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
            <pre>{JSON.stringify(googleStatus, null, 2)}</pre>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                if (window.google?.maps) {
                  alert('Google Maps is loaded!');
                } else {
                  alert('Google Maps is NOT loaded!');
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ml-2"
            >
              Test Google Maps
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}