'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Calendar, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Service, PropertyProfile } from '@/lib/types/firestore-models';
import AnimatedServiceCard from './AnimatedServiceCard';
import EnhancedBookingForm from './EnhancedBookingForm';
import QuickBookingWidget from './QuickBookingWidget';
import { SkeletonServiceGrid } from './LoadingSkeleton';

interface UnifiedServiceFlowProps {
  initialView?: 'browse' | 'search' | 'quick';
}

const viewOptions = [
  { id: 'browse', label: 'Browse Services', icon: Sparkles, color: 'blue' },
  { id: 'search', label: 'Search', icon: Search, color: 'purple' },
  { id: 'quick', label: 'Quick Book', icon: Clock, color: 'green' }
];

export default function UnifiedServiceFlow({ initialView = 'browse' }: UnifiedServiceFlowProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState(initialView);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, reverse geocode to get city name
          setUserLocation('San Francisco, CA');
        },
        () => {
          setUserLocation('Location not available');
        }
      );
    }
  }, []);

  // Load user preferences
  useEffect(() => {
    const preferences = localStorage.getItem('servicePreferences');
    if (preferences) {
      const { lastView } = JSON.parse(preferences);
      if (lastView) setCurrentView(lastView);
    }
  }, []);

  // Save preferences
  const savePreference = useCallback((view: string) => {
    localStorage.setItem('servicePreferences', JSON.stringify({
      lastView: view,
      timestamp: new Date().toISOString()
    }));
  }, []);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    savePreference(view);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How can we help you today?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {userLocation && (
                <span className="flex items-center justify-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Services available in {userLocation}
                </span>
              )}
            </p>

            {/* View Selector */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {viewOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewChange(option.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                    currentView === option.id
                      ? `bg-${option.color}-600 text-white shadow-lg`
                      : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                  )}
                >
                  <option.icon className="w-5 h-5" />
                  {option.label}
                </motion.button>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Same Day Service</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Secure Payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Search View */}
          {currentView === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What service do you need? (e.g., plumbing, cleaning, electrical)"
                  className="w-full px-6 py-4 pr-12 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Popular searches */}
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {['House Cleaning', 'Plumbing Repair', 'AC Repair', 'Electrical', 'Painting'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Book View */}
          {currentView === 'quick' && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <QuickBookingWidget />
            </motion.div>
          )}

          {/* Browse View */}
          {currentView === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isLoading ? (
                <SkeletonServiceGrid count={6} />
              ) : (
                <OptimizedServiceList onServiceSelect={handleServiceSelect} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Service Booking Modal */}
      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-4xl bg-white rounded-2xl shadow-2xl overflow-y-auto z-50"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Book Service</h2>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <EnhancedBookingForm 
                  service={selectedService} 
                  onClose={() => setSelectedService(null)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Optimized service list component
function OptimizedServiceList({ onServiceSelect }: { onServiceSelect: (service: Service) => void }) {
  const services: Service[] = [
    {
      id: 'house-cleaning',
      name: 'House Cleaning',
      category: 'cleaning',
      description: 'Professional home cleaning services',
      basePrice: 120,
      priceRange: { min: 80, max: 200 },
      estimatedDuration: 180,
      popular: true,
      active: true
    },
    {
      id: 'plumbing-repair',
      name: 'Plumbing Repair',
      category: 'plumbing',
      description: 'Fix leaks, clogs, and plumbing issues',
      basePrice: 85,
      priceRange: { min: 75, max: 250 },
      estimatedDuration: 120,
      popular: true,
      active: true
    },
    {
      id: 'electrical-repair',
      name: 'Electrical Repair',
      category: 'electrical',
      description: 'Licensed electrical services',
      basePrice: 95,
      priceRange: { min: 85, max: 300 },
      estimatedDuration: 90,
      popular: true,
      active: true
    },
    {
      id: 'hvac-service',
      name: 'HVAC Service',
      category: 'hvac',
      description: 'Heating and cooling maintenance',
      basePrice: 150,
      priceRange: { min: 100, max: 400 },
      estimatedDuration: 120,
      popular: false,
      active: true
    },
    {
      id: 'painting',
      name: 'Interior Painting',
      category: 'painting',
      description: 'Professional painting services',
      basePrice: 300,
      priceRange: { min: 200, max: 800 },
      estimatedDuration: 480,
      popular: false,
      active: true
    },
    {
      id: 'lawn-care',
      name: 'Lawn Care',
      category: 'landscaping',
      description: 'Lawn mowing and maintenance',
      basePrice: 50,
      priceRange: { min: 40, max: 100 },
      estimatedDuration: 60,
      popular: false,
      active: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service, index) => (
        <AnimatedServiceCard
          key={service.id}
          service={service}
          index={index}
          onClick={() => onServiceSelect(service)}
        />
      ))}
    </div>
  );
}