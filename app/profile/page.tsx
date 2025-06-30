'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Heart, History, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const profileOptions = [
    { 
      icon: User, 
      label: 'Personal Information', 
      description: 'Manage your account details',
      action: () => router.push('/profile/edit')
    },
    { 
      icon: Heart, 
      label: 'Favorite Services', 
      description: 'Your saved services',
      action: () => router.push('/profile/favorites')
    },
    { 
      icon: History, 
      label: 'Booking History', 
      description: 'View past bookings',
      action: () => router.push('/bookings')
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      description: 'App preferences',
      action: () => router.push('/profile/settings')
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Support', 
      description: 'Get help or contact us',
      action: () => router.push('/profile/support')
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="px-4 pt-20 pb-24">
        <div className="max-w-md mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-purple-800 mb-1">
              {user?.displayName || 'User'}
            </h1>
            <p className="text-purple-600">{user?.email}</p>
          </motion.div>

          {/* Profile Options */}
          <div className="space-y-4">
            {profileOptions.map((option, index) => (
              <motion.div
                key={option.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={option.action}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
                    <option.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Logout Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: profileOptions.length * 0.1 }}
              onClick={handleLogout}
              className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 cursor-pointer hover:shadow-md transition-all mt-6"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4">
                  <LogOut className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Sign Out</h3>
                  <p className="text-sm text-red-600">Sign out of your account</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}