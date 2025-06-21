'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Briefcase, Calendar, Menu, X, Bell, CheckCircle, Clock, TrendingUp, DollarSign, Zap } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, stagger, pulseAnimation } from '@/lib/animations';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';

interface Job {
  id: string;
  customerName: string;
  service: string;
  address: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  price: number;
  distance: string;
  urgent: boolean;
}

export default function ContractorDashboard() {
  const [activeView, setActiveView] = useState('earnings');
  const [isOnline, setIsOnline] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user } = useAuth();
  
  // Get contractor data from auth context
  const contractorData = {
    id: user?.uid || 'contractor-123',
    token: 'mock-jwt-token',
    name: user?.displayName?.split(' ')[0] || 'Contractor',
    fullName: user?.displayName || 'Contractor',
    profession: user?.profession || 'Professional'
  };

  // Mock data
  const stats = {
    todayEarnings: 485,
    weekEarnings: 2340,
    completedJobs: 12,
    rating: 4.8,
    totalReviews: 156
  };

  const availableJobs: Job[] = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      service: 'Plumbing',
      address: '123 Main St, Downtown',
      date: 'Today',
      time: '2:00 PM',
      status: 'pending',
      price: 150,
      distance: '2.3 mi',
      urgent: true
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      service: 'Electrical',
      address: '456 Oak Ave, Westside',
      date: 'Today',
      time: '4:30 PM',
      status: 'pending',
      price: 200,
      distance: '5.1 mi',
      urgent: false
    },
    {
      id: '3',
      customerName: 'Emma Davis',
      service: 'HVAC',
      address: '789 Pine Rd, Northside',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'pending',
      price: 300,
      distance: '8.2 mi',
      urgent: false
    }
  ];

  const handleAcceptJob = (jobId: string) => {
    console.log('Accepting job:', jobId);
    // TODO: API call to accept job
  };

  const handleDeclineJob = (jobId: string) => {
    console.log('Declining job:', jobId);
    // TODO: API call to decline job
  };

  return (
    <GradientBackground variant="animated" className="min-h-screen">
      {/* Animated Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="lg:hidden">
                <AnimatedLogo size={40} />
              </Link>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <h1 className="text-xl font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Hi, {contractorData.name}
                </h1>
                <motion.div 
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                    animate={isOnline ? pulseAnimation.animate : {}}
                  />
                  <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-gray-600'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </motion.div>
              </motion.div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-sm hover:text-gray-600 transition-colors">
                Home
              </Link>
              <Link href="/contractor/schedule" className="text-sm hover:text-gray-600 transition-colors">
                Schedule
              </Link>
              <Link href="/contractor/analytics" className="text-sm hover:text-gray-600 transition-colors">
                Analytics
              </Link>
              <Link href="/contractor/profile" className="text-sm hover:text-gray-600 transition-colors">
                Profile
              </Link>
              <motion.button
                onClick={() => setIsOnline(!isOnline)}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 ${
                  isOnline 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isOnline ? 'Go offline' : 'Go online'}
              </motion.button>
              <motion.button 
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-5 h-5" />
                <motion.span 
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                  animate={pulseAnimation.animate}
                />
              </motion.button>
            </nav>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link href="/contractor/schedule" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Schedule
              </Link>
              <Link href="/contractor/analytics" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Analytics
              </Link>
              <Link href="/contractor/profile" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsOnline(!isOnline);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${
                  isOnline 
                    ? 'gradient-button' 
                    : 'uber-button-secondary'
                }`}
              >
                {isOnline ? 'Go offline' : 'Go online'}
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {/* Animated View Switcher */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200"
      >
        <div className="px-4 lg:px-8">
          <div className="flex space-x-8">
            <motion.button
              onClick={() => setActiveView('earnings')}
              className={`py-4 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                activeView === 'earnings'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <DollarSign className="inline w-4 h-4 mr-1" />
              Earnings
              {activeView === 'earnings' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"
                />
              )}
            </motion.button>
            <motion.button
              onClick={() => setActiveView('opportunities')}
              className={`py-4 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                activeView === 'opportunities'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Zap className="inline w-4 h-4 mr-1" />
              Opportunities
              {activeView === 'opportunities' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"
                />
              )}
            </motion.button>
            <motion.button
              onClick={() => setActiveView('scheduled')}
              className={`py-4 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                activeView === 'scheduled'
                  ? 'text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <Calendar className="inline w-4 h-4 mr-1" />
              Scheduled
              {activeView === 'scheduled' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600"
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <main className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Earnings View */}
          {activeView === 'earnings' && (
            <motion.div
              key="earnings"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Earnings Summary Card */}
              <motion.div 
                className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-8 mb-6 shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <motion.div
                    className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity }
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-24 -left-24 w-64 h-64 bg-white rounded-full"
                    animate={{ 
                      rotate: -360,
                      scale: [1, 1.3, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                      scale: { duration: 5, repeat: Infinity }
                    }}
                  />
                </div>
                
                <div className="relative z-10">
                  <motion.h2 
                    className="text-2xl font-bold mb-6 flex items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <TrendingUp className="w-6 h-6 mr-2" />
                    Today&apos;s earnings
                  </motion.h2>
                  <motion.div 
                    className="text-5xl font-bold mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  >
                    {formatCurrency(stats.todayEarnings)}
                  </motion.div>
                  <motion.p 
                    className="text-purple-100 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {stats.completedJobs} trips completed
                  </motion.p>
                  
                  <div className="border-t border-purple-400/30 pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-purple-200">This week</p>
                        <motion.p 
                          className="text-2xl font-semibold"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {formatCurrency(stats.weekEarnings)}
                        </motion.p>
                      </div>
                      <Link href="/contractor/analytics">
                        <motion.button 
                          className="text-sm font-medium bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          See details →
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Performance Stats */}
              <motion.div 
                className="grid md:grid-cols-3 gap-4"
                variants={stagger}
                initial="initial"
                animate="animate"
              >
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    >
                      <Star className="w-5 h-5 text-yellow-500" />
                    </motion.div>
                    <span className="text-sm text-gray-500">Rating</span>
                  </div>
                  <motion.div 
                    className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                  >
                    {stats.rating}
                  </motion.div>
                  <p className="text-sm text-gray-500">{stats.totalReviews} reviews</p>
                </motion.div>
                
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span className="text-sm text-gray-500">Acceptance</span>
                  </div>
                  <motion.div 
                    className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.6 }}
                  >
                    95%
                  </motion.div>
                  <p className="text-sm text-gray-500">Last 7 days</p>
                </motion.div>
                
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                    >
                      <Clock className="w-5 h-5 text-blue-500" />
                    </motion.div>
                    <span className="text-sm text-gray-500">Online hours</span>
                  </div>
                  <motion.div 
                    className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.7 }}
                  >
                    32.5
                  </motion.div>
                  <p className="text-sm text-gray-500">This week</p>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {/* Opportunities View */}
          {activeView === 'opportunities' && (
            <motion.div
              key="opportunities"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Available jobs
                </h2>
                <p className="text-gray-500">Accept jobs to start earning</p>
              </motion.div>

              {isOnline ? (
                <motion.div 
                  className="space-y-4"
                  variants={stagger}
                  initial="initial"
                  animate="animate"
                >
                  {availableJobs.map((job) => (
                    <motion.div 
                      key={job.id} 
                      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              {job.service}
                            </h3>
                            {job.urgent && (
                              <motion.span 
                                className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                URGENT
                              </motion.span>
                            )}
                          </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{job.customerName}</p>
                          <p>{job.date} at {job.time}</p>
                          <p>{job.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold mb-1">{formatCurrency(job.price)}</div>
                        <div className="text-sm text-gray-500">{job.distance} away</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <motion.button
                          onClick={() => handleAcceptJob(job.id)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Accept
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeclineJob(job.id)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Decline
                        </motion.button>
                    </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-100"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Briefcase className="w-10 h-10 text-purple-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">You&apos;re offline</h3>
                  <p className="text-gray-500 mb-6">Go online to see available jobs</p>
                  <motion.button
                    onClick={() => setIsOnline(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-6 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go online
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Scheduled View */}
          {activeView === 'scheduled' && (
            <motion.div
              key="scheduled"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div className="mb-6" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Scheduled jobs
                </h2>
                <p className="text-gray-500">Your upcoming appointments</p>
              </motion.div>
              
              <motion.div 
                className="bg-white/80 backdrop-blur-sm rounded-xl p-12 text-center border border-purple-100"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring" }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Calendar className="w-20 h-20 text-purple-300 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">No scheduled jobs</h3>
                <p className="text-gray-500">Accepted jobs will appear here</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </GradientBackground>
  );
}