'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import GlassNav from '@/components/GlassNav';
import { useReferralBanner } from '@/hooks/useReferralBanner';

// Dynamic imports for heavy components
const PersonalizedHomePage = dynamic(() => import('@/components/PersonalizedHomePage'), {
  loading: () => <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" />
});

const GoogleMapsLoader = dynamic(() => import('@/components/GoogleMapsLoader'), {
  ssr: false
});

const GradientBackground = dynamic(() => import('@/components/GradientBackground'));
const AILiveChat = dynamic(() => import('@/components/AILiveChat'), { ssr: false });
const ReferralBanner = dynamic(() => import('@/components/ReferralBanner'));
const AddressPrompt = dynamic(() => import('@/components/AddressPrompt'));
const FeedbackFAB = dynamic(() => import('@/components/FeedbackFAB'), { ssr: false });

export default function Home() {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const isBannerVisible = useReferralBanner();

  useEffect(() => {
    // Check if user has saved address
    const savedAddress = localStorage.getItem('userAddress');
    if (!savedAddress) {
      // Show address prompt after a short delay
      setTimeout(() => setShowAddressPrompt(true), 2000);
    } else {
      setUserAddress(savedAddress);
    }
  }, []);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, []);

  const handleAddressSubmit = (data: { address: string; coords: { lat: number; lng: number } }) => {
    setUserAddress(data.address);
    localStorage.setItem('userAddress', data.address);
    localStorage.setItem('userCoords', JSON.stringify(data.coords));
    setShowAddressPrompt(false);
  };

  const savedReferralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;

  return (
    <GradientBackground variant="animated" className="min-h-screen">
      <GoogleMapsLoader onLoad={() => setMapsLoaded(true)} />
      
      {/* Glass Navigation */}
      <GlassNav />
      
      {/* Referral Banner - Now positioned below header */}
      <ReferralBanner referralCode={savedReferralCode || undefined} />

      <main className={`transition-all duration-300 pb-20 md:pb-0 ${
        isBannerVisible ? 'pt-[120px] md:pt-0' : 'pt-[60px] md:pt-0'
      }`}>
        {/* Personalized Home Page with DoorDash-style layout */}
        <PersonalizedHomePage />
      </main>

      {/* AI-Powered Chat Support */}
      <AILiveChat />
      
      {/* Feedback FAB */}
      <FeedbackFAB />
      
      {/* Address Prompt Modal */}
      {showAddressPrompt && (
        <AddressPrompt
          onAddressSubmit={handleAddressSubmit}
          onClose={() => setShowAddressPrompt(false)}
        />
      )}
      
    </GradientBackground>
  );
}