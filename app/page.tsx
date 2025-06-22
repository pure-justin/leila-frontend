'use client';

import { useState, useEffect } from 'react';
import PersonalizedHomePage from '@/components/PersonalizedHomePage';
import GlassNav from '@/components/GlassNav';
import GoogleMapsLoader from '@/components/GoogleMapsLoader';
import GradientBackground from '@/components/GradientBackground';
import AILiveChat from '@/components/AILiveChat';
import ReferralBanner from '@/components/ReferralBanner';
import AddressPrompt from '@/components/AddressPrompt';
import FeedbackFAB from '@/components/FeedbackFAB';
import MobileSearchBar from '@/components/MobileSearchBar';

export default function Home() {
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);

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
      
      {/* Referral Banner */}
      <ReferralBanner referralCode={savedReferralCode || undefined} />
      
      {/* Glass Navigation */}
      <GlassNav />
      
      {/* Mobile Search Bar */}
      <MobileSearchBar />

      <main className="md:mt-0 mt-[120px]">
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