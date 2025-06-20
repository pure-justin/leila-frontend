import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

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
      <head>
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD88ucXoxhnfJzKQqLW2PWAwhMsxhQrm4s'}&libraries=places,drawing,geometry&callback=Function.prototype`}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
