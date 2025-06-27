'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRealtimeTracking } from '@/hooks/useRealtimeTracking';
import { LiveMap } from '@/components/tracking/LiveMap';
import { TrackingStatus } from '@/components/tracking/TrackingStatus';
import { ArrowLeft, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data - replace with actual API call
const mockContractorInfo = {
  name: 'John Smith',
  phone: '+1 (555) 123-4567',
  photo: '/images/contractors/john-smith.jpg',
  rating: 4.8
};

const mockCustomerLocation = {
  lat: 37.7749,
  lng: -122.4194
};

export default function BookingTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [showNotification, setShowNotification] = useState(false);
  const [lastStatus, setLastStatus] = useState<string>('');

  const { 
    tracking, 
    isLoading, 
    error, 
    isConnected,
    getStatusColor,
    getStatusText 
  } = useRealtimeTracking({
    bookingId,
    onStatusChange: (newStatus) => {
      if (lastStatus && lastStatus !== newStatus) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        
        // Play notification sound
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(console.error);
      }
      setLastStatus(newStatus);
    },
    onLocationUpdate: (location) => {
      console.log('Contractor location updated:', location);
    }
  });

  // Handle call contractor
  const handleCallContractor = () => {
    if (mockContractorInfo.phone) {
      window.location.href = `tel:${mockContractorInfo.phone}`;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            View All Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <h1 className="text-lg font-semibold">Track Booking</h1>
            
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Notification */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getStatusColor(tracking.status) }}
            />
            <p className="font-medium">{getStatusText(tracking.status)}</p>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Live Tracking</h2>
            <LiveMap
              contractorLocation={tracking.contractorLocation}
              customerLocation={mockCustomerLocation}
              height="500px"
            />
            
            {/* Distance and ETA */}
            {tracking.contractorLocation && tracking.estimatedArrival && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold">2.5 km</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">ETA</p>
                  <p className="text-lg font-semibold">
                    {new Date(tracking.estimatedArrival).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Section */}
          <div>
            <TrackingStatus
              tracking={tracking}
              contractorInfo={mockContractorInfo}
              onCall={handleCallContractor}
            />

            {/* Service Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Service Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Service</p>
                  <p className="font-medium">House Cleaning</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">Today, 2:00 PM - 4:00 PM</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">123 Main St, San Francisco, CA 94105</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="font-medium text-lg">$120.00</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3">
              {tracking.status === 'in_progress' && (
                <button className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  View Service Checklist
                </button>
              )}
              {tracking.status === 'completed' && (
                <>
                  <button className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Rate & Review Service
                  </button>
                  <button className="w-full px-4 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                    Book Again
                  </button>
                </>
              )}
              {['pending', 'confirmed'].includes(tracking.status) && (
                <button className="w-full px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}