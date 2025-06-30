'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, AlertCircle, Home, Calendar, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek } from 'date-fns';
import ContractorNav from '@/components/ContractorNav';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, fadeInUp, stagger, scaleIn, pulseAnimation } from '@/lib/animations';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';

// Define types locally
interface ContractorSchedule {
  contractorId: string;
  date: string;
  slots: {
    time: string;
    available: boolean;
    jobId?: string;
  }[];
}

// Generate time slots - moved outside component to prevent recreation
const timeSlots = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8; // Start at 8 AM
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export default function ContractorSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedule, setSchedule] = useState<{ [date: string]: ContractorSchedule }>({});
  const [loading, setLoading] = useState(true);
  
  // Mock contractor ID - in real app, get from auth
  const contractorId = 'contractor-123';

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
    return addDays(start, i);
  });

  useEffect(() => {
    const loadWeekSchedule = async () => {
    setLoading(true);
    try {
      const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      // const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      
      // In real app, fetch from API
      // const schedules = await contractorCrmApi.getContractorSchedule(contractorId, format(start, 'yyyy-MM-dd'));
      
      // Generate weekDays inside the effect to avoid dependency issues
      const weekDaysForSchedule = Array.from({ length: 7 }, (_, i) => {
        return addDays(start, i);
      });
      
      // Mock data
      const mockSchedule: { [date: string]: ContractorSchedule } = {};
      weekDaysForSchedule.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        mockSchedule[dateStr] = {
          contractorId,
          date: dateStr,
          slots: timeSlots.map(time => ({
            time,
            available: Math.random() > 0.3, // 70% available
            jobId: Math.random() > 0.7 ? `job-${Math.floor(Math.random() * 1000)}` : undefined
          }))
        };
      });
      
      setSchedule(mockSchedule);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };
    
    loadWeekSchedule();
  }, [currentWeek, contractorId]);

  const toggleSlotAvailability = async (date: string, time: string) => {
    const dateSchedule = schedule[date];
    if (!dateSchedule) return;
    
    const slotIndex = dateSchedule.slots.findIndex(s => s.time === time);
    if (slotIndex === -1) return;
    
    const updatedSchedule = { ...dateSchedule };
    updatedSchedule.slots[slotIndex].available = !updatedSchedule.slots[slotIndex].available;
    
    try {
      // In real app, update via API
      // await contractorCrmApi.updateContractorSchedule(updatedSchedule);
      
      setSchedule(prev => ({
        ...prev,
        [date]: updatedSchedule
      }));
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const getSlotStatus = (date: string, time: string) => {
    const dateSchedule = schedule[date];
    if (!dateSchedule) return 'loading';
    
    const slot = dateSchedule.slots.find(s => s.time === time);
    if (!slot) return 'loading';
    
    if (slot.jobId) return 'booked';
    if (slot.available) return 'available';
    return 'unavailable';
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  return (
    <GradientBackground variant="animated" className="min-h-screen">
      <ContractorNav />
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        {/* Header */}
        <motion.div className="mb-4 md:mb-8" variants={fadeInUp}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3 md:space-x-6 mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <AnimatedLogo size={40} />
                </motion.div>
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hidden sm:inline">Back to Home</span>
              </Link>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Schedule Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2 hidden md:block">Manage your availability and view scheduled jobs</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Week Navigation */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-4 md:mb-6 border border-purple-100"
          variants={fadeInUp}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-purple-100/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-start space-x-2 md:space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                  className="hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </motion.div>
              <h2 className="text-sm md:text-lg font-semibold text-center flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
                <span className="hidden md:inline">, {format(weekDays[6], 'yyyy')}</span>
              </h2>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                  className="hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-2 md:space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(new Date())}
                  className="hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Today
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="hover:border-purple-300 hover:text-purple-600 transition-colors">
                  <Settings className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100/50 flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
            <motion.div className="flex items-center space-x-1 md:space-x-2" whileHover={{ scale: 1.05 }}>
              <motion.div 
                className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded shadow-sm"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-green-700 font-medium">Available</span>
            </motion.div>
            <motion.div className="flex items-center space-x-1 md:space-x-2" whileHover={{ scale: 1.05 }}>
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded shadow-sm"></div>
              <span className="text-gray-600">Unavailable</span>
            </motion.div>
            <motion.div className="flex items-center space-x-1 md:space-x-2" whileHover={{ scale: 1.05 }}>
              <motion.div 
                className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded shadow-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-purple-700 font-medium">Booked</span>
            </motion.div>
          </div>

          {/* Schedule Grid */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 bg-white px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700">
                    Time
                  </th>
                  {weekDays.map((day) => (
                    <th key={day.toISOString()} className="px-1 md:px-2 py-2 md:py-3 text-center">
                      <div className="text-xs md:text-sm font-medium text-gray-700">
                        {format(day, 'EEE')}
                      </div>
                      <div className="text-sm md:text-lg font-semibold text-gray-900">
                        {format(day, 'd')}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium text-gray-700">
                      {time}
                    </td>
                    {weekDays.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const status = getSlotStatus(dateStr, time);
                      
                      return (
                        <td key={day.toISOString()} className="px-1 md:px-2 py-1 md:py-2 text-center">
                          <button
                            onClick={() => status !== 'booked' && toggleSlotAvailability(dateStr, time)}
                            disabled={status === 'booked' || loading}
                            className={`w-full h-8 md:h-10 rounded-lg transition-all duration-300 text-xs md:text-sm transform hover:scale-105 ${
                              status === 'booked'
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white cursor-not-allowed shadow-md'
                                : status === 'available'
                                ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-lg'
                                : status === 'unavailable'
                                ? 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                                : 'bg-gray-100 animate-pulse'
                            }`}
                          >
                            {status === 'booked' && (
                              <span className="text-xs">Job</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 border border-purple-100"
          variants={fadeInUp}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-start space-x-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            </motion.div>
            <div>
              <h3 className="text-sm md:text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Schedule Optimization</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Based on your past performance, we recommend keeping Tuesday and Thursday afternoons 
                available for emergency calls. You typically receive 40% more bookings during these times.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  Apply AI Suggestions
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={stagger}
        >
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300"
            variants={scaleIn}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="inline-block"
            >
              <Clock className="w-8 h-8 text-purple-600 mb-3" />
            </motion.div>
            <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Block Time Off</h3>
            <p className="text-sm text-gray-600 mb-4">
              Need to take time off? Block out dates for vacation or personal time.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" className="w-full hover:border-purple-300 hover:text-purple-600 transition-colors">
                Manage Time Off
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300"
            variants={scaleIn}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Calendar className="w-8 h-8 text-indigo-600 mb-3" />
            </motion.div>
            <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Recurring Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set your regular working hours that repeat every week.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" className="w-full hover:border-purple-300 hover:text-purple-600 transition-colors">
                Set Working Hours
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300"
            variants={scaleIn}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={pulseAnimation.animate}
              className="inline-block"
            >
              <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
            </motion.div>
            <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">Emergency Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Toggle your availability for urgent, high-paying emergency jobs.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" className="w-full hover:border-purple-300 hover:text-purple-600 transition-colors">
                Configure Emergency
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
}