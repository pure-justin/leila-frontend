'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, Users, DollarSign, Share2, Copy, Check, 
  TrendingUp, Award, Star, MessageSquare, Mail, 
  Smartphone, ChevronRight, Info
} from 'lucide-react';
import { ReferralManager, REFERRAL_TIERS } from '@/lib/referral/referral-system';
import { formatCurrency } from '@/lib/utils/currency';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalEarned: number;
  availableBalance: number;
  currentTier: string;
  referralsToNextTier: number;
  referralCode: string;
}

export default function ReferralDashboard({ userId, userType }: { userId: string; userType: 'user' | 'contractor' }) {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 12,
    successfulReferrals: 8,
    pendingReferrals: 4,
    totalEarned: 280,
    availableBalance: 80,
    currentTier: 'silver',
    referralsToNextTier: 13,
    referralCode: ReferralManager.generateReferralCode(userId, userType)
  });

  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedShareMethod, setSelectedShareMethod] = useState<'sms' | 'email' | 'social' | null>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(stats.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareMessages = ReferralManager.getReferralShareMessage(stats.referralCode, userType);
  const tierInfo = REFERRAL_TIERS[stats.currentTier as keyof typeof REFERRAL_TIERS];
  const nextTier = Object.entries(REFERRAL_TIERS).find(([_, tier]) => 
    tier.referralsNeeded > stats.successfulReferrals
  );

  const handleShare = (method: 'sms' | 'email' | 'social') => {
    switch (method) {
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(shareMessages.sms)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Get $20 off with HeyLeila&body=${encodeURIComponent(shareMessages.email)}`);
        break;
      case 'social':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessages.social)}`);
        break;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
            <p className="text-purple-100">
              {userType === 'user' 
                ? 'Earn $20 for each friend who books their first service'
                : 'Earn up to $500 for each contractor you refer'}
            </p>
          </div>
          <Gift className="w-16 h-16 text-purple-200" />
        </div>

        {/* Referral Code */}
        <div className="mt-6 bg-white/20 backdrop-blur rounded-2xl p-6">
          <p className="text-sm text-purple-100 mb-2">Your referral code</p>
          <div className="flex items-center space-x-4">
            <div className="text-3xl font-mono font-bold tracking-wider">
              {stats.referralCode}
            </div>
            <motion.button
              onClick={copyToClipboard}
              className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalReferrals}</p>
          <p className="text-sm text-gray-600 mt-1">Referrals sent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Check className="w-8 h-8 text-green-600" />
            <span className="text-sm text-gray-500">Success</span>
          </div>
          <p className="text-3xl font-bold">{stats.successfulReferrals}</p>
          <p className="text-sm text-gray-600 mt-1">Completed referrals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-yellow-600" />
            <span className="text-sm text-gray-500">Earned</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalEarned)}</p>
          <p className="text-sm text-gray-600 mt-1">Total earnings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <span className="text-sm text-gray-500">Available</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(stats.availableBalance)}</p>
          <p className="text-sm text-gray-600 mt-1">Ready to use</p>
        </motion.div>
      </div>

      {/* Tier Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Referral Tier Progress</h2>
          <Award className="w-6 h-6" style={{ color: tierInfo?.color || '#666' }} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold capitalize">{stats.currentTier} Tier</p>
              <p className="text-sm text-gray-600">
                {nextTier ? `${stats.referralsToNextTier} referrals to ${nextTier[0]}` : 'Maximum tier reached!'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Current perks:</p>
              {tierInfo?.perks.map((perk, idx) => (
                <p key={idx} className="text-sm font-medium text-purple-600">{perk}</p>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.successfulReferrals / (nextTier?.[1].referralsNeeded || 50)) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-600"
            />
          </div>

          {/* Tier Badges */}
          <div className="flex justify-between mt-6">
            {Object.entries(REFERRAL_TIERS).map(([tier, info]) => (
              <div
                key={tier}
                className={`flex flex-col items-center ${
                  stats.successfulReferrals >= info.referralsNeeded ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: info.color }}
                >
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs mt-1 capitalize">{tier}</p>
                <p className="text-xs text-gray-500">{info.referralsNeeded}+</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Share Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold mb-6">Share & Earn</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            onClick={() => handleShare('sms')}
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold">Text Message</p>
                <p className="text-sm text-gray-600">Share via SMS</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>

          <motion.button
            onClick={() => handleShare('email')}
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold">Email</p>
                <p className="text-sm text-gray-600">Send invitation</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>

          <motion.button
            onClick={() => handleShare('social')}
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="font-semibold">Social Media</p>
                <p className="text-sm text-gray-600">Post online</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>
      </motion.div>

      {/* How it Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6"
      >
        <div className="flex items-center mb-4">
          <Info className="w-6 h-6 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold">How it works</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              1
            </div>
            <p className="font-medium mb-1">Share your code</p>
            <p className="text-sm text-gray-600">
              Send your unique referral code to friends and family
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              2
            </div>
            <p className="font-medium mb-1">They sign up & book</p>
            <p className="text-sm text-gray-600">
              {userType === 'user' 
                ? 'Your friend books their first service'
                : 'New contractor completes their first job'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
              3
            </div>
            <p className="font-medium mb-1">You both earn</p>
            <p className="text-sm text-gray-600">
              {userType === 'user'
                ? 'You get $20, they save $20'
                : 'You earn $500, they get $100'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}