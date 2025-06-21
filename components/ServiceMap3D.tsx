'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Zap, Star, Clock, DollarSign, 
  TrendingUp, Users, Sparkles, Flame, Shield, Award,
  Home, TreePine, Droplets, Wrench, Paintbrush
} from 'lucide-react';
import { fadeIn, fadeInUp, scaleIn, pulseAnimation } from '@/lib/animations';

interface ServiceMap3DProps {
  userAddress?: string;
  selectedService?: string;
  onContractorSelect?: (contractor: any) => void;
}

interface ServiceHotspot {
  position: google.maps.LatLngLiteral;
  intensity: number;
  service: string;
  demand: 'high' | 'medium' | 'low';
}

export default function ServiceMap3D({ userAddress, selectedService, onContractorSelect }: ServiceMap3DProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [streetView, setStreetView] = useState<google.maps.StreetViewPanorama | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'street' | 'heat'>('3d');
  const [activeContractors, setActiveContractors] = useState<any[]>([]);
  const [serviceHotspots, setServiceHotspots] = useState<ServiceHotspot[]>([]);
  const [showARMode, setShowARMode] = useState(false);
  const [mapError, setMapError] = useState(false);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Check if Google Maps is loaded
    if (typeof window === 'undefined' || !window.google || !window.google.maps) {
      console.warn('Google Maps not loaded yet');
      // Don't set error immediately, wait a bit for maps to load
      const timeout = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          setMapError(true);
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
    
    try {

    // Initialize EPIC 3D map
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 16,
      tilt: 60,
      heading: 0,
      mapTypeId: 'satellite',
      mapId: 'epic_service_map',
      
      // Sick custom styles
      styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#242f3e" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#242f3e" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#746855" }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#7C3AED" }, { lightness: 20 }]
        },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        }
      ],
      
      // Enable all the cool features
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      
      // Gesture handling for smooth UX
      gestureHandling: 'greedy',
      
      // Enable WebGL for performance
      renderingType: google.maps.RenderingType.VECTOR,
    });

    setMap(mapInstance);

    // Initialize Street View with epic settings
    const streetViewInstance = new google.maps.StreetViewPanorama(
      mapRef.current,
      {
        position: mapInstance.getCenter(),
        pov: { heading: 34, pitch: 10 },
        visible: false,
        enableCloseButton: true,
        fullscreenControl: true,
        linksControl: true,
        panControl: true,
        zoomControl: true,
        imageDateControl: true,
        motionTracking: true,
        motionTrackingControl: true
      }
    );
    
    mapInstance.setStreetView(streetViewInstance);
    setStreetView(streetViewInstance);
    
    // Hide street view by default
    streetViewInstance.setVisible(false);
    
    // Listen for street view close
    streetViewInstance.addListener('visible_changed', () => {
      if (!streetViewInstance.getVisible()) {
        setViewMode('3d');
      }
    });

    // Add sick animations
    animateMap(mapInstance);
    
    // Generate dynamic data
    generateLiveContractors(mapInstance);
    generateServiceHeatmap(mapInstance);
    
    // Add real-time updates
    startRealTimeUpdates(mapInstance);

    return () => {
      if (mapInstance && mapInstance.unbindAll) {
        mapInstance.unbindAll();
      }
    };
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(true);
    }
  }, []);

  const animateMap = (map: google.maps.Map) => {
    let heading = 0;
    let tilt = 60;
    
    const animate = () => {
      heading = (heading + 0.5) % 360;
      tilt = 60 + Math.sin(Date.now() * 0.001) * 10;
      
      map.moveCamera({
        heading,
        tilt,
        zoom: map.getZoom()
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
  };

  const generateLiveContractors = (map: google.maps.Map) => {
    const center = map.getCenter();
    if (!center) return;

    const contractors = [];
    const services = ['Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Lawn Care'];
    
    for (let i = 0; i < 20; i++) {
      const contractor = {
        id: `contractor-${i}`,
        name: `Pro ${i + 1}`,
        service: services[Math.floor(Math.random() * services.length)],
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        price: Math.floor(50 + Math.random() * 200),
        eta: Math.floor(5 + Math.random() * 25),
        position: {
          lat: center.lat() + (Math.random() - 0.5) * 0.02,
          lng: center.lng() + (Math.random() - 0.5) * 0.02
        },
        isMoving: Math.random() > 0.5,
        speed: 20 + Math.random() * 40, // mph
        jobsCompleted: Math.floor(100 + Math.random() * 400),
        responseRate: Math.floor(85 + Math.random() * 15),
        specialties: getRandomSpecialties(),
        vehicle: getRandomVehicle()
      };
      
      contractors.push(contractor);
      createAdvancedMarker(map, contractor);
    }
    
    setActiveContractors(contractors);
  };

  const createAdvancedMarker = (map: google.maps.Map, contractor: any) => {
    // Create custom 3D marker
    const markerDiv = document.createElement('div');
    markerDiv.className = 'contractor-marker-3d';
    markerDiv.innerHTML = `
      <div class="marker-container">
        <div class="pulse-ring"></div>
        <div class="marker-icon">
          ${getServiceIcon(contractor.service)}
        </div>
        <div class="marker-info">
          <div class="rating">⭐ ${contractor.rating}</div>
          <div class="eta">${contractor.eta}min</div>
        </div>
      </div>
    `;

    // Use regular marker if AdvancedMarkerElement is not available
    if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
      const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: contractor.position,
        content: markerDiv,
        title: contractor.name
      });
      
      // Animate moving contractors
      if (contractor.isMoving) {
        animateContractorMovement(advancedMarker, contractor);
      }
    } else {
      // Fallback to regular marker
      const marker = new google.maps.Marker({
        map,
        position: contractor.position,
        title: contractor.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#7C3AED" stroke="white" stroke-width="2"/>
              <text x="20" y="26" font-family="Arial" font-size="20" fill="white" text-anchor="middle">${getServiceIcon(contractor.service)}</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40)
        }
      });
      
      marker.addListener('click', () => {
        showContractorDetails(contractor);
        if (onContractorSelect) {
          onContractorSelect(contractor);
        }
      });
    }

    // Add hover effects
    markerDiv.addEventListener('mouseenter', () => {
      markerDiv.classList.add('hover');
      showContractorPreview(contractor);
    });

    markerDiv.addEventListener('click', () => {
      showContractorDetails(contractor);
      if (onContractorSelect) {
        onContractorSelect(contractor);
      }
    });

  };

  const animateContractorMovement = (marker: any, contractor: any) => {
    const destinations = generateRandomPath(contractor.position, 5);
    let currentIndex = 0;

    const move = () => {
      if (currentIndex >= destinations.length) {
        currentIndex = 0;
      }

      const start = marker.position;
      const end = destinations[currentIndex];
      const duration = 3000; // 3 seconds per segment
      const startTime = Date.now();

      const animate = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const lat = start.lat + (end.lat - start.lat) * progress;
        const lng = start.lng + (end.lng - start.lng) * progress;

        marker.position = { lat, lng };

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          currentIndex++;
          setTimeout(move, 1000); // Pause at each point
        }
      };

      animate();
    };

    move();
  };

  const generateServiceHeatmap = (map: google.maps.Map) => {
    const center = map.getCenter();
    if (!center) return;

    // Generate hotspots for service demand
    const hotspots: ServiceHotspot[] = [];
    
    for (let i = 0; i < 15; i++) {
      hotspots.push({
        position: {
          lat: center.lat() + (Math.random() - 0.5) * 0.03,
          lng: center.lng() + (Math.random() - 0.5) * 0.03
        },
        intensity: Math.random(),
        service: ['Plumbing', 'Electrical', 'HVAC'][Math.floor(Math.random() * 3)],
        demand: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
      });
    }

    setServiceHotspots(hotspots);

    // Create visual heatmap overlay
    const heatmapData = hotspots.map(spot => ({
      location: new google.maps.LatLng(spot.position.lat, spot.position.lng),
      weight: spot.intensity * 10
    }));

    // Only create heatmap if visualization library is loaded
    if (google.maps.visualization && google.maps.visualization.HeatmapLayer) {
      new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: viewMode === 'heat' ? map : null,
        radius: 50,
        opacity: 0.6,
        gradient: [
          'rgba(124, 58, 237, 0)',
          'rgba(124, 58, 237, 0.5)',
          'rgba(99, 102, 241, 0.7)',
          'rgba(239, 68, 68, 0.9)',
          'rgba(239, 68, 68, 1)'
        ]
      });
    }
  };

  const startRealTimeUpdates = (map: google.maps.Map) => {
    // Simulate real-time contractor updates
    setInterval(() => {
      // Update contractor positions
      activeContractors.forEach(contractor => {
        if (contractor.isMoving) {
          contractor.eta = Math.max(1, contractor.eta - 1);
        }
      });

      // Add new service requests
      if (Math.random() > 0.7) {
        addNewServiceRequest(map);
      }
    }, 5000);
  };

  const addNewServiceRequest = (map: google.maps.Map) => {
    const center = map.getCenter();
    if (!center) return;

    const request = {
      position: {
        lat: center.lat() + (Math.random() - 0.5) * 0.02,
        lng: center.lng() + (Math.random() - 0.5) * 0.02
      },
      service: ['Plumbing', 'Electrical', 'HVAC'][Math.floor(Math.random() * 3)],
      urgency: Math.random() > 0.5 ? 'urgent' : 'normal',
      price: 100 + Math.floor(Math.random() * 200)
    };

    // Create animated beacon for new request
    const beacon = new google.maps.Circle({
      map,
      center: request.position,
      radius: 100,
      fillColor: request.urgency === 'urgent' ? '#EF4444' : '#7C3AED',
      fillOpacity: 0.3,
      strokeColor: request.urgency === 'urgent' ? '#EF4444' : '#7C3AED',
      strokeOpacity: 0.8,
      strokeWeight: 2
    });

    // Animate the beacon
    let radius = 100;
    const animate = () => {
      radius += 5;
      beacon.setRadius(radius);
      beacon.setOptions({
        fillOpacity: Math.max(0, 0.3 - (radius - 100) / 1000),
        strokeOpacity: Math.max(0, 0.8 - (radius - 100) / 500)
      });

      if (radius < 600) {
        requestAnimationFrame(animate);
      } else {
        beacon.setMap(null);
      }
    };
    
    animate();
  };

  const showContractorPreview = (contractor: any) => {
    // Show quick preview on hover
  };

  const showContractorDetails = (contractor: any) => {
    // Show detailed contractor info
  };

  const getServiceIcon = (service: string) => {
    const icons: { [key: string]: string } = {
      'Plumbing': '🔧',
      'Electrical': '⚡',
      'HVAC': '❄️',
      'Cleaning': '🧹',
      'Lawn Care': '🌿'
    };
    return icons[service] || '🏠';
  };

  const getRandomSpecialties = () => {
    const all = ['Emergency', 'Commercial', 'Residential', 'Green', 'Premium'];
    return all.filter(() => Math.random() > 0.5);
  };

  const getRandomVehicle = () => {
    const vehicles = ['Van', 'Truck', 'Sedan', 'Electric Van', 'Motorcycle'];
    return vehicles[Math.floor(Math.random() * vehicles.length)];
  };

  const generateRandomPath = (start: google.maps.LatLngLiteral, points: number) => {
    const path = [];
    let current = start;
    
    for (let i = 0; i < points; i++) {
      current = {
        lat: current.lat + (Math.random() - 0.5) * 0.005,
        lng: current.lng + (Math.random() - 0.5) * 0.005
      };
      path.push(current);
    }
    
    return path;
  };

  // Show fallback UI if map fails to load
  if (mapError) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <motion.div
            className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MapPin className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Interactive Map</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Loading your area...</p>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      {/* Main 3D Map */}
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />

      {/* Epic UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Stats Bar */}
        <motion.div 
          className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Live Activity Feed */}
          <motion.div 
            className="bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-4 text-gray-900 dark:text-white max-w-sm shadow-lg border border-purple-100 dark:border-purple-900/50"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-sm font-bold mb-2 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" />
              LIVE ACTIVITY
            </h3>
            <div className="space-y-2 text-xs">
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>John booked Plumbing - 2 min ago</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Mike completed HVAC repair - 5 min ago</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Sarah requested Emergency Electric - Just now</span>
              </motion.div>
            </div>
          </motion.div>

          {/* View Mode Switcher */}
          <motion.div 
            className="bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl p-2 flex space-x-2 shadow-lg border border-purple-100 dark:border-purple-900/50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === '3d' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              3D View {viewMode === '3d' ? '🌆' : '🏙️'}
            </button>
            <button
              onClick={() => {
                setViewMode('street');
                if (map && streetView && activeContractors.length > 0) {
                  // Show street view
                  streetView.setVisible(true);
                  
                  // Animate to the nearest contractor's location
                  const contractor = activeContractors[0];
                  streetView.setPosition(contractor.position);
                  
                  // Epic driving animation - pull up like a G!
                  let heading = 0;
                  let pitch = 10;
                  const animateDrive = setInterval(() => {
                    heading = (heading + 1) % 360;
                    pitch = 10 + Math.sin(Date.now() * 0.001) * 5; // Slight up/down motion
                    
                    streetView.setPov({
                      heading: heading,
                      pitch: pitch
                    });
                    
                    // Move forward slightly to simulate driving
                    const currentPos = streetView.getPosition();
                    if (currentPos) {
                      const moveDistance = 0.00002;
                      const newLat = currentPos.lat() + Math.sin(heading * Math.PI / 180) * moveDistance;
                      const newLng = currentPos.lng() + Math.cos(heading * Math.PI / 180) * moveDistance;
                      streetView.setPosition({ lat: newLat, lng: newLng });
                    }
                  }, 50);
                  
                  // Stop after 5 seconds and focus on contractor
                  setTimeout(() => {
                    clearInterval(animateDrive);
                    // Point camera at contractor location
                    if (contractor.position) {
                      const contractorHeading = google.maps.geometry.spherical.computeHeading(
                        streetView.getPosition()!,
                        new google.maps.LatLng(contractor.position.lat, contractor.position.lng)
                      );
                      streetView.setPov({
                        heading: contractorHeading,
                        pitch: 0
                      });
                    }
                  }, 5000);
                } else if (map && !streetView) {
                  // Initialize street view if not already created
                  const sv = map.getStreetView();
                  if (sv) {
                    sv.setVisible(true);
                    setStreetView(sv);
                  }
                }
              }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'street' 
                  ? 'bg-purple-600 text-white animate-pulse' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Street View {viewMode === 'street' ? '🚗' : '🛣️'}
            </button>
            <button
              onClick={() => setViewMode('heat')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'heat' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Heat Map {viewMode === 'heat' ? '🔥' : '📊'}
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom Service Cards */}
        <motion.div 
          className="absolute bottom-4 left-4 right-4 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {activeContractors.slice(0, 5).map((contractor, index) => (
              <motion.div
                key={contractor.id}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 min-w-[280px] shadow-2xl border border-purple-200"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{contractor.name}</h4>
                    <p className="text-sm text-purple-600">{contractor.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-semibold">{contractor.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{contractor.jobsCompleted} jobs</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="font-medium">{contractor.eta}min</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="font-medium">${contractor.price}/hr</span>
                    </div>
                  </div>
                  <motion.button
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Book Now
                  </motion.button>
                </div>

                {contractor.isMoving && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <Navigation className="w-3 h-3 mr-1 animate-pulse" />
                    <span>En route • {contractor.speed} mph</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AR Mode Toggle */}
        <motion.button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-purple-600 text-white p-4 rounded-full shadow-2xl pointer-events-auto"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowARMode(!showARMode)}
        >
          <Sparkles className="w-6 h-6" />
        </motion.button>

        {/* Service Demand Indicators */}
        {viewMode === 'heat' && (
          <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-xl rounded-2xl p-4 text-white pointer-events-auto">
            <h3 className="text-sm font-bold mb-3">Service Demand</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Plumbing</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <Flame className="w-4 h-4 ml-2 text-red-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Electrical</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-yellow-500"
                      initial={{ width: 0 }}
                      animate={{ width: '65%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                  <TrendingUp className="w-4 h-4 ml-2 text-yellow-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">HVAC</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                  <span className="text-xs ml-2">Normal</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .contractor-marker-3d {
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .marker-container {
          position: relative;
          width: 60px;
          height: 60px;
        }
        
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.3);
          animation: pulse 2s infinite;
        }
        
        .marker-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #7C3AED, #6366F1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }
        
        .marker-info {
          position: absolute;
          bottom: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          white-space: nowrap;
        }
        
        .contractor-marker-3d.hover .marker-icon {
          transform: translate(-50%, -50%) scale(1.2);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6);
        }
        
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}