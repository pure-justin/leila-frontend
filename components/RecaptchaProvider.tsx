'use client';

import Script from 'next/script';
import { createContext, useContext, useCallback, useState } from 'react';

interface RecaptchaContextType {
  executeRecaptcha: (action: string) => Promise<string>;
  isLoaded: boolean;
}

const RecaptchaContext = createContext<RecaptchaContextType | null>(null);

export function useRecaptcha() {
  const context = useContext(RecaptchaContext);
  if (!context) {
    throw new Error('useRecaptcha must be used within RecaptchaProvider');
  }
  return context;
}

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

export function RecaptchaProvider({ children }: RecaptchaProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = '6LcSOWorAAAAAGOYmyOPHNPi1AbOzWsoJ3k3tYQO';

  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded yet');
    }

    return new Promise((resolve, reject) => {
      window.grecaptcha.enterprise.ready(async () => {
        try {
          const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
          resolve(token);
        } catch (error) {
          console.error('reCAPTCHA execution failed:', error);
          reject(error);
        }
      });
    });
  }, [isLoaded]);

  return (
    <RecaptchaContext.Provider value={{ executeRecaptcha, isLoaded }}>
      <Script
        src={`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`}
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      {children}
    </RecaptchaContext.Provider>
  );
}