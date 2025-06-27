'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { ContractorLocation } from '@/hooks/useRealtimeTracking';

interface LiveMapProps {
  contractorLocation?: ContractorLocation;
  customerLocation: { lat: number; lng: number };
  height?: string;
  className?: string;
}

export function LiveMap({ 
  contractorLocation, 
  customerLocation,
  height = '400px',
  className = ''
}: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const contractorMarkerRef = useRef<google.maps.Marker | null>(null);
  const customerMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const google = await loader.load();

        // Create map
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: customerLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add customer marker
        customerMarkerRef.current = new google.maps.Marker({
          position: customerLocation,
          map: googleMapRef.current,
          title: 'Your Location',
          icon: {
            url: '/images/icons/home-marker.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          }
        });

        // Initialize directions renderer
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          map: googleMapRef.current,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#7C3AED',
            strokeWeight: 4,
            strokeOpacity: 0.8
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [customerLocation]);

  // Update contractor location
  useEffect(() => {
    if (!googleMapRef.current || !contractorLocation) return;

    const updateContractorPosition = async () => {
      const google = window.google;
      if (!google) return;

      // Create or update contractor marker
      if (!contractorMarkerRef.current) {
        contractorMarkerRef.current = new google.maps.Marker({
          map: googleMapRef.current,
          title: 'Contractor',
          icon: {
            url: '/images/icons/contractor-vehicle.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
            rotation: contractorLocation.heading || 0
          }
        });
      }

      // Smooth animation to new position
      const currentPos = contractorMarkerRef.current.getPosition();
      const newPos = new google.maps.LatLng(contractorLocation.lat, contractorLocation.lng);

      if (currentPos) {
        // Animate movement
        animateMarker(contractorMarkerRef.current, currentPos, newPos, 1000);
      } else {
        contractorMarkerRef.current.setPosition(newPos);
      }

      // Update route
      if (directionsRendererRef.current) {
        const directionsService = new google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin: newPos,
            destination: customerLocation,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
            provideRouteAlternatives: false
          },
          (result, status) => {
            if (status === 'OK' && result) {
              directionsRendererRef.current!.setDirections(result);
              
              // Fit bounds to show both markers
              const bounds = new google.maps.LatLngBounds();
              bounds.extend(newPos);
              bounds.extend(customerLocation);
              googleMapRef.current!.fitBounds(bounds, { padding: 50 });
            }
          }
        );
      }
    };

    updateContractorPosition();
  }, [contractorLocation, customerLocation]);

  // Animate marker movement
  const animateMarker = (
    marker: google.maps.Marker,
    start: google.maps.LatLng,
    end: google.maps.LatLng,
    duration: number
  ) => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const lat = start.lat() + (end.lat() - start.lat()) * progress;
      const lng = start.lng() + (end.lng() - start.lng()) * progress;
      
      marker.setPosition(new google.maps.LatLng(lat, lng));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <p className="text-red-600 mb-2">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary-600 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full rounded-lg" style={{ height }} />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
          <span>Your Location</span>
        </div>
        {contractorLocation && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span>Contractor</span>
          </div>
        )}
      </div>
    </div>
  );
}