'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, Package, Star } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: string;
  service: string;
  status: string;
  date: Date;
  time: string;
  address: string;
  price: number;
  contractorName?: string;
  rating?: number;
}

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock bookings for demo
  const mockBookings: Booking[] = [
    {
      id: 'BOOK-001',
      service: 'House Cleaning',
      status: 'on_the_way',
      date: new Date(),
      time: '2:00 PM - 4:00 PM',
      address: '123 Main St, San Francisco, CA',
      price: 120,
      contractorName: 'Sarah Johnson',
      rating: 4.9
    },
    {
      id: 'BOOK-002',
      service: 'Plumbing Repair',
      status: 'completed',
      date: new Date(Date.now() - 86400000), // Yesterday
      time: '10:00 AM - 12:00 PM',
      address: '456 Oak Ave, San Francisco, CA',
      price: 250,
      contractorName: 'Mike Wilson',
      rating: 4.8
    },
    {
      id: 'BOOK-003',
      service: 'Electrical Work',
      status: 'confirmed',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '9:00 AM - 11:00 AM',
      address: '789 Pine St, San Francisco, CA',
      price: 180,
      contractorName: 'David Chen',
      rating: 4.7
    }
  ];

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setIsLoading(true);
    setBookings(mockBookings);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'on_the_way': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_the_way': return 'On The Way';
      case 'in_progress': return 'In Progress';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-purple-800">Sign in to view your bookings</h2>
          <p className="text-purple-600 mb-4">Track all your service bookings in one place</p>
          <Link
            href="/book"
            className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="px-4 pt-20 pb-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-purple-800 mb-2">My Bookings</h1>
            <p className="text-purple-600">Track your services</p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
              <Package className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2 text-purple-800">No bookings yet</h2>
              <p className="text-purple-600 mb-6">Book your first home service today!</p>
              <Link
                href="/book"
                className="px-6 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 inline-block font-semibold"
              >
                Book a Service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/tracking/${booking.id}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{booking.service}</h3>
                        <p className="text-xs text-gray-500">ID: {booking.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{booking.date.toLocaleDateString()} • {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{booking.address}</span>
                      </div>
                    </div>

                    {booking.contractorName && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-gray-600 font-medium">
                            {booking.rating} • {booking.contractorName}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="font-bold text-purple-600">${booking.price}</p>
                      {booking.status === 'on_the_way' && (
                        <p className="text-xs text-purple-600 font-medium animate-pulse">
                          Track Live →
                        </p>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}