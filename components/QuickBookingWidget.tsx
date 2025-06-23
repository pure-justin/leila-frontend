'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Home, 
  Calendar, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Service } from '@/lib/types/firestore-models';

interface QuickBookingWidgetProps {
  className?: string;
}

// Popular services for quick access
const popularServices = [
  { id: 'house-cleaning', name: 'House Cleaning', icon: '🧹', estimatedTime: '2-3 hours' },
  { id: 'plumbing-repair', name: 'Plumbing', icon: '🔧', estimatedTime: '1-2 hours' },
  { id: 'electrical-repair', name: 'Electrical', icon: '⚡', estimatedTime: '1-2 hours' },
  { id: 'hvac-service', name: 'HVAC', icon: '❄️', estimatedTime: '1-3 hours' }
];

// Quick time slots
const quickTimeSlots = [
  { label: 'ASAP', value: 'asap', urgency: 'high' },
  { label: 'Today', value: 'today', urgency: 'medium' },
  { label: 'Tomorrow', value: 'tomorrow', urgency: 'low' },
  { label: 'This Week', value: 'week', urgency: 'low' }
];

export default function QuickBookingWidget({ className }: QuickBookingWidgetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Load last booking for quick rebooking
  useEffect(() => {
    const saved = localStorage.getItem('lastBooking');
    if (saved) {
      setLastBooking(JSON.parse(saved));
    }
  }, []);

  const handleQuickBook = async () => {
    if (!selectedService || !selectedTime) return;

    setIsBooking(true);
    
    // Store quick booking preferences
    const quickBookingData = {
      service: selectedService,
      timePreference: selectedTime,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('quickBookingPreference', JSON.stringify(quickBookingData));

    // Navigate to booking with pre-filled data
    setTimeout(() => {
      router.push(`/book?service=${selectedService}&time=${selectedTime}&quick=true`);
    }, 500);
  };

  const handleRebookLast = () => {
    if (!lastBooking) return;
    
    router.push(`/book?service=${lastBooking.service.id}&rebook=true`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-6 shadow-xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Booking
          </h3>
          <p className="text-gray-600 mt-1">Book in seconds, not minutes</p>
        </div>
        
        {user && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Verified
          </motion.div>
        )}
      </div>

      {/* Last Booking Rebook Option */}
      {lastBooking && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Book again</p>
              <p className="font-semibold text-gray-900">{lastBooking.service.name}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRebookLast}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow"
            >
              Rebook
              <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Service Selection */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-3 block">
          What do you need?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {popularServices.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedService(service.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                selectedService === service.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{service.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{service.estimatedTime}</p>
                </div>
              </div>
              {selectedService === service.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              When do you need it?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {quickTimeSlots.map((slot) => (
                <motion.button
                  key={slot.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTime(slot.value)}
                  className={cn(
                    "py-2 px-3 rounded-lg font-medium transition-all text-sm",
                    selectedTime === slot.value
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "bg-white border border-gray-200 hover:border-gray-300",
                    slot.urgency === 'high' && selectedTime !== slot.value && "border-orange-300"
                  )}
                >
                  {slot.label}
                  {slot.urgency === 'high' && (
                    <TrendingUp className="inline-block ml-1 w-3 h-3" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Book Button */}
      <AnimatePresence>
        {selectedService && selectedTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuickBook}
              disabled={isBooking}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Clock className="w-5 h-5" />
                  </motion.div>
                  Booking...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Quick Book Now
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </motion.button>

            {/* Trust indicators */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                4.9 rating
              </span>
              <span>•</span>
              <span>2-hour arrival</span>
              <span>•</span>
              <span>Insured pros</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login prompt if not authenticated */}
      {!user && selectedService && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-blue-50 rounded-xl text-center"
        >
          <p className="text-sm text-blue-800">
            <button
              onClick={() => router.push('/login')}
              className="font-semibold underline hover:no-underline"
            >
              Sign in
            </button>
            {' '}for faster booking and order tracking
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}