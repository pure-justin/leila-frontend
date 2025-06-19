'use client';

import { useState } from 'react';
import { Star, MapPin, Calendar, Clock, DollarSign, Phone, Mail, Shield, Award, Camera, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ContractorProfile() {
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock contractor data
  const [profile, setProfile] = useState({
    id: 'contractor-123',
    firstName: 'John',
    lastName: 'Smith',
    businessName: 'Smith Plumbing Services',
    photo: '/api/placeholder/150/150',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In real app, upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? 'default' : 'outline'}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {/* Profile photo - using img tag for dynamic content */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.photo}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600">{profile.businessName}</p>
                
                {/* Rating */}
                <div className="flex items-center justify-center mt-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(profile.rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {profile.rating} ({profile.totalReviews} reviews)
                  </span>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="space-y-3 mb-6">
                {profile.verified && (
                  <div className="flex items-center text-green-600">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm">Verified Professional</span>
                  </div>
                )}
                {profile.insured && (
                  <div className="flex items-center text-blue-600">
                    <Shield className="w-5 h-5 mr-2" />
                    <span className="text-sm">Fully Insured</span>
                  </div>
                )}
                {profile.licensed && (
                  <div className="flex items-center text-purple-600">
                    <Award className="w-5 h-5 mr-2" />
                    <span className="text-sm">Licensed #{profile.licenseNumber}</span>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-3" />
                  <span className="text-sm">{profile.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span className="text-sm">Member since {new Date(profile.memberSince).toLocaleDateString()}</span>
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
                        className="bg-blue-600 h-2 rounded-full"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
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
                  <span className="text-xl font-bold">${profile.hourlyRate}</span>
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
                    <span className="text-sm text-gray-600">
                      {hours.available ? `${hours.start} - ${hours.end}` : 'Unavailable'}
                    </span>
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.badges.map((badge) => (
                  <div key={badge} className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                    <Award className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">{badge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}