'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { 
  Calendar,
  Clock,
  DollarSign,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { BookingStatus, ServiceCategory, type Booking } from '@/lib/types/firestore-models';

interface BookingWithDetails extends Booking {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  contractorName?: string;
  contractorEmail?: string;
  contractorPhone?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);

  useEffect(() => {
    // Calculate date range
    const now = new Date();
    let startDate = new Date(0);
    
    if (dateFilter !== 'all') {
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
    }

    // Get bookings
    let bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('metadata.createdAt', 'desc')
    );

    if (dateFilter !== 'all') {
      bookingsQuery = query(
        collection(db, 'bookings'),
        where('metadata.createdAt', '>=', Timestamp.fromDate(startDate)),
        orderBy('metadata.createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(bookingsQuery, async (snapshot) => {
      const bookingData: BookingWithDetails[] = [];
      
      // Get user data for each booking
      const userIds = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.customerId) userIds.add(data.customerId);
        if (data.contractorId) userIds.add(data.contractorId);
      });

      // Fetch user details
      const userDetails: { [key: string]: any } = {};
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            userDetails[userId] = userDoc.data();
          }
        } catch (error) {
          console.error('Error fetching user:', userId, error);
        }
      }

      // Combine booking data with user details
      snapshot.docs.forEach(bookingDoc => {
        const data = bookingDoc.data();
        const booking: BookingWithDetails = {
          id: bookingDoc.id,
          ...data
        } as BookingWithDetails;

        // Add customer details
        if (data.customerId && userDetails[data.customerId]) {
          const customer = userDetails[data.customerId];
          booking.customerName = `${customer.firstName} ${customer.lastName}`;
          booking.customerEmail = customer.email;
          booking.customerPhone = customer.phone;
        }

        // Add contractor details
        if (data.contractorId && userDetails[data.contractorId]) {
          const contractor = userDetails[data.contractorId];
          booking.contractorName = `${contractor.firstName} ${contractor.lastName}`;
          booking.contractorEmail = contractor.email;
          booking.contractorPhone = contractor.phone;
        }

        bookingData.push(booking);
      });

      setBookings(bookingData);
      setFilteredBookings(bookingData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [dateFilter]);

  useEffect(() => {
    // Filter bookings
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.contractorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.location.street.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(booking => booking.details.category === categoryFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, categoryFilter]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CONFIRMED:
        return 'bg-purple-100 text-purple-800';
      case BookingStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        'metadata.updatedAt': Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
    inProgress: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length,
    completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
    revenue: bookings
      .filter(b => b.status === BookingStatus.COMPLETED)
      .reduce((sum, b) => sum + (b.pricing.finalAmount || 0), 0)
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Bookings</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage all service bookings and job assignments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats.revenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by ID, customer, contractor, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Status</option>
                {Object.values(BookingStatus).map(status => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="all">All Services</option>
                {Object.values(ServiceCategory).map(category => (
                  <option key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Contractor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-purple-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">#{booking.id.slice(-6)}</p>
                      <p className={`text-xs ${getUrgencyColor(booking.details.urgency)}`}>
                        {booking.details.urgency} priority
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.customerName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {booking.customerEmail || 'N/A'}
                      </p>
                      {booking.customerPhone && (
                        <p className="text-xs text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {booking.customerPhone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.details.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {booking.details.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.contractorId ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.contractorName || 'Assigned'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {booking.contractorId.slice(-6)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900">
                        {booking.schedule.requestedDate ? 
                          format(booking.schedule.requestedDate, 'MMM d, yyyy') : 
                          'TBD'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.schedule.requestedTimeSlot || 'Flexible'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value as BookingStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(booking.status)} cursor-pointer`}
                    >
                      {Object.values(BookingStatus).map(status => (
                        <option key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${booking.pricing.finalAmount || booking.pricing.estimatedAmount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.payment.status.replace(/_/g, ' ').toLowerCase()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No bookings found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div>
                <h4 className="font-medium mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Booking ID</p>
                    <p className="font-medium">#{selectedBooking.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                      {selectedBooking.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Service</p>
                    <p className="font-medium">{selectedBooking.details.category.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Urgency</p>
                    <p className={`font-medium ${getUrgencyColor(selectedBooking.details.urgency)}`}>
                      {selectedBooking.details.urgency}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-gray-500 text-sm">Description</p>
                  <p className="text-sm mt-1">{selectedBooking.details.description}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedBooking.customerName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedBooking.customerEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedBooking.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{selectedBooking.location.street}</p>
                    <p className="text-xs text-gray-600">
                      {selectedBooking.location.city}, {selectedBooking.location.state} {selectedBooking.location.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contractor Info */}
              {selectedBooking.contractorId && (
                <div>
                  <h4 className="font-medium mb-3">Contractor Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{selectedBooking.contractorName || 'Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedBooking.contractorEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{selectedBooking.contractorPhone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contractor ID</p>
                      <p className="font-medium">{selectedBooking.contractorId}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule & Pricing */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Schedule</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Requested Date</p>
                      <p className="font-medium">
                        {selectedBooking.schedule.requestedDate ? 
                          format(selectedBooking.schedule.requestedDate, 'MMMM d, yyyy') : 
                          'TBD'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Time Slot</p>
                      <p className="font-medium">{selectedBooking.schedule.requestedTimeSlot || 'Flexible'}</p>
                    </div>
                    {selectedBooking.schedule.completedAt && (
                      <div>
                        <p className="text-gray-500">Completed At</p>
                        <p className="font-medium">
                          {format(selectedBooking.schedule.completedAt, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-500">Estimated Amount</p>
                      <p className="font-medium">${selectedBooking.pricing.estimatedAmount}</p>
                    </div>
                    {selectedBooking.pricing.finalAmount && (
                      <div>
                        <p className="text-gray-500">Final Amount</p>
                        <p className="font-medium text-lg">${selectedBooking.pricing.finalAmount}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Payment Status</p>
                      <p className="font-medium">{selectedBooking.payment.status.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}