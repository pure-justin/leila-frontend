'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Calendar, Clock, MapPin, Star, 
  ChevronRight, Sparkles, Zap, Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils/currency';


interface BookingHistory {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  contractorName: string;
  contractorRating: number;
  date: Date;
  price: number;
  propertyId: string;
  propertyName: string;
}

interface QuickActionsProps {
  onServiceSelect?: (serviceId: string) => void;
}

export default function QuickActions({ onServiceSelect }: QuickActionsProps) {
  const { user } = useAuth();
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [selectedRebooking, setSelectedRebooking] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookingHistory();
    }
  }, [user]);

  const loadBookingHistory = async () => {
    // In production, this would fetch from Firestore
    // For now, using mock data from localStorage
    setIsLoading(true);
    try {
      const savedHistory = localStorage.getItem('bookingHistory');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // Convert date strings back to Date objects
        const historyWithDates = parsedHistory.map((booking: any) => ({
          ...booking,
          date: new Date(booking.date)
        }));
        setBookingHistory(historyWithDates);
      } else {
        // Mock data for demo
        setBookingHistory([
          {
            id: '1',
            serviceId: 'house-cleaning',
            serviceName: 'Deep House Cleaning',
            serviceIcon: '🏠',
            contractorName: 'Maria\'s Cleaning Service',
            contractorRating: 4.9,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            price: 150,
            propertyId: '1',
            propertyName: 'Main Home'
          },
          {
            id: '2',
            serviceId: 'lawn-mowing',
            serviceName: 'Lawn Mowing',
            serviceIcon: '🌱',
            contractorName: 'Green Thumb Landscaping',
            contractorRating: 4.8,
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            price: 75,
            propertyId: '1',
            propertyName: 'Main Home'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading booking history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRebook = (booking: BookingHistory) => {
    // Pre-fill the booking form with previous details
    localStorage.setItem('quickRebookData', JSON.stringify({
      serviceId: booking.serviceId,
      propertyId: booking.propertyId,
      preferredContractor: booking.contractorName,
      lastPrice: booking.price
    }));
    
    setSelectedRebooking(booking.serviceId);
  };

  const handleInstantBook = async (booking: BookingHistory) => {
    // One-click rebooking with same contractor, time, and property
    const quickBookingData = {
      serviceId: booking.serviceId,
      propertyId: booking.propertyId,
      contractorId: booking.contractorName, // Would be actual ID in production
      suggestedDate: getNextAvailableDate(booking.date),
      price: booking.price,
      instant: true
    };

    // Save to localStorage for the booking form to pick up
    localStorage.setItem('instantBookingData', JSON.stringify(quickBookingData));
    
    // Navigate directly to payment
    setSelectedRebooking(booking.serviceId);
  };

  const getNextAvailableDate = (lastDate: Date): Date => {
    // Calculate next suggested date based on service frequency
    const today = new Date();
    const daysSinceLast = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Suggest same interval
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysSinceLast);
    
    // If it's in the past, suggest tomorrow
    if (nextDate < today) {
      nextDate.setDate(today.getDate() + 1);
    }
    
    return nextDate;
  };

  const getDaysAgo = (date: Date): string => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (!user || isLoading || bookingHistory.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View all history
          </button>
        </div>

        <div className="space-y-3">
          {bookingHistory.slice(0, 3).map((booking) => (
            <motion.div
              key={booking.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                  {booking.serviceIcon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{booking.serviceName}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      {booking.contractorRating} {booking.contractorName}
                    </span>
                    <span>•</span>
                    <span>{getDaysAgo(booking.date)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handleQuickRebook(booking)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-4 h-4 inline mr-1" />
                  Rebook
                </motion.button>
                
                <motion.button
                  onClick={() => handleInstantBook(booking)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all group-hover:scale-105"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Instant Book
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Favorite Services */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Your Favorites
          </h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {['Cleaning', 'Plumbing', 'Electrical', 'HVAC'].map((service) => (
              <button
                key={service}
                onClick={() => onServiceSelect?.(service.toLowerCase())}
                className="flex-shrink-0 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rebooking Modal */}
      {selectedRebooking && (
        <div>Component optimized</div> {
            setSelectedRebooking(null);
            // Clear quick booking data
            localStorage.removeItem('quickRebookData');
            localStorage.removeItem('instantBookingData');
          }}
          onCancel={() => {
            setSelectedRebooking(null);
            localStorage.removeItem('quickRebookData');
            localStorage.removeItem('instantBookingData');
          }}
        />
      )}
    </>
  );
}