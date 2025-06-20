'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Calendar, Clock, DollarSign, Phone, Mail, Shield, Award, Camera, Edit2, Home, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
};

export default function ContractorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  
  // Initialize with default structure
  const [profile, setProfile] = useState({
    id: '',
    firstName: '',
    lastName: '',
    businessName: '',
    photo: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    rating: 4.8,
    totalReviews: 156,
    completedJobs: 289,
    memberSince: '2023-01-15',
    verified: true,
    insured: true,
    licensed: true,
    licenseNumber: 'PL-123456',
    bio: 'Professional plumber with over 10 years of experience. Specializing in residential and commercial plumbing repairs, installations, and emergency services.',
    services: ['Plumbing', 'Emergency Plumbing', 'Water Heater Installation'],
    serviceAreas: ['Downtown', 'Westside', 'Northside', 'Eastside'],
    badges: ['Top Rated', 'Quick Responder', 'Emergency Pro'],
    hourlyRate: 125,
    responseTime: 15, // minutes
    availability: {
      monday: { available: true, start: '08:00', end: '18:00' },
      tuesday: { available: true, start: '08:00', end: '18:00' },
      wednesday: { available: true, start: '08:00', end: '18:00' },
      thursday: { available: true, start: '08:00', end: '18:00' },
      friday: { available: true, start: '08:00', end: '18:00' },
      saturday: { available: true, start: '09:00', end: '14:00' },
      sunday: { available: false, start: '09:00', end: '14:00' },
    },
    stats: {
      onTimeArrival: 98,
      completionRate: 99.5,
      repeatCustomers: 45
    }
  });

  const [originalProfile, setOriginalProfile] = useState(profile);

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      router.push('/contractor/login');
    }
  }, [user, router]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Check if user has contractor profile
      const contractorDoc = await getDoc(doc(db, 'contractors', user.uid));
      
      if (contractorDoc.exists()) {
        const data = contractorDoc.data();
        const profileData = {
          id: user.uid,
          firstName: data.firstName || user.displayName?.split(' ')[0] || '',
          lastName: data.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
          businessName: data.businessInfo?.companyName || data.businessName || '',
          photo: data.photoURL || user.photoURL || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          rating: data.rating || 0,
          totalReviews: data.totalReviews || 0,
          completedJobs: data.completedJobs || 0,
          memberSince: data.createdAt?.toDate() || new Date().toISOString(),
          verified: data.verified || false,
          insured: data.insurance?.verified || false,
          licensed: data.license?.verified || false,
          licenseNumber: data.license?.number || '',
          bio: data.bio || '',
          services: data.services || [],
          serviceAreas: data.serviceAreas || [],
          badges: data.badges || [],
          hourlyRate: data.pricing?.hourlyRate || 0,
          responseTime: data.responseTime || 30,
          availability: data.availability || {
            monday: { available: true, start: '08:00', end: '18:00' },
            tuesday: { available: true, start: '08:00', end: '18:00' },
            wednesday: { available: true, start: '08:00', end: '18:00' },
            thursday: { available: true, start: '08:00', end: '18:00' },
            friday: { available: true, start: '08:00', end: '18:00' },
            saturday: { available: false, start: '09:00', end: '14:00' },
            sunday: { available: false, start: '09:00', end: '14:00' },
          },
          stats: data.stats || {
            onTimeArrival: 0,
            completionRate: 0,
            repeatCustomers: 0
          }
        };
        
        setProfile(profileData);
        setOriginalProfile(profileData);
      } else {
        // Create basic profile from auth user
        const newProfile = {
          ...profile,
          id: user.uid,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          photo: user.photoURL || '',
        };
        setProfile(newProfile);
        setOriginalProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update contractor document
      await updateDoc(doc(db, 'contractors', user.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        businessName: profile.businessName,
        businessInfo: {
          companyName: profile.businessName,
        },
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zipCode: profile.zipCode,
        bio: profile.bio,
        services: profile.services,
        serviceAreas: profile.serviceAreas,
        pricing: {
          hourlyRate: profile.hourlyRate,
        },
        responseTime: profile.responseTime,
        availability: profile.availability,
        updatedAt: Timestamp.now(),
      });
      
      // Update user document as well
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: `${profile.firstName} ${profile.lastName}`,
        phone: profile.phone,
        updatedAt: Timestamp.now(),
      });
      
      setOriginalProfile(profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const recentReviews = [
    {
      id: '1',
      customerName: 'Sarah J.',
      rating: 5,
      date: '2024-01-10',
      service: 'Plumbing',
      comment: 'John was fantastic! Fixed our leak quickly and professionally. Will definitely hire again.'
    },
    {
      id: '2',
      customerName: 'Mike C.',
      rating: 5,
      date: '2024-01-08',
      service: 'Emergency Plumbing',
      comment: 'Responded within 30 minutes to our emergency. Great work and fair pricing.'
    },
    {
      id: '3',
      customerName: 'Emma D.',
      rating: 4,
      date: '2024-01-05',
      service: 'Water Heater Installation',
      comment: 'Professional installation, cleaned up after the job. Would recommend.'
    }
  ];

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setUploadingPhoto(true);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `contractors/${user.uid}/profile.jpg`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update profile locally
      setProfile(prev => ({ ...prev, photo: downloadURL }));
      
      // Update in Firestore
      await updateDoc(doc(db, 'contractors', user.uid), {
        photoURL: downloadURL,
        updatedAt: Timestamp.now(),
      });
      
      // Also update user document
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: downloadURL,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center space-x-3 md:space-x-6">
              <Link href="/" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
              </Link>
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="sm"
                  className="text-sm"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1 md:mr-2" />
                      <span>Save</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="text-sm"
                >
                  <X className="w-4 h-4 mr-1 md:mr-2" />
                  <span>Cancel</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="text-sm"
              >
                <Edit2 className="w-4 h-4 mr-1 md:mr-2" />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              {/* Profile Photo */}
              <div className="text-center mb-4 md:mb-6">
                <div className="relative inline-block">
                  {/* Profile photo - using img tag for dynamic content */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold text-purple-600">
                        {profile.firstName?.charAt(0) || profile.email?.charAt(0) || 'C'}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
                      {uploadingPhoto ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                </div>
                {isEditing ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="First Name"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Business Name"
                      value={profile.businessName}
                      onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mt-3 md:mt-4">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">{profile.businessName}</p>
                  </>
                )}
                
                {/* Rating */}
                <div className="flex items-center justify-center mt-3 md:mt-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 md:w-5 md:h-5 ${
                          i < Math.floor(profile.rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm md:text-base text-gray-600">
                    {profile.rating} ({profile.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                {profile.verified && (
                  <div className="flex items-center text-green-600">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="text-xs md:text-sm">Verified Professional</span>
                  </div>
                )}
                {profile.insured && (
                  <div className="flex items-center text-primary">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="text-xs md:text-sm">Fully Insured</span>
                  </div>
                )}
                {profile.licensed && (
                  <div className="flex items-center text-purple-600">
                    <Award className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    <span className="text-xs md:text-sm">Licensed #{profile.licenseNumber}</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 md:space-y-3 border-t pt-4 md:pt-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  <span className="text-xs md:text-sm truncate">{profile.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  {isEditing ? (
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs md:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <span className="text-xs md:text-sm">{profile.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  <span className="text-xs md:text-sm">Member since {new Date(profile.memberSince).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Performance Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">On-Time Arrival</span>
                      <span className="font-medium">{profile.stats.onTimeArrival}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${profile.stats.onTimeArrival}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Job Completion Rate</span>
                      <span className="font-medium">{profile.stats.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${profile.stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Repeat Customers</span>
                      <span className="font-medium">{profile.stats.repeatCustomers}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${profile.stats.repeatCustomers}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              {isEditing ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell customers about your experience, specialties, and what makes your service unique..."
                />
              ) : (
                <p className="text-gray-600">{profile.bio}</p>
              )}
            </div>

            {/* Services & Areas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Coverage</h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Services Offered</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Service Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="font-medium">Hourly Rate</span>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center">
                      <span className="mr-1">$</span>
                      <input
                        type="number"
                        value={profile.hourlyRate}
                        onChange={(e) => setProfile({ ...profile, hourlyRate: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <span className="text-xl font-bold">${profile.hourlyRate}</span>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="font-medium">Response Time</span>
                  </div>
                  <span className="text-xl font-bold">{profile.responseTime} min</span>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(profile.availability).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 capitalize">{day}</span>
                    {isEditing ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hours.available}
                          onChange={(e) => setProfile({
                            ...profile,
                            availability: {
                              ...profile.availability,
                              [day]: { ...hours, available: e.target.checked }
                            }
                          })}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        {hours.available && (
                          <>
                            <input
                              type="time"
                              value={hours.start}
                              onChange={(e) => setProfile({
                                ...profile,
                                availability: {
                                  ...profile.availability,
                                  [day]: { ...hours, start: e.target.value }
                                }
                              })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <span>-</span>
                            <input
                              type="time"
                              value={hours.end}
                              onChange={(e) => setProfile({
                                ...profile,
                                availability: {
                                  ...profile.availability,
                                  [day]: { ...hours, end: e.target.value }
                                }
                              })}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {hours.available ? `${hours.start} - ${hours.end}` : 'Unavailable'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{review.customerName}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{review.service}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Reviews
              </Button>
            </div>

            {/* Achievement Badges */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100"
              variants={fadeInUp}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Achievements
              </h3>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={stagger}
                initial="initial"
                animate="animate"
              >
                {profile.badges.map((badge, index) => (
                  <motion.div 
                    key={badge} 
                    className="text-center p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg border border-purple-200 hover:shadow-lg transition-shadow cursor-pointer"
                    variants={scaleIn}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    </motion.div>
                    <p className="font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {badge}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}