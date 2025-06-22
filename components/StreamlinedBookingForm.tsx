'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, ChevronRight, CheckCircle, 
  Home, Building, Key, Plus, Edit2, Sparkles,
  CreditCard, Shield, Info, User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PropertyProfileManager from './PropertyProfileManager';
import { PropertyProfile } from '@/lib/types/property-profile';
import { getServiceById } from '@/lib/comprehensive-services-catalog';
import PaymentForm from './PaymentForm';
import AuthPromptModal from './AuthPromptModal';

interface StreamlinedBookingFormProps {
  serviceId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function StreamlinedBookingForm({ 
  serviceId, 
  onComplete, 
  onCancel 
}: StreamlinedBookingFormProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'property' | 'schedule' | 'review' | 'payment'>('property');
  const [selectedProperty, setSelectedProperty] = useState<PropertyProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPropertyManager, setShowPropertyManager] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  
  const service = getServiceById(serviceId);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthModal(true);
    } else {
      // Check for quick rebooking or instant booking data
      const instantBookingData = localStorage.getItem('instantBookingData');
      const quickRebookData = localStorage.getItem('quickRebookData');
      
      if (instantBookingData) {
        const data = JSON.parse(instantBookingData);
        handleInstantBooking(data);
      } else if (quickRebookData) {
        const data = JSON.parse(quickRebookData);
        handleQuickRebook(data);
      } else {
        // Load user's default property
        const savedPropertyId = localStorage.getItem('currentPropertyId');
        if (savedPropertyId) {
          // Load property from localStorage or Firestore
          const savedProfiles = localStorage.getItem('userProfiles');
          if (savedProfiles) {
            const profiles = JSON.parse(savedProfiles);
            const defaultProperty = profiles.find((p: PropertyProfile) => p.id === savedPropertyId);
            if (defaultProperty) {
              setSelectedProperty(defaultProperty);
            }
          }
        }
      }
    }
  }, [user]);

  useEffect(() => {
    // Calculate estimated price based on service and property
    if (service && selectedProperty) {
      let basePrice = service.basePrice;
      
      // Adjust for property size if applicable
      if (selectedProperty.details.squareFeet && service.priceUnit === 'sqft') {
        basePrice = (selectedProperty.details.squareFeet / 100) * service.basePrice;
      }
      
      setEstimatedPrice(basePrice);
    }
  }, [service, selectedProperty]);

  const timeSlots = [
    { value: 'morning', label: 'Morning (8AM - 12PM)', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: '☀️' },
    { value: 'evening', label: 'Evening (5PM - 8PM)', icon: '🌆' },
  ];

  const getDatesForNext7Days = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return dates;
  };

  const handlePropertySelect = (property: PropertyProfile) => {
    setSelectedProperty(property);
    setShowPropertyManager(false);
    localStorage.setItem('currentPropertyId', property.id);
  };

  const handleScheduleSubmit = () => {
    if (selectedDate && selectedTime) {
      setStep('review');
    }
  };

  const handlePaymentSuccess = () => {
    // Save booking to history for quick rebooking
    const bookingData = {
      id: Date.now().toString(),
      serviceId,
      serviceName: service?.name || '',
      serviceIcon: '🏠', // Would be dynamic based on service
      contractorName: 'TBD', // Would be assigned contractor
      contractorRating: 4.8,
      date: new Date(selectedDate),
      price: estimatedPrice,
      propertyId: selectedProperty?.id || '',
      propertyName: selectedProperty?.name || ''
    };
    
    const existingHistory = localStorage.getItem('bookingHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.unshift(bookingData);
    localStorage.setItem('bookingHistory', JSON.stringify(history.slice(0, 10))); // Keep last 10
    
    onComplete();
  };

  const handleInstantBooking = (data: any) => {
    // Set up instant booking - skip to payment
    if (data.propertyId) {
      const savedProfiles = localStorage.getItem('userProfiles');
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const property = profiles.find((p: PropertyProfile) => p.id === data.propertyId);
        if (property) {
          setSelectedProperty(property);
        }
      }
    }
    
    if (data.suggestedDate) {
      setSelectedDate(data.suggestedDate.toISOString().split('T')[0]);
      setSelectedTime('morning');
    }
    
    if (data.price) {
      setEstimatedPrice(data.price);
    }
    
    // Skip directly to payment for instant booking
    if (data.instant) {
      setStep('payment');
    }
  };

  const handleQuickRebook = (data: any) => {
    // Pre-fill form with previous booking data
    if (data.propertyId) {
      const savedProfiles = localStorage.getItem('userProfiles');
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        const property = profiles.find((p: PropertyProfile) => p.id === data.propertyId);
        if (property) {
          setSelectedProperty(property);
          setStep('schedule'); // Skip property selection
        }
      }
    }
    
    if (data.lastPrice) {
      setEstimatedPrice(data.lastPrice);
    }
  };

  if (showAuthModal) {
    return (
      <AuthPromptModal
        isOpen={true}
        onClose={() => {
          setShowAuthModal(false);
          onCancel();
        }}
        message="Sign in to book services with your saved properties"
      />
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Book {service?.name}</h2>
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {['property', 'schedule', 'review', 'payment'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === s ? 'bg-white text-purple-600' : 
                  ['property', 'schedule', 'review', 'payment'].indexOf(step) > i ? 'bg-purple-400 text-white' : 
                  'bg-purple-700 text-purple-400'
                }`}>
                  {['property', 'schedule', 'review', 'payment'].indexOf(step) > i ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 3 && (
                  <div className={`w-full h-1 mx-2 ${
                    ['property', 'schedule', 'review', 'payment'].indexOf(step) > i ? 'bg-purple-400' : 'bg-purple-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {/* Step 1: Property Selection */}
            {step === 'property' && (
              <motion.div
                key="property"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">Where do you need service?</h3>
                  
                  {selectedProperty ? (
                    <div 
                      className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50 cursor-pointer"
                      onClick={() => setShowPropertyManager(true)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
                            selectedProperty.type === 'home' ? 'from-purple-500 to-indigo-500' :
                            selectedProperty.type === 'business' ? 'from-blue-500 to-cyan-500' :
                            'from-green-500 to-emerald-500'
                          } flex items-center justify-center text-white`}>
                            {selectedProperty.type === 'home' ? <Home className="w-6 h-6" /> :
                             selectedProperty.type === 'business' ? <Building className="w-6 h-6" /> :
                             <Key className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{selectedProperty.name}</h4>
                            <p className="text-sm text-gray-600">
                              {selectedProperty.address.street}, {selectedProperty.address.city}
                            </p>
                            {selectedProperty.details.specialInstructions && (
                              <p className="text-xs text-gray-500 mt-1">
                                {selectedProperty.details.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPropertyManager(true)}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Add a property</p>
                    </button>
                  )}
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Gate code, parking instructions, specific areas to focus on..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <button
                  onClick={() => selectedProperty && setStep('schedule')}
                  disabled={!selectedProperty}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Scheduling
                  <ChevronRight className="w-5 h-5 inline ml-2" />
                </button>
              </motion.div>
            )}

            {/* Step 2: Schedule */}
            {step === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold mb-4">When would you like service?</h3>
                  
                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Date
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {getDatesForNext7Days().map((date) => (
                        <button
                          key={date.value}
                          onClick={() => setSelectedDate(date.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedDate === date.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-medium text-sm">{date.dayOfWeek}</p>
                          <p className="text-xs text-gray-600">{date.label.split(' ').slice(-2).join(' ')}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Preferred Time
                    </label>
                    <div className="space-y-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => setSelectedTime(slot.value)}
                          className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
                            selectedTime === slot.value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-2xl mr-3">{slot.icon}</span>
                          <span className="font-medium">{slot.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('property')}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleScheduleSubmit}
                    disabled={!selectedDate || !selectedTime}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Review Booking
                    <ChevronRight className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold mb-4">Review Your Booking</h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{service?.name}</p>
                      <p className="text-sm text-gray-600">{service?.description}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedProperty?.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedProperty?.address.street}, {selectedProperty?.address.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {timeSlots.find(t => t.value === selectedTime)?.label}
                      </p>
                    </div>
                  </div>

                  {specialInstructions && (
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Special Instructions</p>
                        <p className="text-sm text-gray-600">{specialInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Estimated Total</span>
                    <span className="text-2xl font-bold text-purple-700">
                      ${estimatedPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Final price may vary based on actual work required</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('schedule')}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Proceed to Payment
                    <CreditCard className="w-5 h-5 inline ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Payment */}
            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PaymentForm
                  amount={estimatedPrice}
                  onSuccess={handlePaymentSuccess}
                  onCancel={() => setStep('review')}
                  metadata={{
                    serviceId,
                    propertyId: selectedProperty?.id,
                    scheduledDate: selectedDate,
                    scheduledTime: selectedTime
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Property Manager Modal */}
        <AnimatePresence>
          {showPropertyManager && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPropertyManager(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-6">Select or Add Property</h3>
                <PropertyProfileManager
                  onSelectProfile={handlePropertySelect}
                  currentProfileId={selectedProperty?.id}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}