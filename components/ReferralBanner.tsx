'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Sparkles, ChevronRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReferralBannerProps {
  referralCode?: string;
}

export default function ReferralBanner({ referralCode }: ReferralBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [inputCode, setInputCode] = useState(referralCode || '');
  const router = useRouter();

  if (!isVisible) return null;

  const handleApplyCode = () => {
    if (inputCode) {
      // Store code in session/localStorage
      localStorage.setItem('referralCode', inputCode);
      // Redirect to signup with code
      router.push(`/signup?ref=${inputCode}`);
    }
  };

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
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
            {referralCode ? (
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm">Code applied:</span>
                <span className="font-mono font-bold">{referralCode}</span>
              </div>
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
              onClick={() => setIsVisible(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}