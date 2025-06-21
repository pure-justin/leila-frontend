'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Users, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, scaleIn } from '@/lib/animations';

interface Home3DMapProps {
  address?: string;
  className?: string;
}

interface ContractorMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  name: string;
  service: string;
  rating: number;
  distance: string;
  responseTime: string;
}

export default function Home3DMap({ address, className = '' }: Home3DMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [nearbyContractors, setNearbyContractors] = useState<ContractorMarker[]>([]);
  const [selectedContractor, setSelectedContractor] = useState<ContractorMarker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map with 3D view
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 17,
      tilt: 60, // Enable 3D tilt
      heading: 0,
      mapTypeId: 'satellite',
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      rotateControl: true,
      scaleControl: false,
      zoomControl: true,
      // Enable new 3D features
      isFractionalZoomEnabled: true,
      mapId: '3d_home_service_map', // Custom map ID for 3D features
      center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
      styles: [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#000000" }, { lightness: 13 }]
        }
      ]
    });

    setMap(mapInstance);

    // If address is provided, geocode it
    if (address) {
      geocodeAddress(mapInstance, address);
    } else {
      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstance.setCenter(pos);
            setUserLocation(pos);
            addUserMarker(mapInstance, pos);
            generateNearbyContractors(pos);
          }
        );
      }
    }

    // Add animation to slowly rotate the map
    let heading = 0;
    const rotateMap = () => {
      heading = (heading + 0.05) % 360; // Slowed down from 0.2 to 0.05
      mapInstance.setHeading(heading);
    };
    const rotationInterval = setInterval(rotateMap, 100);

    return () => {
      clearInterval(rotationInterval);
      mapInstance.unbindAll();
    };
  }, [address]);

  const geocodeAddress = (map: google.maps.Map, address: string) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        const pos = { lat: location.lat(), lng: location.lng() };
        map.setCenter(location);
        setUserLocation(pos);
        addUserMarker(map, pos);
        generateNearbyContractors(pos);
      }
    });
  };

  const addUserMarker = (map: google.maps.Map, position: google.maps.LatLngLiteral) => {
    // Add a custom marker for the user's location
    new google.maps.Marker({
      position,
      map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#7C3AED',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      animation: google.maps.Animation.DROP
    });

    // Add a pulsing circle around the user location
    new google.maps.Circle({
      map,
      center: position,
      radius: 200,
      fillColor: '#7C3AED',
      fillOpacity: 0.1,
      strokeColor: '#7C3AED',
      strokeOpacity: 0.3,
      strokeWeight: 2
    });
  };

  const generateNearbyContractors = (center: google.maps.LatLngLiteral) => {
    // Generate mock contractor locations around the user
    const contractors: ContractorMarker[] = [
      {
        id: '1',
        position: {
          lat: center.lat + (Math.random() - 0.5) * 0.01,
          lng: center.lng + (Math.random() - 0.5) * 0.01
        },
        name: 'Mike\'s Plumbing',
        service: 'Plumbing',
        rating: 4.8,
        distance: '0.8 mi',
        responseTime: '15 min'
      },
      {
        id: '2',
        position: {
          lat: center.lat + (Math.random() - 0.5) * 0.01,
          lng: center.lng + (Math.random() - 0.5) * 0.01
        },
        name: 'Quick Electric Pro',
        service: 'Electrical',
        rating: 4.9,
        distance: '1.2 mi',
        responseTime: '20 min'
      },
      {
        id: '3',
        position: {
          lat: center.lat + (Math.random() - 0.5) * 0.01,
          lng: center.lng + (Math.random() - 0.5) * 0.01
        },
        name: 'Green Lawn Care',
        service: 'Lawn Care',
        rating: 4.7,
        distance: '0.5 mi',
        responseTime: '30 min'
      },
      {
        id: '4',
        position: {
          lat: center.lat + (Math.random() - 0.5) * 0.01,
          lng: center.lng + (Math.random() - 0.5) * 0.01
        },
        name: 'AC Masters',
        service: 'HVAC',
        rating: 4.9,
        distance: '2.1 mi',
        responseTime: '25 min'
      }
    ];

    setNearbyContractors(contractors);

    // Add markers for contractors
    contractors.forEach((contractor, index) => {
      setTimeout(() => {
        if (!map) return;
        
        const marker = new google.maps.Marker({
          position: contractor.position,
          map,
          title: contractor.name,
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#10B981" stroke="white" stroke-width="2"/>
                <text x="20" y="26" font-family="Arial" font-size="20" fill="white" text-anchor="middle">👷</text>
              </svg>
            `)}`,
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          },
          animation: google.maps.Animation.DROP
        });

        marker.addListener('click', () => {
          setSelectedContractor(contractor);
        });
      }, index * 200);
    });
  };

  return (
    <div className={`relative ${className} rounded-2xl overflow-hidden`}>
      <div ref={mapRef} className="absolute inset-0" />
      
      {/* Overlay showing nearby contractors - properly positioned */}
      <motion.div
        className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 max-w-sm border border-purple-100"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-semibold text-base mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Pros Near You
        </h3>
        <div className="space-y-3">
          {nearbyContractors.slice(0, 3).map((contractor) => (
            <motion.div
              key={contractor.id}
              className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50 cursor-pointer transition-colors"
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedContractor(contractor)}
            >
              <div>
                <p className="font-medium text-sm text-gray-900">{contractor.name}</p>
                <p className="text-sm text-gray-600 mt-0.5">{contractor.service}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-medium text-gray-900">{contractor.rating}</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{contractor.distance}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Available now</span>
            <span className="font-semibold text-purple-600">{nearbyContractors.length} pros</span>
          </div>
        </div>
      </motion.div>

      {/* Selected contractor details - better positioned */}
      {selectedContractor && (
        <motion.div
          className="absolute bottom-8 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 border border-purple-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-base text-gray-900">{selectedContractor.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{selectedContractor.service}</p>
            </div>
            <button
              onClick={() => setSelectedContractor(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-500 mr-1.5" />
                <span className="font-medium text-gray-700">{selectedContractor.rating}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 text-gray-400 mr-1.5" />
                <span className="text-gray-700">{selectedContractor.distance}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 text-gray-400 mr-1.5" />
                <span className="text-gray-700">{selectedContractor.responseTime}</span>
              </div>
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg">
              Book Now
            </button>
          </div>
        </motion.div>
      )}

      {/* 3D View indicator - properly positioned */}
      <motion.div
        className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl rounded-xl px-4 py-2 shadow-lg border border-purple-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm font-medium text-gray-700">3D View</p>
      </motion.div>
    </div>
  );
}