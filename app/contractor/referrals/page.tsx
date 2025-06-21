'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReferralDashboard from '@/components/ReferralDashboard';
import ContractorReferralTracking from '@/components/contractor/ReferralTracking';

export default function ContractorReferralsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking'>('overview');
  
  // Mock contractor ID - in real app, get from auth
  const contractorId = 'contractor-123';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/contractor/dashboard" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <h1 className="text-xl font-semibold">Referral Program</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview & Share
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tracking'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tracking & History
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' ? (
            <ReferralDashboard userId={contractorId} userType="contractor" />
          ) : (
            <ContractorReferralTracking />
          )}
        </motion.div>
      </div>

      {/* Special Contractor Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
        >
          <h2 className="text-2xl font-bold mb-6">Contractor Referral Benefits</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Refer Other Contractors</h3>
              <ul className="space-y-2 text-purple-100">
                <li>• Earn $500 after they complete 10 jobs</li>
                <li>• They get $100 sign-on bonus</li>
                <li>• Milestone bonuses up to $1,000</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Refer Customers</h3>
              <ul className="space-y-2 text-purple-100">
                <li>• Earn $10 for each customer booking</li>
                <li>• Customer saves 15% on first service</li>
                <li>• No limit on referrals</li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Tier Benefits</h3>
              <ul className="space-y-2 text-purple-100">
                <li>• Bronze: 5% bonus (3+ referrals)</li>
                <li>• Silver: 10% bonus (10+ referrals)</li>
                <li>• Gold: 20% bonus (25+ referrals)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white/20 backdrop-blur rounded-xl p-6">
            <p className="text-lg font-medium mb-2">
              💡 Pro Tip: Share your code at job sites!
            </p>
            <p className="text-purple-100">
              Many customers ask for recommendations. Keep business cards with your referral code 
              to help grow your network and earn extra income.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}