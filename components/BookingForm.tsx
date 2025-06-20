'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { services } from '@/lib/services';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Mail, Phone, FileText, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import { fadeIn, fadeInUp, scaleIn, stagger } from '@/lib/animations';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  preferredDate: z.string(),
  preferredTime: z.string(),
  address: z.string().min(5, 'Please enter a valid address'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  serviceId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export default function BookingForm({ serviceId, onComplete, onCancel }: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const service = services.find(s => s.id === serviceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          serviceId,
          serviceName: service?.name,
        }),
      });

      if (response.ok) {
        alert('Booking submitted successfully! We will contact you shortly.');
        onComplete();
      } else {
        throw new Error('Failed to submit booking');
      }
    } catch (error) {
      alert('Error submitting booking. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <GradientBackground variant="subtle">
      <motion.div 
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-purple-100"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Header with gradient */}
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                backgroundImage: [
                  "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <motion.button
              onClick={onCancel}
              className="flex items-center text-purple-200 hover:text-white mb-4 transition-colors relative z-10"
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to services
            </motion.button>
            
            <div className="relative z-10">
              <motion.div 
                className="flex items-center mb-4"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.span 
                  className="text-5xl mr-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {service.icon}
                </motion.span>
                <div>
                  <h2 className="text-3xl font-bold">Book {service.name}</h2>
                  <p className="text-purple-200 mt-1">{service.description}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Form content */}
          <div className="p-8">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={stagger}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1 text-purple-600" />
                    First Name
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <input
                      {...register('firstName')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                      placeholder="John"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.firstName && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.firstName.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-1 text-purple-600" />
                    Last Name
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <input
                      {...register('lastName')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                      placeholder="Doe"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.lastName && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.lastName.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-purple-600" />
                    Email
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                      placeholder="john.doe@example.com"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1 text-purple-600" />
                    Phone Number
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                      placeholder="(555) 123-4567"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.phone && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.phone.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-purple-600" />
                    Preferred Date
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <input
                      {...register('preferredDate')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                    />
                  </motion.div>
                  <AnimatePresence>
                    {errors.preferredDate && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.preferredDate.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-purple-600" />
                    Preferred Time
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <select
                      {...register('preferredTime')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300 appearance-none bg-white"
                    >
                      <option value="">Select a time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </motion.div>
                  <AnimatePresence>
                    {errors.preferredTime && (
                      <motion.p 
                        className="text-red-500 text-sm mt-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.preferredTime.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Address
          </label>
          <input
            {...register('address')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Please describe any specific issues or requirements..."
          />
        </div>

              <motion.div 
                className="flex gap-4 pt-6"
                variants={fadeInUp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Book Now
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 font-medium transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
}