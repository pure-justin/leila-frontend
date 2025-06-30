'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { 
  Bot, 
  Calendar, 
  Clock, 
  Search,
  Activity,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  action: string;
  agentId: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  details?: string;
  metadata?: any;
  timestamp: any;
  impact?: {
    type: 'booking_created' | 'customer_onboarded' | 'contractor_matched' | 'issue_resolved';
    value?: number;
  };
}

interface AIStats {
  totalActions: number;
  bookingsCreated: number;
  customersHelped: number;
  contractorsMatched: number;
  avgResponseTime: number;
  successRate: number;
}

export default function AIActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<AIStats>({
    totalActions: 0,
    bookingsCreated: 0,
    customersHelped: 0,
    contractorsMatched: 0,
    avgResponseTime: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Calculate date range based on filter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Get AI activities
    const activitiesQuery = query(
      collection(db, 'activity_logs'),
      where('agentId', '==', 'gemini-ai'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      orderBy('timestamp', 'desc'),
      limit(500)
    );

    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activityData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as ActivityLog[];

      setActivities(activityData);
      
      // Calculate stats
      const newStats: AIStats = {
        totalActions: activityData.length,
        bookingsCreated: activityData.filter(a => a.action.includes('booking') || a.action.includes('scheduled')).length,
        customersHelped: new Set(activityData.map(a => a.userId).filter(Boolean)).size,
        contractorsMatched: activityData.filter(a => a.action.includes('matched') || a.action.includes('assigned')).length,
        avgResponseTime: 1.5, // This would be calculated from actual response times
        successRate: 94 // This would be calculated from success/failure metrics
      };
      
      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [timeFilter]);

  useEffect(() => {
    // Filter activities based on search and action filter
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userId?.includes(searchTerm)
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(activity => {
        switch (actionFilter) {
          case 'bookings':
            return activity.action.includes('booking') || activity.action.includes('scheduled');
          case 'customer_service':
            return activity.action.includes('answered') || activity.action.includes('helped') || activity.action.includes('resolved');
          case 'matching':
            return activity.action.includes('matched') || activity.action.includes('assigned');
          case 'onboarding':
            return activity.action.includes('onboarded') || activity.action.includes('verified');
          default:
            return true;
        }
      });
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, actionFilter]);

  const getActionIcon = (action: string) => {
    if (action.includes('booking') || action.includes('scheduled')) {
      return <Calendar className="w-4 h-4 text-blue-500" />;
    } else if (action.includes('matched') || action.includes('assigned')) {
      return <Users className="w-4 h-4 text-purple-500" />;
    } else if (action.includes('answered') || action.includes('responded')) {
      return <MessageSquare className="w-4 h-4 text-green-500" />;
    } else if (action.includes('analyzed') || action.includes('processed')) {
      return <Activity className="w-4 h-4 text-orange-500" />;
    }
    return <Bot className="w-4 h-4 text-gray-500" />;
  };

  const getActionCategory = (action: string) => {
    if (action.includes('booking') || action.includes('scheduled')) {
      return { label: 'Booking', color: 'bg-blue-100 text-blue-700' };
    } else if (action.includes('matched') || action.includes('assigned')) {
      return { label: 'Matching', color: 'bg-purple-100 text-purple-700' };
    } else if (action.includes('answered') || action.includes('responded')) {
      return { label: 'Support', color: 'bg-green-100 text-green-700' };
    } else if (action.includes('analyzed') || action.includes('processed')) {
      return { label: 'Analysis', color: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'Other', color: 'bg-gray-100 text-gray-700' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading AI activity...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">AI Activity</h1>
          <p className="text-gray-600 mt-2 text-lg">Monitor AI assistant actions and performance</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Bot className="w-8 h-8 text-purple-600" />
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalActions}</p>
          <p className="text-sm text-gray-500">Total Actions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xs text-green-600 font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.bookingsCreated}</p>
          <p className="text-sm text-gray-500">Bookings Created</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600" />
            <span className="text-xs text-green-600 font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.customersHelped}</p>
          <p className="text-sm text-gray-500">Customers Helped</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Briefcase className="w-8 h-8 text-orange-600" />
            <span className="text-xs text-green-600 font-medium">+5%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.contractorsMatched}</p>
          <p className="text-sm text-gray-500">Contractors Matched</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}s</p>
          <p className="text-sm text-gray-500">Avg Response Time</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
          <p className="text-sm text-gray-500">Success Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search actions, users, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last Month</option>
                <option value="all">All Time</option>
              </select>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Actions</option>
                <option value="bookings">Bookings</option>
                <option value="customer_service">Customer Service</option>
                <option value="matching">Contractor Matching</option>
                <option value="onboarding">Onboarding</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Activity Timeline</h2>
          <p className="text-sm text-gray-500 mt-1">{filteredActivities.length} activities found</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 max-h-[800px] overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No activities found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredActivities.map((activity) => {
                const category = getActionCategory(activity.action);
                return (
                  <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            AI Assistant {activity.action}
                          </p>
                          {activity.details && (
                            <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${category.color}`}>
                              {category.label}
                            </span>
                            {activity.userId && (
                              <span className="text-xs text-gray-500">
                                User: {activity.userId.slice(-6)}
                              </span>
                            )}
                            {activity.entityId && (
                              <span className="text-xs text-gray-500">
                                {activity.entityType}: {activity.entityId.slice(-6)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {activity.timestamp ? format(activity.timestamp, 'MMM d, h:mm a') : 'N/A'}
                          </p>
                          {activity.impact && (
                            <div className="mt-1">
                              {activity.impact.type === 'booking_created' && (
                                <span className="text-xs text-green-600 font-medium">
                                  +${activity.impact.value || 0} revenue
                                </span>
                              )}
                              {activity.impact.type === 'customer_onboarded' && (
                                <span className="text-xs text-blue-600 font-medium">
                                  New customer
                                </span>
                              )}
                              {activity.impact.type === 'contractor_matched' && (
                                <span className="text-xs text-purple-600 font-medium">
                                  Match made
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-7xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">AI Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Peak Activity Time</p>
            <p className="text-xs text-gray-600 mt-1">2:00 PM - 4:00 PM</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl border border-blue-100">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Most Common Query</p>
            <p className="text-xs text-gray-600 mt-1">Service availability</p>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Resolution Rate</p>
            <p className="text-xs text-gray-600 mt-1">87% first contact</p>
          </div>
        </div>
      </div>
    </div>
  );
}