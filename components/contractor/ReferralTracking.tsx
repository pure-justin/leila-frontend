'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, DollarSign, TrendingUp, Calendar, Filter,
  CheckCircle, Clock, XCircle, Award, Download,
  ChevronDown, Search, Eye
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';

interface ReferralRecord {
  id: string;
  refereeType: 'user' | 'contractor';
  refereeName: string;
  refereeEmail: string;
  status: 'pending' | 'qualified' | 'paid' | 'expired';
  dateReferred: Date;
  dateQualified?: Date;
  datePaid?: Date;
  requirement: string;
  progress: {
    current: number;
    required: number;
    metric: string;
  };
  potentialEarning: number;
  paidAmount?: number;
}

export default function ContractorReferralTracking() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'qualified' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null);
  
  // Mock data - in real app, fetch from Firebase
  const [referrals] = useState<ReferralRecord[]>([
    {
      id: '1',
      refereeType: 'contractor',
      refereeName: 'Mike Johnson',
      refereeEmail: 'mike.j@email.com',
      status: 'paid',
      dateReferred: new Date('2024-01-15'),
      dateQualified: new Date('2024-02-20'),
      datePaid: new Date('2024-02-25'),
      requirement: 'Complete 10 jobs',
      progress: { current: 10, required: 10, metric: 'jobs' },
      potentialEarning: 500,
      paidAmount: 500
    },
    {
      id: '2',
      refereeType: 'user',
      refereeName: 'Sarah Williams',
      refereeEmail: 'sarah.w@email.com',
      status: 'qualified',
      dateReferred: new Date('2024-02-01'),
      dateQualified: new Date('2024-02-10'),
      requirement: 'Complete first booking',
      progress: { current: 1, required: 1, metric: 'bookings' },
      potentialEarning: 10,
    },
    {
      id: '3',
      refereeType: 'contractor',
      refereeName: 'James Chen',
      refereeEmail: 'james.c@email.com',
      status: 'pending',
      dateReferred: new Date('2024-02-20'),
      requirement: 'Complete 10 jobs',
      progress: { current: 7, required: 10, metric: 'jobs' },
      potentialEarning: 500,
    },
    {
      id: '4',
      refereeType: 'user',
      refereeName: 'Emily Davis',
      refereeEmail: 'emily.d@email.com',
      status: 'pending',
      dateReferred: new Date('2024-02-25'),
      requirement: 'Complete first booking',
      progress: { current: 0, required: 1, metric: 'bookings' },
      potentialEarning: 10,
    }
  ]);

  const filteredReferrals = referrals.filter(ref => {
    const matchesFilter = filter === 'all' || ref.status === filter;
    const matchesSearch = ref.refereeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.refereeEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalReferrals: referrals.length,
    pendingEarnings: referrals
      .filter(r => r.status === 'pending' || r.status === 'qualified')
      .reduce((sum, r) => sum + r.potentialEarning, 0),
    totalEarned: referrals
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + (r.paidAmount || 0), 0),
    successRate: Math.round((referrals.filter(r => r.status === 'paid').length / referrals.length) * 100)
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'qualified':
        return <Award className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'qualified':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold">{stats.totalReferrals}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Referrals</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold">{formatCurrency(stats.pendingEarnings)}</span>
          </div>
          <p className="text-gray-600 text-sm">Pending Earnings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold">{formatCurrency(stats.totalEarned)}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Earned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold">{stats.successRate}%</span>
          </div>
          <p className="text-gray-600 text-sm">Success Rate</p>
        </motion.div>
      </div>

      {/* Referral Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-sm"
      >
        {/* Header with Filters */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-xl font-bold">Referral History</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="appearance-none px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="qualified">Qualified</option>
                  <option value="paid">Paid</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* Export */}
              <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-5 h-5 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Potential
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <motion.tr
                  key={referral.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{referral.refereeName}</p>
                      <p className="text-sm text-gray-500">{referral.refereeEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      referral.refereeType === 'contractor' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {referral.refereeType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(referral.status)}
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(referral.progress.current / referral.progress.required) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {referral.progress.current}/{referral.progress.required} {referral.progress.metric}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium">
                      {referral.status === 'paid' 
                        ? formatCurrency(referral.paidAmount || 0)
                        : formatCurrency(referral.potentialEarning)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(referral.dateReferred, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedReferral(referral)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Detail Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6"
          >
            <h3 className="text-xl font-bold mb-4">Referral Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Referee</p>
                <p className="font-medium">{selectedReferral.refereeName}</p>
                <p className="text-sm text-gray-500">{selectedReferral.refereeEmail}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Requirement</p>
                <p className="font-medium">{selectedReferral.requirement}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Timeline</p>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Referred: {format(selectedReferral.dateReferred, 'MMM d, yyyy')}</span>
                  </div>
                  {selectedReferral.dateQualified && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Qualified: {format(selectedReferral.dateQualified, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {selectedReferral.datePaid && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span>Paid: {format(selectedReferral.datePaid, 'MMM d, yyyy')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}