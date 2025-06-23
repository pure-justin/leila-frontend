'use client';

import { useEffect, useState } from 'react';

export default function TestRecaptcha() {
  const [appCheckStatus, setAppCheckStatus] = useState<string>('Checking...');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    // Check if reCAPTCHA is loaded
    const checkRecaptcha = () => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        setRecaptchaLoaded(true);
        console.log('✅ reCAPTCHA is loaded');
      } else {
        console.log('⏳ reCAPTCHA not loaded yet');
      }
    };

    // Check Firebase App Check
    const checkAppCheck = async () => {
      try {
        const { appCheck } = await import('@/lib/firebase-app-check');
        if (appCheck) {
          setAppCheckStatus('✅ App Check is initialized');
          console.log('App Check instance:', appCheck);
        } else {
          setAppCheckStatus('❌ App Check not initialized');
        }
      } catch (error) {
        setAppCheckStatus('❌ App Check error: ' + error);
      }
    };

    checkRecaptcha();
    checkAppCheck();

    // Check again after a delay
    const timer = setTimeout(checkRecaptcha, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">reCAPTCHA v3 Test Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">reCAPTCHA Status:</h2>
          <p>{recaptchaLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
          <p className="text-sm text-gray-600 mt-2">
            reCAPTCHA v3 is invisible - no user interaction required
          </p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">App Check Status:</h2>
          <p>{appCheckStatus}</p>
        </div>

        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold">How it works:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>reCAPTCHA v3 runs silently in the background</li>
            <li>It analyzes user interactions automatically</li>
            <li>No puzzles or checkboxes shown to users</li>
            <li>Protects against bots without friction</li>
          </ul>
        </div>

        <div className="p-4 border rounded bg-gray-50">
          <h2 className="font-semibold">Check Browser Console:</h2>
          <p className="text-sm">Open DevTools (F12) to see detailed logs</p>
        </div>
      </div>
    </div>
  );
}