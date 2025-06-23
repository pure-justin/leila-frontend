'use client';

import { useState, useEffect } from 'react';
import { getToken } from 'firebase/app-check';
import { appCheck } from '@/lib/firebase';

export default function TestAppCheck() {
  const [status, setStatus] = useState<any>({
    initialized: false,
    token: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const checkAppCheck = async () => {
      try {
        // Check if App Check is initialized
        if (!appCheck) {
          setStatus({
            initialized: false,
            token: null,
            error: 'App Check not initialized - check if NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set',
            loading: false
          });
          return;
        }

        // Try to get a token
        const tokenResult = await getToken(appCheck, false);
        
        setStatus({
          initialized: true,
          token: {
            token: tokenResult.token.substring(0, 20) + '...',
            expireTimeMillis: new Date(tokenResult.expireTimeMillis).toLocaleString()
          },
          error: null,
          loading: false
        });
      } catch (error: any) {
        setStatus({
          initialized: !!appCheck,
          token: null,
          error: error.message || 'Failed to get App Check token',
          loading: false
        });
      }
    };

    checkAppCheck();
  }, []);

  const refreshToken = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    try {
      const tokenResult = await getToken(appCheck!, true);
      setStatus({
        initialized: true,
        token: {
          token: tokenResult.token.substring(0, 20) + '...',
          expireTimeMillis: new Date(tokenResult.expireTimeMillis).toLocaleString()
        },
        error: null,
        loading: false
      });
    } catch (error: any) {
      setStatus(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase App Check Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">App Check Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="font-medium w-32">Initialized:</span>
              <span className={status.initialized ? 'text-green-600' : 'text-red-600'}>
                {status.initialized ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="font-medium w-32">Loading:</span>
              <span>{status.loading ? '⏳ Loading...' : '✅ Complete'}</span>
            </div>
            
            {status.error && (
              <div className="mt-4 p-4 bg-red-50 rounded">
                <span className="font-medium text-red-800">Error:</span>
                <p className="text-red-600 mt-1">{status.error}</p>
              </div>
            )}
            
            {status.token && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h3 className="font-medium text-green-800 mb-2">Token Info:</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Token:</span> {status.token.token}</p>
                  <p><span className="font-medium">Expires:</span> {status.token.expireTimeMillis}</p>
                </div>
              </div>
            )}
          </div>
          
          {status.initialized && (
            <button
              onClick={refreshToken}
              disabled={status.loading}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {status.loading ? 'Refreshing...' : 'Refresh Token'}
            </button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>NEXT_PUBLIC_RECAPTCHA_SITE_KEY: {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Next Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Ensure App Check is enabled in Firebase Console</li>
            <li>Verify reCAPTCHA v3 site key is correct</li>
            <li>Check that your domain is registered in Firebase App Check settings</li>
            <li>Enable App Check enforcement for Firestore if needed</li>
          </ol>
        </div>
      </div>
    </div>
  );
}