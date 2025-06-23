import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import "@/lib/firebase-app-check";
import Footer from "@/components/Footer";
import { RecaptchaProvider } from "@/components/RecaptchaProvider";
import PageTransition from "@/components/PageTransition";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leila - Your AI Home Service Assistant",
  description: "Book home services with voice control - just say 'Hey Leila'",
  icons: {
    icon: '/favicon-new.ico',
    shortcut: '/favicon-new.ico',
    apple: '/favicon-new.ico',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Leila'
  },
  other: {
    'apple-itunes-app': 'app-id=6747648334, app-clip-bundle-id=com.heyleila.homeservice.clip',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7C3AED',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Console log heyleila.com info
  if (typeof window !== 'undefined') {
    console.log('🏠 Welcome to HeyLeila.com!');
    console.log('📍 URL:', window.location.href);
    console.log('🚀 Platform: AI-Powered Home Service');
    console.log('✨ Features: Voice control, Real-time matching, Contractor dashboard');
    console.log('🔧 Services: Plumbing, Electrical, HVAC, Cleaning, and more!');
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <RecaptchaProvider>
            <PageTransition>
              {children}
            </PageTransition>
            <Footer />
            <Analytics />
          </RecaptchaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
