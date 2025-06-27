'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Calendar, Clock, MapPin, ChevronRight, Package } from 'lucide-react';
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
}

export default function BookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
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
      contractorName: 'Sarah Johnson'
    },
    {
      id: 'BOOK-002',
      service: 'Plumbing Repair',
      status: 'completed',
      date: new Date(Date.now() - 86400000), // Yesterday
      time: '10:00 AM - 12:00 PM',
      address: '456 Oak Ave, San Francisco, CA',
      price: 250,
      contractorName: 'Mike Wilson'
    },
    {
      id: 'BOOK-003',
      service: 'Electrical Work',
      status: 'confirmed',
      date: new Date(Date.now() + 86400000), // Tomorrow
      time: '9:00 AM - 11:00 AM',
      address: '789 Pine St, San Francisco, CA',
      price: 180,
      contractorName: 'David Chen'
    }
  ];

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setIsLoading(true);
    
    // For demo, use mock data
    setBookings(mockBookings);
    setIsLoading(false);

    // Real implementation would be:
    /*
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const bookingsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
      
      setBookings(bookingsList);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
    */
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view your bookings</h2>
          <p className="text-gray-600 mb-4">Track all your service bookings in one place</p>
          <Link
            href="/book"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-gray-600 mb-6">Book your first home service today!</p>
            <Link
              href="/book"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-block"
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
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.service}</h3>
                      <p className="text-sm text-gray-500">ID: {booking.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{booking.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{booking.address}</span>
                    </div>
                  </div>

                  {booking.contractorName && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Service Professional: <span className="font-medium">{booking.contractorName}</span>
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-semibold">${booking.price}</p>
                    {booking.status === 'on_the_way' && (
                      <p className="text-sm text-primary-600 font-medium animate-pulse">
                        Track Live →
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}