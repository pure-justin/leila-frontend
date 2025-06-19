'use client';

import { useState } from 'react';
import { Bell, DollarSign, Star, TrendingUp, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

// Dynamically import JobFeed to avoid SSR issues with WebSocket
const JobFeed = dynamic(() => import('./components/JobFeed'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading job feed...</div>
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
  const [activeTab, setActiveTab] = useState('available');
  const [isOnline, setIsOnline] = useState(true);
  const [showLiveFeed, setShowLiveFeed] = useState(false);
  
  // Mock contractor data - in real app, get from auth
  const contractorData = {
    id: 'contractor-123',
    token: 'mock-jwt-token'
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

  const myJobs: Job[] = [
    {
      id: '4',
      customerName: 'John Smith',
      service: 'Plumbing',
      address: '321 Elm St, Eastside',
      date: 'Today',
      time: '11:00 AM',
      status: 'accepted',
      price: 175,
      distance: '3.5 mi',
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Contractor Dashboard</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
                <button
                  onClick={() => setIsOnline(!isOnline)}
                  className="text-sm text-primary hover:text-indigo-700"
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLiveFeed(!showLiveFeed)}
                className={showLiveFeed ? 'bg-indigo-50 border-indigo-300' : ''}
              >
                <Bell className="w-4 h-4 mr-2" />
                Live Feed {showLiveFeed ? 'On' : 'Off'}
              </Button>
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-600">Today&apos;s Earnings</p>
                <p className="text-xl font-bold text-gray-900">${stats.todayEarnings}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Week Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.weekEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rating</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
                  <Star className="w-5 h-5 text-yellow-500 ml-1" fill="currentColor" />
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Job Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Job Feed - Shows when enabled */}
        {showLiveFeed && isOnline && (
          <div className="mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <JobFeed
                contractorId={contractorData.id}
                token={contractorData.token}
                onAcceptJob={handleAcceptJob}
                onDeclineJob={handleDeclineJob}
              />
            </div>
          </div>
        )}
        
        <div className="bg-white shadow rounded-lg">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('available')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'available'
                    ? 'text-primary border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Available Jobs ({availableJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('my-jobs')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'my-jobs'
                    ? 'text-primary border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Jobs ({myJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'completed'
                    ? 'text-primary border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Available Jobs */}
            {activeTab === 'available' && (
              <div className="space-y-4">
                {availableJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                          {job.urgent && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                              URGENT
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{job.date} at {job.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.address} • {job.distance}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">Customer: {job.customerName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-900">${job.price}</p>
                        <p className="text-sm text-gray-500">Est. 2 hours</p>
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineJob(job.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptJob(job.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {availableJobs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No available jobs at the moment</p>
                    <p className="text-sm text-gray-400 mt-2">New jobs will appear here automatically</p>
                  </div>
                )}
              </div>
            )}

            {/* My Jobs */}
            {activeTab === 'my-jobs' && (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.service}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            ACCEPTED
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{job.date} at {job.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.address}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">Customer: {job.customerName}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-gray-900">${job.price}</p>
                        <div className="mt-3 space-y-2">
                          <Button size="sm" className="w-full">
                            Get Directions
                          </Button>
                          <Button size="sm" variant="outline" className="w-full">
                            Contact Customer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Completed Jobs */}
            {activeTab === 'completed' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Completed jobs will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}