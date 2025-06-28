'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Calendar, CreditCard, User, 
  Briefcase, BarChart3, Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomNav() {
  const [viewMode, setViewMode] = useState<'customer' | 'contractor'>('customer');
  const pathname = usePathname();
  const { user } = useAuth();

  // Determine current mode based on path
  useEffect(() => {
    if (pathname.startsWith('/contractor')) {
      setViewMode('contractor');
    } else {
      setViewMode('customer');
    }
  }, [pathname]);

  const customerTabs = [
    { 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      href: '/',
      isActive: pathname === '/' 
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: Calendar, 
      href: '/bookings',
      isActive: pathname === '/bookings' 
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: CreditCard, 
      href: '/wallet',
      isActive: pathname === '/wallet' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      href: '/profile',
      isActive: pathname === '/profile' 
    },
  ];

  const contractorTabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      href: '/contractor/dashboard',
      isActive: pathname === '/contractor/dashboard' 
    },
    { 
      id: 'schedule', 
      label: 'Schedule', 
      icon: Clock, 
      href: '/contractor/schedule',
      isActive: pathname === '/contractor/schedule' 
    },
    { 
      id: 'jobs', 
      label: 'Jobs', 
      icon: Briefcase, 
      href: '/contractor/jobs',
      isActive: pathname === '/contractor/jobs' 
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User, 
      href: '/contractor/profile',
      isActive: pathname === '/contractor/profile' 
    },
  ];

  const currentTabs = viewMode === 'customer' ? customerTabs : contractorTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Bottom Navigation - Native Style */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2 shadow-lg">
        <div className="flex items-center justify-around">
          {currentTabs.map((tab) => (
            <Link key={tab.id} href={tab.href}>
              <motion.div
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  tab.isActive 
                    ? 'text-white' 
                    : 'text-purple-200 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className={`w-6 h-6 mb-1 ${tab.isActive ? 'text-white' : 'text-purple-200'}`} />
                <span className={`text-xs font-medium ${tab.isActive ? 'text-white' : 'text-purple-200'}`}>
                  {tab.label}
                </span>
                {tab.isActive && (
                  <motion.div
                    className="w-1 h-1 bg-white rounded-full mt-1"
                    layoutId="activeTab"
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}