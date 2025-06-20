'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, Clock, User, Star, DollarSign, 
  CheckCircle, AlertCircle, Navigation, Phone,
  MessageCircle, Shield, TrendingUp
} from 'lucide-react';
import { matchingService, ServiceRequest, Match } from '@/lib/realtime-matching-service';
import { useAuth } from '@/hooks/useAuth';
import MapView from './MapView';

interface ServiceRequestFlowProps {
  service: any;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function ServiceRequestFlow({ service, onComplete, onCancel }: ServiceRequestFlowProps) {
  const { user } = useAuth();
  const [stage, setStage] = useState<'location' | 'searching' | 'matched' | 'in_progress' | 'completed'>('location');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [contractor, setContractor] = useState<any>(null);
  const [eta, setEta] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [searchingAnimation, setSearchingAnimation] = useState(0);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Current Location'
          };
          setLocation(loc);
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${loc.lat},${loc.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          if (data.results?.[0]) {
            loc.address = data.results[0].formatted_address;
            setLocation({ ...loc });
          }
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }, []);

  // Start service request
  const startRequest = async () => {
    if (!user || !location) return;
    
    setStage('searching');
    
    // Create service request
    const newRequest = await matchingService.createServiceRequest(
      user.uid,
      {
        id: service.id,
        name: service.name,
        urgency: 'today',
        estimatedDuration: 60
      },
      location,
      {
        preferredRating: 4.5
      }
    );
    
    setRequest(newRequest);
    
    // Subscribe to updates
    const unsubscribe = matchingService.subscribeToRequest(
      newRequest.id,
      (updatedRequest) => {
        setRequest(updatedRequest);
        
        if (updatedRequest.status === 'matched') {
          setStage('matched');
          loadContractorDetails(updatedRequest.matchedContractorId);
        } else if (updatedRequest.status === 'in_progress') {
          setStage('in_progress');
        } else if (updatedRequest.status === 'completed') {
          setStage('completed');
        }
      }
    );
    
    return () => unsubscribe();
  };

  // Load contractor details when matched
  const loadContractorDetails = async (contractorId: string) => {
    // This would fetch from Firestore
    const contractorData = {
      id: contractorId,
      name: 'John Smith',
      photo: '/contractor-photo.jpg',
      rating: 4.8,
      completedJobs: 127,
      vehicle: 'White Ford Transit Van',
      licensePlate: 'ABC 123',
      phone: '555-0123'
    };
    
    setContractor(contractorData);
    setEta(15); // 15 minutes
    setPrice(125); // $125 estimate
  };

  // Searching animation
  useEffect(() => {
    if (stage === 'searching') {
      const interval = setInterval(() => {
        setSearchingAnimation(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const renderLocationStage = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Where do you need service?</h2>
        <p className="text-gray-600">We'll find the nearest available {service.name} contractor</p>
      </div>

      {location && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-purple-600 mt-1" />
            <div className="flex-1">
              <p className="font-medium">Service Location</p>
              <p className="text-sm text-gray-600">{location.address}</p>
            </div>
            <button className="text-purple-600 text-sm hover:underline">
              Change
            </button>
          </div>
        </div>
      )}

      <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
        {location && (
          <MapView className="w-full h-full" />
        )}
      </div>

      <div className="space-y-3">
        <button
          onClick={startRequest}
          disabled={!location}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Find Available Contractors
        </button>
        <button
          onClick={onCancel}
          className="w-full text-gray-600 py-3 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const renderSearchingStage = () => (
    <div className="space-y-6 text-center">
      <div className="relative mx-auto w-32 h-32">
        {/* Ripple animation */}
        <div className="absolute inset-0 rounded-full bg-purple-200 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-purple-300 animate-ping animation-delay-200" />
        <div className="absolute inset-0 rounded-full bg-purple-400 animate-ping animation-delay-400" />
        <div className="relative bg-purple-600 rounded-full w-32 h-32 flex items-center justify-center">
          <User className="w-16 h-16 text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Finding your contractor</h2>
        <p className="text-gray-600">
          {['Searching nearby contractors', 'Checking availability', 'Finding the best match', 'Almost there'][searchingAnimation]}...
        </p>
      </div>

      {request?.matchingMetadata && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Search radius</span>
            <span className="font-medium">{request.matchingMetadata.searchRadius} miles</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Contractors notified</span>
            <span className="font-medium">{request.matchingMetadata.contractorsNotified.length}</span>
          </div>
        </div>
      )}

      <button
        onClick={onCancel}
        className="text-gray-600 hover:text-gray-800"
      >
        Cancel Request
      </button>
    </div>
  );

  const renderMatchedStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Contractor Matched!</h2>
        <p className="text-gray-600">{contractor?.name} is on the way</p>
      </div>

      {/* Contractor Card */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <img
            src={contractor?.photo || '/default-avatar.png'}
            alt={contractor?.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{contractor?.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                {contractor?.rating}
              </span>
              <span>{contractor?.completedJobs} jobs</span>
            </div>
            <div className="mt-2 text-sm">
              <p className="text-gray-600">{contractor?.vehicle}</p>
              <p className="font-medium">{contractor?.licensePlate}</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 bg-white border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </button>
          <button className="flex items-center justify-center space-x-2 bg-white border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            <MessageCircle className="w-4 h-4" />
            <span>Message</span>
          </button>
        </div>
      </div>

      {/* ETA and Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Estimated Arrival</p>
          <p className="text-2xl font-bold">{eta} min</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Estimated Cost</p>
          <p className="text-2xl font-bold">${price}</p>
        </div>
      </div>

      {/* Live Map */}
      <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
        <MapView className="w-full h-full" />
      </div>

      {/* Safety Features */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-1" />
          <div>
            <p className="font-medium text-blue-900">Your safety is our priority</p>
            <p className="text-sm text-blue-700 mt-1">
              All contractors are background checked, licensed, and insured. 
              Share your location with friends and family.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInProgressStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative mx-auto w-20 h-20 mb-4">
          <div className="absolute inset-0 border-4 border-purple-200 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin" 
          />
        </div>
        <h2 className="text-2xl font-bold mb-2">Service in Progress</h2>
        <p className="text-gray-600">{contractor?.name} is working on your {service.name}</p>
      </div>

      {/* Progress Timeline */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div className="flex-1">
            <p className="font-medium">Contractor Arrived</p>
            <p className="text-sm text-gray-600">2:15 PM</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Service in Progress</p>
            <p className="text-sm text-gray-600">Started at 2:20 PM</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 opacity-50">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />
          <div className="flex-1">
            <p className="font-medium">Service Complete</p>
            <p className="text-sm text-gray-600">Estimated 3:20 PM</p>
          </div>
        </div>
      </div>

      {/* Live Updates */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">Live Updates</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-gray-500">2:25 PM</span>
            <span>Diagnosed the issue - clogged drain line</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-gray-500">2:30 PM</span>
            <span>Beginning repair work</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompletedStage = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Service Complete!</h2>
        <p className="text-gray-600">Thank you for choosing HeyLeila</p>
      </div>

      {/* Service Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold">Service Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service</span>
            <span className="font-medium">{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contractor</span>
            <span className="font-medium">{contractor?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium">1 hour 15 minutes</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total Cost</span>
            <span>${price}</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="text-center">
        <p className="font-medium mb-3">How was your experience?</p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button key={rating} className="hover:scale-110 transition-transform">
              <Star className="w-10 h-10 text-gray-300 hover:text-yellow-500 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={onComplete}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700"
        >
          Book Again
        </button>
        <button
          onClick={onComplete}
          className="w-full text-gray-600 py-3 hover:text-gray-800"
        >
          Done
        </button>
      </div>
    </div>
  );

  const renderStage = () => {
    switch (stage) {
      case 'location':
        return renderLocationStage();
      case 'searching':
        return renderSearchingStage();
      case 'matched':
        return renderMatchedStage();
      case 'in_progress':
        return renderInProgressStage();
      case 'completed':
        return renderCompletedStage();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {renderStage()}
    </div>
  );
}