'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useAnimation, LayoutGroup } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  Check, 
  ChevronRight,
  Sparkles,
  Clock,
  MapPin,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyProfile, Service } from '@/lib/types/firestore-models';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { cn } from '@/lib/utils';
import PropertyProfileManager from './PropertyProfileManager';
import { ServiceImage } from './ServiceImage';
import { format, addDays, isSameDay } from 'date-fns';
import confetti from 'canvas-confetti';

// Lazy load heavy components
const PaymentForm = lazy(() => import('./PaymentForm'));

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Animation variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" }
};

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: "spring", damping: 20 }
};

// Skeleton loader component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
);

// Enhanced button with micro-interactions
const AnimatedButton = ({ 
  children, 
  onClick, 
  disabled, 
  variant = 'primary',
  loading = false,
  className = '' 
}: any) => {
  const controls = useAnimation();
  
  return (
    <motion.button
      className={cn(
        "relative px-6 py-3 rounded-xl font-semibold transition-all",
        "transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variant === 'primary' && "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl",
        variant === 'secondary' && "bg-white text-gray-800 border-2 border-gray-200 hover:border-gray-300",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      animate={controls}
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Progress indicator with smooth transitions
const ProgressIndicator = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <motion.div
          key={step}
          className="flex items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <motion.div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-semibold",
              "transition-all duration-300",
              index < currentStep && "bg-green-500 text-white",
              index === currentStep && "bg-blue-600 text-white ring-4 ring-blue-200",
              index > currentStep && "bg-gray-200 text-gray-500"
            )}
            animate={{
              scale: index === currentStep ? 1.1 : 1,
            }}
            transition={{ type: "spring", damping: 15 }}
          >
            {index < currentStep ? (
              <Check className="w-5 h-5" />
            ) : (
              index + 1
            )}
          </motion.div>
          {index < steps.length - 1 && (
            <motion.div
              className="w-24 h-1 mx-2 rounded-full bg-gray-200 overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-blue-600"
                initial={{ x: "-100%" }}
                animate={{ x: index < currentStep ? "0%" : "-100%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

interface EnhancedBookingFormProps {
  service: Service;
  onClose?: () => void;
}

export default function EnhancedBookingForm({ service, onClose }: EnhancedBookingFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [selectedProperty, setSelectedProperty] = useState<PropertyProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [properties, setProperties] = useState<PropertyProfile[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
  // Calculate pricing
  const estimatedPrice = useMemo(() => {
    const basePrice = service.basePrice || 100;
    const urgencyMultiplier = selectedDate && isSameDay(selectedDate, new Date()) ? 1.5 : 1;
    return Math.round(basePrice * urgencyMultiplier);
  }, [service, selectedDate]);

  const steps = ['Property', 'Schedule', 'Review', 'Payment'];

  // Load user properties
  useEffect(() => {
    const loadProperties = async () => {
      setLoadingProperties(true);
      try {
        const savedProperties = localStorage.getItem('userProperties');
        if (savedProperties) {
          const parsed = JSON.parse(savedProperties);
          setProperties(parsed);
          // Auto-select if only one property
          if (parsed.length === 1) {
            setSelectedProperty(parsed[0]);
          }
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoadingProperties(false);
      }
    };
    loadProperties();
  }, []);

  // Handle step navigation with validation
  const handleNext = useCallback(() => {
    if (step === 1 && !selectedProperty) {
      setError('Please select a property');
      return;
    }
    if (step === 2 && (!selectedDate || !selectedTime)) {
      setError('Please select date and time');
      return;
    }
    setError(null);
    setStep(prev => Math.min(prev + 1, 4));
  }, [step, selectedProperty, selectedDate, selectedTime]);

  const handleBack = useCallback(() => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Handle successful booking
  const handleBookingSuccess = async () => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Save for quick rebooking
    const bookingData = {
      service,
      property: selectedProperty,
      lastBookingDate: new Date().toISOString()
    };
    localStorage.setItem('lastBooking', JSON.stringify(bookingData));

    // Redirect to success page
    setTimeout(() => {
      router.push('/payment-success');
    }, 2000);
  };

  // Generate available dates (next 30 days)
  const availableDates = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => addDays(new Date(), i));
  }, []);

  // Generate time slots
  const timeSlots = [
    { time: '08:00', label: 'Morning', period: '8:00 AM' },
    { time: '10:00', label: 'Late Morning', period: '10:00 AM' },
    { time: '12:00', label: 'Noon', period: '12:00 PM' },
    { time: '14:00', label: 'Afternoon', period: '2:00 PM' },
    { time: '16:00', label: 'Late Afternoon', period: '4:00 PM' },
    { time: '18:00', label: 'Evening', period: '6:00 PM' }
  ];

  return (
    <LayoutGroup>
      <motion.div
        className="max-w-4xl mx-auto p-6"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {/* Header */}
        <motion.div 
          className="mb-8"
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Book {service.name}
          </h2>
          <p className="text-gray-600 mt-2">
            Quick and easy booking in just a few steps
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={step - 1} steps={steps} />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {/* Step 1: Property Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                variants={scaleIn}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Select Property</h3>
                </div>

                {loadingProperties ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : properties.length > 0 ? (
                  <div className="grid gap-4">
                    {properties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        variants={fadeInUp}
                        custom={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedProperty(property)}
                        className={cn(
                          "p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedProperty?.id === property.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {property.nickname || property.address.street}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {property.address.street}
                              {property.address.unit && `, ${property.address.unit}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {property.address.city}, {property.address.state} {property.address.zipCode}
                            </p>
                          </div>
                          <motion.div
                            animate={{ scale: selectedProperty?.id === property.id ? 1 : 0 }}
                            className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <PropertyProfileManager
                    onPropertyAdded={(property) => {
                      setProperties([...properties, property]);
                      setSelectedProperty(property);
                    }}
                  />
                )}
              </motion.div>

              <motion.div 
                className="flex justify-end gap-4"
                variants={fadeInUp}
              >
                <AnimatedButton onClick={handleNext} disabled={!selectedProperty}>
                  Continue
                  <ChevronRight className="inline-block ml-2 w-5 h-5" />
                </AnimatedButton>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Schedule Selection */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                variants={scaleIn}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Choose Date & Time</h3>
                </div>

                {/* Date Selection */}
                <div className="mb-8">
                  <h4 className="font-medium text-gray-700 mb-4">Select Date</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {availableDates.slice(0, 14).map((date, index) => (
                      <motion.button
                        key={date.toISOString()}
                        variants={fadeInUp}
                        custom={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(date)}
                        className={cn(
                          "p-3 rounded-xl text-center transition-all",
                          selectedDate && isSameDay(selectedDate, date)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-50 hover:bg-gray-100"
                        )}
                      >
                        <div className="text-xs font-medium">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-bold">
                          {format(date, 'd')}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-4">Select Time</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((slot, index) => (
                      <motion.button
                        key={slot.time}
                        variants={fadeInUp}
                        custom={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTime(slot.time)}
                        className={cn(
                          "p-4 rounded-xl text-center transition-all",
                          selectedTime === slot.time
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                        )}
                      >
                        <Clock className="w-5 h-5 mx-auto mb-1 opacity-70" />
                        <div className="font-semibold">{slot.period}</div>
                        <div className="text-sm opacity-80">{slot.label}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <motion.div 
                  className="mt-6"
                  variants={fadeInUp}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Any special instructions or requirements..."
                  />
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex justify-between gap-4"
                variants={fadeInUp}
              >
                <AnimatedButton onClick={handleBack} variant="secondary">
                  Back
                </AnimatedButton>
                <AnimatedButton onClick={handleNext} disabled={!selectedDate || !selectedTime}>
                  Continue
                  <ChevronRight className="inline-block ml-2 w-5 h-5" />
                </AnimatedButton>
              </motion.div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-6 mb-6"
                variants={scaleIn}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Review Your Booking</h3>
                </div>

                <div className="space-y-6">
                  {/* Service Details */}
                  <motion.div 
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                    variants={fadeInUp}
                  >
                    <ServiceImage
                      serviceName={service.name}
                      category={service.category}
                      className="w-24 h-24 rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">
                          Estimated duration: {service.estimatedDuration} minutes
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Property Details */}
                  <motion.div variants={fadeInUp}>
                    <h4 className="font-medium text-gray-700 mb-2">Property</h4>
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{selectedProperty?.nickname || selectedProperty?.address.street}</p>
                        <p className="text-sm text-gray-600">
                          {selectedProperty?.address.city}, {selectedProperty?.address.state} {selectedProperty?.address.zipCode}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Schedule Details */}
                  <motion.div variants={fadeInUp}>
                    <h4 className="font-medium text-gray-700 mb-2">Schedule</h4>
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {timeSlots.find(s => s.time === selectedTime)?.period}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pricing Details */}
                  <motion.div 
                    className="border-t pt-6"
                    variants={fadeInUp}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Base Price</span>
                        <span className="font-medium">${service.basePrice}</span>
                      </div>
                      {selectedDate && isSameDay(selectedDate, new Date()) && (
                        <div className="flex justify-between text-orange-600">
                          <span>Same-day service (1.5x)</span>
                          <span className="font-medium">+${Math.round(service.basePrice * 0.5)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-blue-600">${estimatedPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div 
                className="flex justify-between gap-4"
                variants={fadeInUp}
              >
                <AnimatedButton onClick={handleBack} variant="secondary">
                  Back
                </AnimatedButton>
                <AnimatedButton onClick={handleNext}>
                  Proceed to Payment
                  <CreditCard className="inline-block ml-2 w-5 h-5" />
                </AnimatedButton>
              </motion.div>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <motion.div
              key="step4"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-lg p-6"
                variants={scaleIn}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <CreditCard className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Complete Payment</h3>
                </div>

                <Suspense fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                }>
                  <Elements stripe={stripePromise}>
                    <PaymentForm
                      amount={estimatedPrice}
                      onSuccess={handleBookingSuccess}
                      bookingData={{
                        service,
                        property: selectedProperty!,
                        date: selectedDate!,
                        time: selectedTime!,
                        notes
                      }}
                    />
                  </Elements>
                </Suspense>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}