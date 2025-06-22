'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, ChevronRight, X, CheckCircle } from 'lucide-react';

interface ReferralBannerProps {
  referralCode?: string;
}

export default function ReferralBanner({ referralCode }: ReferralBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputCode, setInputCode] = useState(referralCode || '');
  const [isApplied, setIsApplied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check if banner was dismissed
    const dismissed = localStorage.getItem('referralBannerDismissed');
    if (dismissed) {
      setIsVisible(false);
      return;
    }
    
    // Check if code was already applied
    const savedCode = localStorage.getItem('referralCode');
    if (savedCode) {
      setInputCode(savedCode);
      setIsApplied(true);
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-dismiss after code is applied
  useEffect(() => {
    if (isApplied) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isApplied]);

  if (!isVisible) return null;

  const handleApplyCode = () => {
    if (inputCode) {
      // Store code in session/localStorage
      localStorage.setItem('referralCode', inputCode);
      setIsApplied(true);
      // Don't redirect - just apply the code
      // The code will be used when they actually book a service
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('referralBannerDismissed', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white ${
            isMobile ? 'fixed top-[120px] left-0 right-0 z-[40] shadow-lg' : 'relative'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
            {isMobile ? (
              // Mobile Layout
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Gift className="w-5 h-5" />
                    </motion.div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                      <span className="text-sm font-bold">$20 OFF First Service!</span>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="text-white/70 hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {!isApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/20 placeholder-white/70 text-white focus:outline-none focus:bg-white/30 text-sm"
                    />
                    <motion.button
                      onClick={handleApplyCode}
                      className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      Apply
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Code Applied! $20 off your first service</span>
                  </motion.div>
                )}
              </div>
            ) : (
              // Desktop Layout
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Gift className="w-6 h-6" />
                  </motion.div>
                  
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="font-bold">Limited Time Offer:</span>
                    <span>Get $20 off your first service!</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isApplied ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-2 bg-green-500 px-4 py-2 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Code Applied!</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                        className="px-3 py-1.5 rounded-lg bg-white/20 placeholder-white/70 text-white focus:outline-none focus:bg-white/30 w-32"
                      />
                      <motion.button
                        onClick={handleApplyCode}
                        className="bg-white text-purple-600 px-4 py-1.5 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Apply
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </motion.button>
                    </div>
                  )}
                  
                  <button
                    onClick={handleDismiss}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}