'use client';

import Link from 'next/link';
import { TrendingUp, DollarSign, Clock, Users, Star, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, stagger, scaleIn } from '@/lib/animations';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');

  // Mock data
  const stats = {
    revenue: {
      current: 12580,
      previous: 10240,
      change: 23.1
    },
    jobs: {
      current: 45,
      previous: 38,
      change: 18.4
    },
    rating: {
      current: 4.8,
      previous: 4.7,
      change: 2.1
    },
    hours: {
      current: 156,
      previous: 142,
      change: 9.9
    }
  };

  const chartData = [
    { day: 'Mon', earnings: 1850, jobs: 6 },
    { day: 'Tue', earnings: 2240, jobs: 8 },
    { day: 'Wed', earnings: 1920, jobs: 7 },
    { day: 'Thu', earnings: 2580, jobs: 9 },
    { day: 'Fri', earnings: 2890, jobs: 10 },
    { day: 'Sat', earnings: 1620, jobs: 5 },
    { day: 'Sun', earnings: 0, jobs: 0 }
  ];

  return (
    <GradientBackground variant="animated" className="min-h-screen">
      {/* Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-purple-100"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <AnimatedLogo size={40} />
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">Back to Home</span>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Analytics Dashboard</h1>
            </div>
            
            {/* Time Range Selector */}
            <div className="flex items-center space-x-2">
              {['week', 'month', 'year'].map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.header>
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={stagger}
        >
          {/* Revenue Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <motion.div 
                className={`flex items-center space-x-1 text-sm ${stats.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {stats.revenue.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(stats.revenue.change)}%</span>
              </motion.div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Revenue</h3>
            <motion.p 
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
            >
              ${stats.revenue.current.toLocaleString()}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1">vs ${stats.revenue.previous.toLocaleString()} last {timeRange}</p>
          </motion.div>

          {/* Jobs Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <motion.div 
                className={`flex items-center space-x-1 text-sm ${stats.jobs.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {stats.jobs.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(stats.jobs.change)}%</span>
              </motion.div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Completed Jobs</h3>
            <motion.p 
              className="text-2xl font-bold text-gray-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              {stats.jobs.current}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1">vs {stats.jobs.previous} last {timeRange}</p>
          </motion.div>

          {/* Rating Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <motion.div 
                className={`flex items-center space-x-1 text-sm ${stats.rating.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {stats.rating.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(stats.rating.change)}%</span>
              </motion.div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Average Rating</h3>
            <motion.p 
              className="text-2xl font-bold text-gray-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              {stats.rating.current}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1">from 156 reviews</p>
          </motion.div>

          {/* Hours Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-xl"
            variants={scaleIn}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <motion.div 
                className={`flex items-center space-x-1 text-sm ${stats.hours.change > 0 ? 'text-green-600' : 'text-red-600'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {stats.hours.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(stats.hours.change)}%</span>
              </motion.div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Hours Worked</h3>
            <motion.p 
              className="text-2xl font-bold text-gray-900"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
            >
              {stats.hours.current}
            </motion.p>
            <p className="text-xs text-gray-500 mt-1">vs {stats.hours.previous} last {timeRange}</p>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings Chart */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100"
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
          >
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Daily Earnings
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.map((data, index) => (
                <motion.div
                  key={data.day}
                  className="flex-1 flex flex-col items-center"
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-full flex-1 flex items-end">
                    <motion.div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-lg relative group cursor-pointer"
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.earnings / 3000) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${data.earnings}
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{data.day}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Popular Services */}
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100"
            variants={fadeInUp}
            whileHover={{ scale: 1.01 }}
          >
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Top Services
            </h3>
            <div className="space-y-4">
              {[
                { service: 'Emergency Plumbing', jobs: 18, revenue: 4680 },
                { service: 'Water Heater Installation', jobs: 12, revenue: 3600 },
                { service: 'Drain Cleaning', jobs: 15, revenue: 2250 },
                { service: 'Pipe Repair', jobs: 8, revenue: 2050 }
              ].map((item, index) => (
                <motion.div
                  key={item.service}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                >
                  <div>
                    <p className="font-medium text-gray-900">{item.service}</p>
                    <p className="text-sm text-gray-600">{item.jobs} jobs</p>
                  </div>
                  <p className="font-semibold text-purple-600">${item.revenue}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-purple-100"
          variants={fadeInUp}
        >
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Analytics Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="w-full hover:border-purple-300 hover:text-purple-600">
                <Calendar className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="w-full hover:border-purple-300 hover:text-purple-600">
                <Users className="w-4 h-4 mr-2" />
                Customer Insights
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="w-full hover:border-purple-300 hover:text-purple-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Growth Analysis
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
}