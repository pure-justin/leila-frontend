'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import { 
  ArrowLeft,
  Mail, 
  Phone, 
  Calendar,
  DollarSign,
  Star,
  Edit,
  Save,
  X,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Shield,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  UserStatus, 
  ServiceCategory, 
  ContractorTier, 
  VerificationStatus,
  type Contractor 
} from '@/lib/types/firestore-models';

interface ContractorDetail extends Contractor {
  id: string;
}

interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  customerName?: string;
  status: string;
  schedule: {
    requestedDate: any;
    completedAt?: any;
  };
  pricing: {
    finalAmount?: number;
  };
  rating?: {
    overall: number;
  };
}

interface StorageFile {
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: Date;
}

export default function ContractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contractor, setContractor] = useState<ContractorDetail | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedContractor, setEditedContractor] = useState<ContractorDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'verification' | 'performance' | 'files'>('overview');

  useEffect(() => {
    if (!params.id) return;

    const loadContractorData = async () => {
      try {
        // Get contractor details
        const contractorDoc = await getDoc(doc(db, 'users', params.id as string));
        if (!contractorDoc.exists()) {
          router.push('/admin/crm/contractors');
          return;
        }

        const contractorData = {
          id: contractorDoc.id,
          ...contractorDoc.data()
        } as ContractorDetail;
        setContractor(contractorData);
        setEditedContractor(contractorData);

        // Get contractor bookings
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('contractorId', '==', params.id),
          orderBy('metadata.createdAt', 'desc')
        );
        const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
          setBookings(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Booking)));
        });

        // Get contractor files from storage
        try {
          const contractorFilesRef = ref(storage, `contractors/${params.id}`);
          const filesList = await listAll(contractorFilesRef);
          
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
        };
      } catch (error) {
        console.error('Error loading contractor:', error);
        setLoading(false);
      }
    };

    loadContractorData();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!editedContractor || !params.id) return;

    try {
      const updateData = {
        firstName: editedContractor.firstName,
        lastName: editedContractor.lastName,
        phone: editedContractor.phone,
        status: editedContractor.status,
        businessInfo: editedContractor.businessInfo,
        services: editedContractor.services,
        availability: editedContractor.availability,
        tier: editedContractor.tier,
        'metadata.updatedAt': Timestamp.now()
      };

      await updateDoc(doc(db, 'users', params.id as string), updateData);

      setContractor(editedContractor);
      setEditing(false);
    } catch (error) {
      console.error('Error updating contractor:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !params.id || !contractor) return;

    try {
      const storageRef = ref(storage, `contractors/${params.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      
      // Log activity
      await addDoc(collection(db, 'activity_logs'), {
        userId: params.id,
        entityId: params.id,
        entityType: 'contractor',
        action: 'uploaded document',
        details: `Uploaded ${file.name}`,
        agentId: 'admin',
        timestamp: Timestamp.now()
      });
      
      // Reload files
      const contractorFilesRef = ref(storage, `contractors/${params.id}`);
      const filesList = await listAll(contractorFilesRef);
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

  const getTierColor = (tier: ContractorTier) => {
    switch (tier) {
      case ContractorTier.PLATINUM:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ContractorTier.GOLD:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ContractorTier.SILVER:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contractor details...</div>
      </div>
    );
  }

  if (!contractor || !editedContractor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Contractor not found</p>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.pricing?.finalAmount || 0), 0);
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/crm/contractors" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Contractors
        </Link>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {contractor.photoURL ? (
                <img className="w-16 h-16 rounded-full" src={contractor.photoURL} alt="" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-purple-600">
                    {contractor.firstName.charAt(0)}{contractor.lastName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                {editing ? (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editedContractor.firstName}
                        onChange={(e) => setEditedContractor({...editedContractor, firstName: e.target.value})}
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        value={editedContractor.lastName}
                        onChange={(e) => setEditedContractor({...editedContractor, lastName: e.target.value})}
                        className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                        placeholder="Last Name"
                      />
                    </div>
                    <input
                      type="text"
                      value={editedContractor.businessInfo.companyName}
                      onChange={(e) => setEditedContractor({
                        ...editedContractor, 
                        businessInfo: {...editedContractor.businessInfo, companyName: e.target.value}
                      })}
                      className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-600 w-full"
                      placeholder="Company Name"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {contractor.firstName} {contractor.lastName}
                    </h1>
                    <p className="text-gray-600">{contractor.businessInfo.companyName}</p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getTierColor(contractor.tier)}`}>
                    {contractor.tier}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    contractor.status === UserStatus.ACTIVE 
                      ? 'bg-green-100 text-green-800'
                      : contractor.status === UserStatus.INACTIVE
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {contractor.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: {contractor.id}
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
                      setEditedContractor(contractor);
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
                <p className="font-medium">{contractor.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                {editing ? (
                  <input
                    type="tel"
                    value={editedContractor.phone}
                    onChange={(e) => setEditedContractor({...editedContractor, phone: e.target.value})}
                    className="font-medium border-b border-gray-300 focus:outline-none focus:border-purple-600"
                  />
                ) : (
                  <p className="font-medium">{contractor.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {contractor.metadata?.createdAt ? 
                    format(contractor.metadata.createdAt, 'MMM d, yyyy') : 
                    'N/A'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{contractor.ratings.overall.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Rating ({contractor.ratings.totalReviews} reviews)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{completedJobs}</p>
              <p className="text-sm text-gray-500">Completed Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(0)}</p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{contractor.performance.completionRate}%</p>
              <p className="text-sm text-gray-500">Completion Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{contractor.performance.responseTime}m</p>
              <p className="text-sm text-gray-500">Avg Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'services'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Services & Availability
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'verification'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'performance'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'files'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Files ({files.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Business Type</p>
                    <p className="font-medium capitalize">{contractor.businessInfo.businessType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Number</p>
                    <p className="font-medium">{contractor.businessInfo.licenseNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Insurance Number</p>
                    <p className="font-medium">{contractor.businessInfo.insuranceNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tax ID</p>
                    <p className="font-medium">{contractor.businessInfo.taxId || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Booking #{booking.id.slice(-6)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Customer: {booking.customerName || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.schedule.requestedDate?.toDate ? 
                              format(booking.schedule.requestedDate.toDate(), 'MMM d, yyyy') : 
                              'Date TBD'
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${booking.pricing?.finalAmount || 0}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            booking.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                          {booking.rating && (
                            <div className="flex items-center justify-end mt-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm ml-1">{booking.rating.overall}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Services & Availability Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Services */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                {editing ? (
                  <div className="space-y-2">
                    {Object.values(ServiceCategory).map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editedContractor.services.categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...editedContractor.services.categories, category]
                              : editedContractor.services.categories.filter(c => c !== category);
                            setEditedContractor({
                              ...editedContractor,
                              services: {...editedContractor.services, categories: newCategories}
                            });
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{category.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {contractor.services.categories.map((category) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {category.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Service Radius</p>
                    {editing ? (
                      <input
                        type="number"
                        value={editedContractor.services.serviceRadius}
                        onChange={(e) => setEditedContractor({
                          ...editedContractor,
                          services: {...editedContractor.services, serviceRadius: parseInt(e.target.value)}
                        })}
                        className="font-medium border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    ) : (
                      <p className="font-medium">{contractor.services.serviceRadius} miles</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Minimum Job Amount</p>
                    <p className="font-medium">${contractor.services.minimumJobAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Instant Booking</p>
                    <p className="font-medium">{contractor.services.instantBooking ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Working Hours</h3>
                <div className="space-y-2">
                  {Object.entries(contractor.availability.workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium capitalize">{day.toLowerCase()}</span>
                      {editing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={hours.isAvailable}
                            onChange={(e) => {
                              const newHours = {
                                ...editedContractor.availability.workingHours,
                                [day]: {...hours, isAvailable: e.target.checked}
                              };
                              setEditedContractor({
                                ...editedContractor,
                                availability: {...editedContractor.availability, workingHours: newHours}
                              });
                            }}
                            className="mr-2"
                          />
                          {hours.isAvailable && (
                            <>
                              <input
                                type="time"
                                value={hours.startTime}
                                onChange={(e) => {
                                  const newHours = {
                                    ...editedContractor.availability.workingHours,
                                    [day]: {...hours, startTime: e.target.value}
                                  };
                                  setEditedContractor({
                                    ...editedContractor,
                                    availability: {...editedContractor.availability, workingHours: newHours}
                                  });
                                }}
                                className="px-2 py-1 border rounded text-sm"
                              />
                              <span>-</span>
                              <input
                                type="time"
                                value={hours.endTime}
                                onChange={(e) => {
                                  const newHours = {
                                    ...editedContractor.availability.workingHours,
                                    [day]: {...hours, endTime: e.target.value}
                                  };
                                  setEditedContractor({
                                    ...editedContractor,
                                    availability: {...editedContractor.availability, workingHours: newHours}
                                  });
                                }}
                                className="px-2 py-1 border rounded text-sm"
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm">
                          {hours.isAvailable ? `${hours.startTime} - ${hours.endTime}` : 'Unavailable'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                
                {contractor.availability.vacationMode && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        Vacation mode is active until {
                          contractor.availability.vacationEndDate ? 
                            format(contractor.availability.vacationEndDate, 'MMM d, yyyy') : 
                            'further notice'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(contractor.verification).map(([type, status]) => {
                  if (type === 'documents') return null;
                  
                  const getStatusColor = (status: VerificationStatus) => {
                    switch (status) {
                      case VerificationStatus.VERIFIED:
                        return 'bg-green-100 text-green-800 border-green-200';
                      case VerificationStatus.PENDING:
                        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                      case VerificationStatus.REJECTED:
                        return 'bg-red-100 text-red-800 border-red-200';
                      default:
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                  };
                  
                  return (
                    <div key={type} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{type} Verification</h4>
                        <Shield className={`w-5 h-5 ${
                          status === VerificationStatus.VERIFIED ? 'text-green-600' :
                          status === VerificationStatus.PENDING ? 'text-yellow-600' :
                          'text-gray-400'
                        }`} />
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status as VerificationStatus)}`}>
                        {(status as string).replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Verification Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Verification Documents</h3>
                <div className="space-y-3">
                  {contractor.verification.documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doc.type}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {format(doc.uploadedAt instanceof Date ? doc.uploadedAt : new Date(doc.uploadedAt), 'MMM d, yyyy')}
                          </p>
                          {doc.verifiedAt && (
                            <p className="text-sm text-green-600">
                              Verified {format(doc.verifiedAt instanceof Date ? doc.verifiedAt : new Date(doc.verifiedAt), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-medium">{contractor.performance.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${contractor.performance.completionRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">On-Time Rate</span>
                        <span className="font-medium">{contractor.performance.onTimeRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${contractor.performance.onTimeRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Acceptance Rate</span>
                        <span className="font-medium">{contractor.performance.acceptanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${contractor.performance.acceptanceRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Response Time</span>
                        <span className="font-medium">{contractor.performance.responseTime} minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Ratings Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{contractor.ratings.overall.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Punctuality</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{contractor.ratings.punctuality.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quality</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{contractor.ratings.quality.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Communication</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{contractor.ratings.communication.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="font-medium">{contractor.ratings.value.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              {contractor.team && contractor.team.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Team Members</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contractor.team.map((member) => (
                      <div key={member.id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          {member.photoURL ? (
                            <img className="w-10 h-10 rounded-full" src={member.photoURL} alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                            <p className="text-xs text-gray-400">{member.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
                          <ImageIcon className="w-8 h-8 text-blue-500" />
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
        </div>
      </div>
    </div>
  );
}