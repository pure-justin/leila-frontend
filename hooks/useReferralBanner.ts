import { useState, useEffect } from 'react';

export function useReferralBanner() {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('referralBannerDismissed');
    
    // Check if code was already applied
    const savedCode = localStorage.getItem('referralCode');
    
    // Banner is visible if not dismissed and no code applied
    setIsBannerVisible(!dismissed && !savedCode);
  }, []);

  return isBannerVisible;
}