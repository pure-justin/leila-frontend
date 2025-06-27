import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ContractorLocation {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: number;
}

export interface BookingTracking {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  contractorLocation?: ContractorLocation;
  estimatedArrival?: Date;
  estimatedCompletion?: Date;
  progress?: number;
  lastUpdate: Date;
}

interface UseRealtimeTrackingOptions {
  bookingId: string;
  onStatusChange?: (status: BookingTracking['status']) => void;
  onLocationUpdate?: (location: ContractorLocation) => void;
  updateInterval?: number;
}

export function useRealtimeTracking({
  bookingId,
  onStatusChange,
  onLocationUpdate,
  updateInterval = 5000 // 5 seconds
}: UseRealtimeTrackingOptions) {
  const [tracking, setTracking] = useState<BookingTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const lastLocationRef = useRef<ContractorLocation | null>(null);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Calculate ETA based on distance and average speed
  const calculateETA = useCallback((location: ContractorLocation, destination: { lat: number; lng: number }): Date => {
    const distance = calculateDistance(location.lat, location.lng, destination.lat, destination.lng);
    const avgSpeedKmh = location.speed || 30; // Default 30 km/h in city
    const hoursToArrival = distance / avgSpeedKmh;
    const minutesToArrival = hoursToArrival * 60;
    
    return new Date(Date.now() + minutesToArrival * 60 * 1000);
  }, [calculateDistance]);

  // Subscribe to real-time updates
  const subscribeToTracking = useCallback(() => {
    if (!bookingId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Subscribe to booking document
      const bookingRef = doc(db, 'bookings', bookingId);
      
      unsubscribeRef.current = onSnapshot(
        bookingRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setError('Booking not found');
            setIsLoading(false);
            return;
          }

          const data = snapshot.data();
          const newTracking: BookingTracking = {
            bookingId,
            status: data.status || 'pending',
            contractorLocation: data.contractorLocation,
            estimatedArrival: data.estimatedArrival?.toDate(),
            estimatedCompletion: data.estimatedCompletion?.toDate(),
            progress: data.progress,
            lastUpdate: new Date()
          };

          setTracking(prev => {
            // Check if status changed
            if (prev?.status !== newTracking.status) {
              onStatusChange?.(newTracking.status);
            }

            // Check if location changed significantly
            if (newTracking.contractorLocation && 
                (!lastLocationRef.current || 
                 calculateDistance(
                   lastLocationRef.current.lat,
                   lastLocationRef.current.lng,
                   newTracking.contractorLocation.lat,
                   newTracking.contractorLocation.lng
                 ) > 0.01)) { // More than 10 meters
              lastLocationRef.current = newTracking.contractorLocation;
              onLocationUpdate?.(newTracking.contractorLocation);
            }

            return newTracking;
          });

          setIsConnected(true);
          setIsLoading(false);
        },
        (error) => {
          console.error('Tracking subscription error:', error);
          setError(error.message);
          setIsConnected(false);
          setIsLoading(false);

          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            subscribeToTracking();
          }, 5000);
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to tracking:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect');
      setIsLoading(false);
    }
  }, [bookingId, onStatusChange, onLocationUpdate, calculateDistance]);

  // Setup subscription
  useEffect(() => {
    subscribeToTracking();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [subscribeToTracking]);

  // Simulate location updates for demo
  const simulateMovement = useCallback(() => {
    if (!tracking?.contractorLocation || tracking.status !== 'on_the_way') return;

    const currentLoc = tracking.contractorLocation;
    const destination = { lat: 37.7749, lng: -122.4194 }; // Example destination

    // Move contractor 1% closer to destination
    const newLat = currentLoc.lat + (destination.lat - currentLoc.lat) * 0.01;
    const newLng = currentLoc.lng + (destination.lng - currentLoc.lng) * 0.01;

    const newLocation: ContractorLocation = {
      lat: newLat,
      lng: newLng,
      heading: Math.atan2(destination.lng - newLng, destination.lat - newLat) * 180 / Math.PI,
      speed: 30 + Math.random() * 20, // 30-50 km/h
      accuracy: 5 + Math.random() * 10,
      timestamp: Date.now()
    };

    setTracking(prev => prev ? {
      ...prev,
      contractorLocation: newLocation,
      estimatedArrival: calculateETA(newLocation, destination)
    } : null);

    onLocationUpdate?.(newLocation);
  }, [tracking, calculateETA, onLocationUpdate]);

  // Demo mode: simulate movement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && tracking?.status === 'on_the_way') {
      const interval = setInterval(simulateMovement, updateInterval);
      return () => clearInterval(interval);
    }
  }, [tracking?.status, simulateMovement, updateInterval]);

  return {
    tracking,
    isLoading,
    error,
    isConnected,
    // Utility functions
    getStatusColor: (status: BookingTracking['status']) => {
      const colors = {
        pending: '#FFA500',
        confirmed: '#4CAF50',
        on_the_way: '#2196F3',
        arrived: '#9C27B0',
        in_progress: '#FF9800',
        completed: '#4CAF50',
        cancelled: '#F44336'
      };
      return colors[status] || '#757575';
    },
    getStatusText: (status: BookingTracking['status']) => {
      const texts = {
        pending: 'Pending Confirmation',
        confirmed: 'Booking Confirmed',
        on_the_way: 'Contractor On The Way',
        arrived: 'Contractor Has Arrived',
        in_progress: 'Service In Progress',
        completed: 'Service Completed',
        cancelled: 'Booking Cancelled'
      };
      return texts[status] || 'Unknown Status';
    }
  };
}