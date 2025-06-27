'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Clock, Star, 
  Calendar, CheckCircle, AlertCircle, Zap,
  Target, Award, Users, Briefcase
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { useAuth } from '@/contexts/AuthContext';

interface QuickStat {
  label: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

interface ActiveJob {
  id: string;
  customerName: string;
  service: string;
  time: string;
  address: string;
  price: number;
  status: 'upcoming' | 'in-progress' | 'completed';
}

export default function ContractorQuickStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [todaysJobs, setTodaysJobs] = useState<ActiveJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContractorData();
  }, [user]);

  const loadContractorData = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from Firestore
      // Mock data for demo
      setStats([
        {
          label: "Today's Earnings",
          value: formatCurrency(847),
          change: 15,
          icon: DollarSign,
          color: 'from-green-500 to-emerald-500',
          trend: 'up'
        },
        {
          label: 'Jobs Completed',
          value: 4,
          change: 33,
          icon: CheckCircle,
          color: 'from-blue-500 to-cyan-500',
          trend: 'up'
        },
        {
          label: 'Avg Rating',
          value: '4.9',
          change: 2,
          icon: Star,
          color: 'from-yellow-500 to-orange-500',
          trend: 'up'
        },
        {
          label: 'Response Time',
          value: '2m',
          change: -25,
          icon: Clock,
          color: 'from-purple-500 to-indigo-500',
          trend: 'down'
        }
      ]);

      setTodaysJobs([
        {
          id: '1',
          customerName: 'Sarah Johnson',
          service: 'House Cleaning',
          time: '9:00 AM',
          address: '123 Main St',
          price: 150,
          status: 'completed'
        },
        {
          id: '2',
          customerName: 'Mike Chen',
          service: 'Plumbing Repair',
          time: '11:30 AM',
          address: '456 Oak Ave',
          price: 275,
          status: 'completed'
        },
        {
          id: '3',
          customerName: 'Emily Davis',
          service: 'Electrical Check',
          time: '2:00 PM',
          address: '789 Pine Rd',
          price: 200,
          status: 'in-progress'
        },
        {
          id: '4',
          customerName: 'John Smith',
          service: 'HVAC Maintenance',
          time: '4:30 PM',
          address: '321 Elm St',
          price: 225,
          status: 'upcoming'
        }
      ]);
    } catch (error) {
      console.error('Error loading contractor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: ActiveJob['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'upcoming': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleAcceptJob = (jobId: string) => {
    // Quick accept with one click
    console.log('Accepting job:', jobId);
    // Would update Firestore and notify customer
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-4 h-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                {Math.abs(stat.change)}%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's Schedule - Quick View */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Today's Schedule
          </h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View full calendar
          </button>
        </div>

        <div className="space-y-3">
          {todaysJobs.map((job) => (
            <motion.div
              key={job.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {job.time.split(' ')[1]}
                  </p>
                  <p className="font-bold text-lg">
                    {job.time.split(' ')[0]}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{job.customerName}</h4>
                  <p className="text-sm text-gray-600">{job.service} • {job.address}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">{formatCurrency(job.price)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status.replace('-', ' ')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Zap className="w-5 h-5" />
          Go Online
        </motion.button>
        
        <motion.button
          className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Target className="w-5 h-5" />
          Set Availability
        </motion.button>
        
        <motion.button
          className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Users className="w-5 h-5" />
          View Reviews
        </motion.button>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">You're in the top 10%!</h3>
            <p className="text-purple-100">
              Your response time and ratings are exceptional. Keep it up!
            </p>
          </div>
          <Award className="w-16 h-16 text-purple-200" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold">98%</p>
            <p className="text-sm text-purple-200">Acceptance Rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">2m</p>
            <p className="text-sm text-purple-200">Avg Response</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">4.9</p>
            <p className="text-sm text-purple-200">Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}