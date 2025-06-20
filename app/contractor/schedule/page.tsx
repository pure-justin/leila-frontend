'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek } from 'date-fns';
import ContractorNav from '@/components/ContractorNav';
import Link from 'next/link';

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

export default function ContractorSchedulePage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [schedule, setSchedule] = useState<{ [date: string]: ContractorSchedule }>({});
  const [loading, setLoading] = useState(true);
  
  // Mock contractor ID - in real app, get from auth
  const contractorId = 'contractor-123';
  
  // Generate time slots
  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Start at 8 AM
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
    return addDays(start, i);
  });

  useEffect(() => {
    const loadWeekSchedule = async () => {
    setLoading(true);
    try {
      // const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
      // const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
      
      // In real app, fetch from API
      // const schedules = await contractorCrmApi.getContractorSchedule(contractorId, format(start, 'yyyy-MM-dd'));
      
      // Mock data
      const mockSchedule: { [date: string]: ContractorSchedule } = {};
      weekDays.forEach(day => {
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
  }, [currentWeek, weekDays, timeSlots]);

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
    <div className="min-h-screen bg-gray-50">
      <ContractorNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3 md:space-x-6 mb-4 md:mb-0">
              <Link href="/" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
              </Link>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-gray-900">Schedule Management</h1>
                <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2 hidden md:block">Manage your availability and view scheduled jobs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow mb-4 md:mb-6">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center justify-between sm:justify-start space-x-2 md:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-sm md:text-lg font-semibold text-center flex-1 sm:flex-none">
                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
                <span className="hidden md:inline">, {format(weekDays[6], 'yyyy')}</span>
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end space-x-2 md:space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="px-4 md:px-6 py-2 md:py-3 bg-gray-50 border-b flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded"></div>
              <span>Booked</span>
            </div>
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
                            className={`w-full h-8 md:h-10 rounded transition-colors text-xs md:text-sm ${
                              status === 'booked'
                                ? 'bg-blue-500 text-white cursor-not-allowed'
                                : status === 'available'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
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
        </div>

        {/* AI Suggestions */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900">AI Schedule Optimization</h3>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Based on your past performance, we recommend keeping Tuesday and Thursday afternoons 
                available for emergency calls. You typically receive 40% more bookings during these times.
              </p>
              <Button variant="outline" size="sm" className="mt-3">
                Apply AI Suggestions
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Block Time Off</h3>
            <p className="text-sm text-gray-600 mb-4">
              Need to take time off? Block out dates for vacation or personal time.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Manage Time Off
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recurring Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Set your regular working hours that repeat every week.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Set Working Hours
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Emergency Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Toggle your availability for urgent, high-paying emergency jobs.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Configure Emergency
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}