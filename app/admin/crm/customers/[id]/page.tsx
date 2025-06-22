'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, listAll, getDownloadURL, getMetadata, uploadBytes } from 'firebase/storage';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Star,
  Edit,
  Save,
  X,
  Upload,
  FileText,
  Image,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: any;
  status: 'active' | 'inactive' | 'pending';
  notes: string;
  preferences: {
    preferredServices?: string[];
    preferredTimeSlots?: string[];
    communicationPreference?: 'email' | 'phone' | 'sms';
  };
  tags?: string[];
}

interface Booking {
  id: string;
  serviceType: string;
  scheduledDate: any;
  status: string;
  totalPrice: number;
  contractorName?: string;
  rating?: number;
}

interface Activity {
  id: string;
  action: string;
  timestamp: any;
  agentId?: string;
  details?: string;
}

interface StorageFile {
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: Date;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<CustomerDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'files' | 'activity'>('overview');

  useEffect(() => {
    if (!params.id) return;

    const loadCustomerData = async () => {
      try {
        // Get customer details
        const customerDoc = await getDoc(doc(db, 'users', params.id as string));
        if (!customerDoc.exists()) {
          router.push('/admin/crm/customers');
          return;
        }

        const customerData = {
          id: customerDoc.id,
          ...customerDoc.data()
        } as CustomerDetail;
        setCustomer(customerData);
        setEditedCustomer(customerData);

        // Get customer bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('customerId', '==', params.id),
          orderBy('createdAt', 'desc')
        );
        const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
          setBookings(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Booking)));
        });

        // Get customer activities
        const activitiesQuery = query(
          collection(db, 'activity_logs'),
          where('entityId', '==', params.id),
          where('entityType', '==', 'customer'),
          orderBy('timestamp', 'desc')
        );
        const unsubActivities = onSnapshot(activitiesQuery, (snapshot) => {
          setActivities(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Activity)));
        });

        // Get customer files from storage
        try {
          const customerFilesRef = ref(storage, `customers/${params.id}`);
          const filesList = await listAll(customerFilesRef);
          
          const filesData = await Promise.all(
            filesList.items.map(async (item) => {
              const url = await getDownloadURL(item);
              const metadata = await getMetadata(item);
              return {
                name: item.name,
                url,
                type: metadata.contentType?.startsWith('image/') ? 'image' : 'document',
                size: metadata.size || 0,
                uploadedAt: new Date(metadata.timeCreated)
              } as StorageFile;
            })
          );
          setFiles(filesData);
        } catch (error) {
          console.error('Error loading files:', error);
        }

        setLoading(false);

        return () => {
          unsubBookings();
          unsubActivities();
        };
      } catch (error) {
        console.error('Error loading customer:', error);
        setLoading(false);
      }
    };

    loadCustomerData();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!editedCustomer || !params.id) return;

    try {
      await updateDoc(doc(db, 'users', params.id as string), {
        name: editedCustomer.name,
        phone: editedCustomer.phone,
        address: editedCustomer.address,
        notes: editedCustomer.notes,
        status: editedCustomer.status,
        preferences: editedCustomer.preferences,
        tags: editedCustomer.tags || []
      });

      setCustomer(editedCustomer);
      setEditing(false);
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !params.id) return;

    try {
      const storageRef = ref(storage, `customers/${params.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      
      // Reload files
      const customerFilesRef = ref(storage, `customers/${params.id}`);
      const filesList = await listAll(customerFilesRef);
      const filesData = await Promise.all(
        filesList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          return {
            name: item.name,
            url,
            type: metadata.contentType?.startsWith('image/') ? 'image' : 'document',
            size: metadata.size || 0,
            uploadedAt: new Date(metadata.timeCreated)
          } as StorageFile;
        })
      );
      setFiles(filesData);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customer details...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const averageRating = bookings.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / 
                        (bookings.filter(b => b.rating).length || 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/crm/customers" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-2xl font-medium text-white">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={editedCustomer?.name || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, name: e.target.value})}
                    className="text-2xl font-bold border-b-2 border-purple-600 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
                )}
                <p className="text-gray-500">Customer ID: {customer.id}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : customer.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {customer.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Joined {customer.createdAt?.toDate ? format(customer.createdAt.toDate(), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedCustomer(customer);
                      setEditing(false);
                    }}
                    className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                {editing ? (
                  <input
                    type="tel"
                    value={editedCustomer?.phone || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, phone: e.target.value})}
                    className="font-medium border-b border-gray-300 focus:outline-none focus:border-purple-600"
                  />
                ) : (
                  <p className="font-medium">{customer.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                {editing ? (
                  <textarea
                    value={editedCustomer?.address || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, address: e.target.value})}
                    className="font-medium border rounded p-1 focus:outline-none focus:ring-2 focus:ring-purple-600 w-full"
                    rows={2}
                  />
                ) : (
                  <p className="font-medium">{customer.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">{bookings.length}</p>
              <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">${totalSpent.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">Total Spent</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600 mt-1">Avg. Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{activities.length}</p>
              <p className="text-sm text-gray-600 mt-1">Activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-100">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'bookings'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'files'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Files ({files.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'activity'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Activity
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Notes</h3>
                {editing ? (
                  <textarea
                    value={editedCustomer?.notes || ''}
                    onChange={(e) => setEditedCustomer({...editedCustomer!, notes: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    rows={4}
                    placeholder="Add notes about this customer..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {customer.notes || 'No notes added yet.'}
                  </p>
                )}
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Preferred Services</p>
                    <p className="font-medium">
                      {customer.preferences?.preferredServices?.join(', ') || 'None specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Communication Preference</p>
                    <p className="font-medium">
                      {customer.preferences?.communicationPreference || 'Email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {(customer.tags || []).map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                  {editing && (
                    <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-gray-400">
                      + Add tag
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{booking.serviceType}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {booking.scheduledDate?.toDate ? 
                            format(booking.scheduledDate.toDate(), 'MMM d, yyyy') : 
                            'Date TBD'
                          }
                        </p>
                        {booking.contractorName && (
                          <p className="text-sm text-gray-500 mt-1">
                            Contractor: {booking.contractorName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${booking.totalPrice || 0}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.rating && (
                          <div className="flex items-center justify-end mt-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm ml-1">{booking.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div>
              <div className="mb-4">
                <label className="inline-flex items-center px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.length === 0 ? (
                  <p className="text-gray-500 col-span-full text-center py-8">No files uploaded</p>
                ) : (
                  files.map((file, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        {file.type === 'image' ? (
                          <Image className="w-8 h-8 text-blue-500" />
                        ) : (
                          <FileText className="w-8 h-8 text-gray-500" />
                        )}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(1)} KB • {format(file.uploadedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No activity recorded</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.agentId === 'gemini-ai' ? 'bg-purple-600' : 'bg-gray-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.agentId === 'gemini-ai' ? 'AI Assistant' : 'System'}
                        </span>
                        {' '}{activity.action}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">{activity.details}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.timestamp?.toDate?.()?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}