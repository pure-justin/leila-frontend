'use client';

import { useState, useEffect } from 'react';
import { Home, Star, Briefcase, Calendar, Menu, X, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { formatCurrency } from '@/lib/utils/currency';

// Dynamically import JobFeed to avoid SSR issues with WebSocket
const JobFeed = dynamic(() => import('./components/JobFeed'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading live job feed...</div>
});

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
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Mock contractor data - in real app, get from auth
  const contractorData = {
    id: 'contractor-123',
    token: 'mock-jwt-token',
    name: 'John',
    fullName: 'John Smith',
    profession: 'Master Electrician'
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
    <div className="min-h-screen bg-gray-50">
      {/* Uber-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="lg:hidden">
                <Home className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-medium">
                Hi, {contractorData.name}
              </h1>
              <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
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
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                  isOnline 
                    ? 'gradient-button' 
                    : 'uber-button-secondary'
                }`}
              >
                {isOnline ? 'Go offline' : 'Go online'}
              </button>
              <button className="relative p-2">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
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
      </header>

      {/* View Switcher - Uber Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView('earnings')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'earnings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Earnings
            </button>
            <button
              onClick={() => setActiveView('opportunities')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'opportunities'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setActiveView('scheduled')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeView === 'scheduled'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Scheduled
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Earnings View */}
        {activeView === 'earnings' && (
          <div className={`${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            {/* Earnings Summary Card */}
            <div className="gradient-card gradient-card-hover mb-6">
              <h2 className="text-2xl font-bold mb-6">Today's earnings</h2>
              <div className="text-5xl font-bold mb-2">{formatCurrency(stats.todayEarnings)}</div>
              <p className="text-gray-500 mb-6">{stats.completedJobs} trips</p>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-gray-500">This week</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.weekEarnings)}</p>
                  </div>
                  <Link href="/contractor/analytics">
                    <button className="text-sm font-medium hover:text-gray-600 transition-colors">
                      See details →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-500">Rating</span>
                </div>
                <div className="text-2xl font-bold">{stats.rating}</div>
                <p className="text-sm text-gray-500">{stats.totalReviews} reviews</p>
              </div>
              
              <div className="glass rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-500">Acceptance</span>
                </div>
                <div className="text-2xl font-bold">95%</div>
                <p className="text-sm text-gray-500">Last 7 days</p>
              </div>
              
              <div className="glass rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-500">Online hours</span>
                </div>
                <div className="text-2xl font-bold">32.5</div>
                <p className="text-sm text-gray-500">This week</p>
              </div>
            </div>
          </div>
        )}

        {/* Opportunities View */}
        {activeView === 'opportunities' && (
          <div className={`${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Available jobs</h2>
              <p className="text-gray-500">Accept jobs to start earning</p>
            </div>

            {isOnline ? (
              <div className="space-y-4">
                {availableJobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="border-gradient p-6 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{job.service}</h3>
                          {job.urgent && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                              URGENT
                            </span>
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
                      <button
                        onClick={() => handleAcceptJob(job.id)}
                        className="flex-1 uber-button"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineJob(job.id)}
                        className="flex-1 uber-button-secondary"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass rounded-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">You're offline</h3>
                <p className="text-gray-500 mb-6">Go online to see available jobs</p>
                <button
                  onClick={() => setIsOnline(true)}
                  className="uber-button"
                >
                  Go online
                </button>
              </div>
            )}
          </div>
        )}

        {/* Scheduled View */}
        {activeView === 'scheduled' && (
          <div className={`${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Scheduled jobs</h2>
              <p className="text-gray-500">Your upcoming appointments</p>
            </div>
            
            <div className="bg-white rounded-lg p-12 text-center">
              <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No scheduled jobs</h3>
              <p className="text-gray-500">Accepted jobs will appear here</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}