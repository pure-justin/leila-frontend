'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Activity, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Bot
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalCustomers: number;
  totalContractors: number;
  activeBookings: number;
  completedToday: number;
  aiActionsToday: number;
  pendingOnboarding: number;
  responseTime: string;
  conversionRate: number;
}

interface Activity {
  id: string;
  timestamp: any;
  actor?: {
    id: string;
    type: string;
    name: string;
  };
  action: string;
  userId?: string;
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalContractors: 0,
    activeBookings: 0,
    completedToday: 0,
    aiActionsToday: 0,
    pendingOnboarding: 0,
    responseTime: '< 2 min',
    conversionRate: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get real-time stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Customers count
    const customersQuery = query(collection(db, 'users'), where('role', '==', 'customer'));
    const unsubCustomers = onSnapshot(customersQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalCustomers: snapshot.size }));
    });

    // Contractors count
    const contractorsQuery = query(collection(db, 'users'), where('role', '==', 'contractor'));
    const unsubContractors = onSnapshot(contractorsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, totalContractors: snapshot.size }));
    });

    // Active bookings
    const bookingsQuery = query(
      collection(db, 'bookings'), 
      where('status', 'in', ['pending', 'confirmed', 'in_progress'])
    );
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeBookings: snapshot.size }));
    });

    // Recent activities
    const activitiesQuery = query(
      collection(db, 'activity_logs'), 
      orderBy('timestamp', 'desc'), 
      limit(10)
    );
    const unsubActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        action: doc.data().action || 'Unknown action',
        actor: doc.data().actor || { id: 'unknown', type: 'unknown', name: 'Unknown' }
      })) as Activity[];
      setRecentActivities(activities);
      
      // Count AI actions today
      const aiActionsToday = activities.filter(a => 
        a.actor?.id === 'gemini-ai' && 
        a.timestamp >= today
      ).length;
      setStats(prev => ({ ...prev, aiActionsToday }));
      setLoading(false);
    });

    // Upcoming bookings
    const upcomingQuery = query(
      collection(db, 'bookings'),
      where('status', '==', 'confirmed'),
      orderBy('scheduledDate', 'asc'),
      limit(5)
    );
    const unsubUpcoming = onSnapshot(upcomingQuery, (snapshot) => {
      setUpcomingBookings(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate()
      })));
    });

    return () => {
      unsubCustomers();
      unsubContractors();
      unsubBookings();
      unsubActivities();
      unsubUpcoming();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading CRM dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">CRM Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">AI-powered customer and contractor management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-7xl mx-auto">
        <Link href="/admin/crm/customers" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link href="/admin/crm/contractors" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Contractors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContractors}</p>
              <p className="text-xs text-green-600 mt-1">98% availability</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link href="/admin/crm/bookings" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              <p className="text-xs text-gray-600 mt-1">{stats.completedToday} completed today</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>

        <Link href="/admin/crm/ai-activity" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Actions Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aiActionsToday}</p>
              <p className="text-xs text-gray-600 mt-1">{stats.responseTime} avg response</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Recent AI Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent AI Activity</h2>
              <Link href="/admin/crm/ai-activity" className="text-sm text-purple-600 hover:text-purple-700">
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.actor?.id === 'gemini-ai' ? 'bg-purple-600' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.actor?.id === 'gemini-ai' ? 'AI Assistant' : activity.userId}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.timestamp?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
              <Link href="/admin/crm/bookings" className="text-sm text-purple-600 hover:text-purple-700">
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming bookings</p>
              ) : (
                upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border-l-4 border-purple-600 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{booking.serviceType}</p>
                        <p className="text-sm text-gray-600">
                          {booking.customerName} • {booking.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {booking.scheduledDate?.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.scheduledTime || 'Time TBD'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-7xl mx-auto">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/crm/customers/new" className="text-center p-6 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm">Add Customer</p>
          </Link>
          <Link href="/admin/crm/contractors/new" className="text-center p-6 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm">Add Contractor</p>
          </Link>
          <Link href="/admin/crm/bookings/new" className="text-center p-6 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm">New Booking</p>
          </Link>
          <Link href="/admin/crm/messages" className="text-center p-6 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm">Send Message</p>
          </Link>
        </div>
      </div>
    </div>
  );
}