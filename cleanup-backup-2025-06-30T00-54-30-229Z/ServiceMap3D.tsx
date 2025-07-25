'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Zap, Star, Clock, DollarSign, 
  TrendingUp, Users, Sparkles, Flame, Shield, Award,
  Home, TreePine, Droplets, Wrench, Paintbrush, CheckCircle
} from 'lucide-react';
import { fadeIn, fadeInUp, scaleIn, pulseAnimation } from '@/lib/animations';
import { useContractors } from '@/lib/hooks/useContractors';
import ProjectProfile from './ProjectProfile';
import UserProfile from './UserProfile';
import { useCompletedProjects } from '@/lib/hooks/useCompletedProjects';

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
  const [mapMode, setMapMode] = useState<'solar' | '3d' | 'standard'>('standard');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedContractorProfile, setSelectedContractorProfile] = useState<any>(null);
  
  // Get real contractor data from Firestore
  const { contractors: firestoreContractors, loading: contractorsLoading } = useContractors(selectedService, 20);
  
  // Get completed projects near the user
  const { projects: completedProjects } = useCompletedProjects(userAddress, 5000); // 5km radius
  
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapRef.current) return;
      
      // Check if Google Maps is loaded
      if (typeof window === 'undefined' || !window.google || !window.google.maps) {
        console.error('Google Maps not loaded:', {
          windowDefined: typeof window !== 'undefined',
          googleExists: typeof window !== 'undefined' && !!window.google,
          mapsExists: typeof window !== 'undefined' && !!window.google?.maps
        });
        // Don't set error immediately, wait a bit for maps to load
        const timeout = setTimeout(() => {
          if (!window.google || !window.google.maps) {
            console.error('Google Maps still not loaded after 3 seconds');
            setMapError(true);
          }
        }, 3000);
        return () => clearTimeout(timeout);
      }
      
      try {

    // Try to initialize with Solar API first, then fallback gracefully
    let mapConfig: google.maps.MapOptions = {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 17,
      // DISABLE ALL DEFAULT UI CONTROLS
      disableDefaultUI: true,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: false,
      scaleControl: false,
      rotateControl: false,
      // Clean minimal styles
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "transit",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        },
        {
          featureType: "road",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }]
        }
      ]
    };
    
    // Check for Solar API availability
    const checkSolarAPI = async (lat: number, lng: number) => {
      try {
        console.log('Checking for Solar API...');
        if (window.google && window.google.maps && (window.google.maps as any).SolarApi) {
          console.log('Solar API found! Testing...');
          const solarApi = new (window.google.maps as any).SolarApi();
          const response = await solarApi.findClosestBuilding({
            location: { latitude: lat, longitude: lng }
          });
          console.log('Solar API response:', response);
          return response && response.solarPotential;
        } else {
          console.log('Solar API not found in google.maps');
        }
      } catch (error) {
        console.log('Solar API error:', error);
      }
      return false;
    };
    
    // Try Solar Layer first (most epic)
    const hasSolar = await checkSolarAPI(37.7749, -122.4194);
    
    if (hasSolar) {
      console.log('🌞 Solar API available - using EPIC solar view!');
      mapConfig = {
        ...mapConfig,
        mapId: 'solar_epic_map',
        mapTypeId: 'satellite',
        tilt: 60,
        heading: 0,
        // Solar-specific styles
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1a1a2e" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffd700" }]
          }
        ]
      };
    } else if (window.google.maps.ElevationService) {
      // Fallback to 3D with elevation
      console.log('🏔️ Using 3D view with elevation');
      
      // Test if 3D features are available
      const test3DSupport = () => {
        try {
          const testMap = new google.maps.Map(document.createElement('div'), {
            center: { lat: 0, lng: 0 },
            zoom: 1,
            tilt: 45
          });
          return testMap.getTilt && typeof testMap.getTilt === 'function';
        } catch {
          return false;
        }
      };
      
      const supports3D = test3DSupport();
      
      mapConfig = {
        ...mapConfig,
        mapId: 'epic_service_map',
        mapTypeId: supports3D ? 'satellite' : 'roadmap',
        tilt: supports3D ? 60 : 0,
        heading: 0,
        // 3D optimized styles
        styles: [
        {
          featureType: "all",
          elementType: "geometry",
          stylers: [{ color: "#242f3e" }]
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }]
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#7C3AED" }, { lightness: 20 }]
        },
        {
          featureType: "poi.business",
          stylers: [{ visibility: "off" }]
        }
        ],
      };
    } else {
      // Final fallback to standard map
      console.log('🗺️ Using standard Google Maps');
      mapConfig = {
        ...mapConfig,
        mapTypeId: 'roadmap',
        // Clean standard map styles
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#7C3AED" }, { lightness: 40 }]
          }
        ]
      };
    }
    
    // Add common config
    mapConfig = {
      ...mapConfig,
      gestureHandling: 'greedy',
      renderingType: google.maps.RenderingType?.VECTOR || undefined,
    };
    
    const mapInstance = new google.maps.Map(mapRef.current, mapConfig);

    setMap(mapInstance);
    
    // Log which view mode we're using and update state
    if (hasSolar) {
      console.log('✅ Using Solar-enhanced 3D view');
      setMapMode('solar');
    } else if (mapConfig.tilt && mapConfig.tilt > 0) {
      console.log('✅ Using 3D satellite view');
      setMapMode('3d');
    } else {
      console.log('✅ Using standard map view (3D not available)');
      setMapMode('standard');
    }
    
    // Geocode user address or use default
    if (userAddress) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: userAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          mapInstance.setCenter(location);
          
          // Add user marker
          new google.maps.Marker({
            position: location,
            map: mapInstance,
            title: 'Your Location',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#7C3AED',
              fillOpacity: 0.8,
              strokeColor: '#fff',
              strokeWeight: 2
            }
          });
        }
      });
    }
    
    // Initialize features
    setupContractors(mapInstance);
    setupCompletedProjects(mapInstance);
    generateServiceHeatmap(mapInstance);
    startRealTimeUpdates(mapInstance);
    
    // Epic rotating animation with slower speed
    const rotateMap = () => {
      const currentHeading = mapInstance.getHeading() || 0;
      const newHeading = (currentHeading + 0.05) % 360; // Reduced from 0.2 to 0.05
      mapInstance.setHeading(newHeading);
    };
    
    const rotationInterval = setInterval(rotateMap, 50);
    
    // Store cleanup function on map instance
    (mapInstance as any)._rotationCleanup = () => {
      clearInterval(rotationInterval);
    };
    
    // Cleanup function
    return () => {
      if ((mapInstance as any)._rotationCleanup) {
        (mapInstance as any)._rotationCleanup();
      }
      if ((mapInstance as any)._markersCleanup) {
        (mapInstance as any)._markersCleanup();
      }
      if ((mapInstance as any)._realTimeUpdatesCleanup) {
        (mapInstance as any)._realTimeUpdatesCleanup();
      }
    };
    
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    };

    initializeMap();
  }, [userAddress, selectedService]);

  const setupContractors = (map: google.maps.Map) => {
    const center = map.getCenter();
    if (!center) return;

    // Use real contractors from Firestore
    const contractors = firestoreContractors.length > 0 
      ? firestoreContractors.map((contractor, index) => ({
          ...contractor,
          position: {
            lat: center.lat() + (Math.random() - 0.5) * 0.02,
            lng: center.lng() + (Math.random() - 0.5) * 0.02
          },
          eta: 5 + Math.floor(Math.random() * 25),
          isMoving: index < 3,
          specialties: (contractor as any).specialties || contractor.services || getRandomSpecialties(),
          vehicle: (contractor as any).vehicle || getRandomVehicle()
        }))
      : generateMockContractors(center);

    setActiveContractors(contractors);
    
    // Create markers with custom animations
    const markers: google.maps.Marker[] = [];
    
    contractors.forEach((contractor, index) => {
      // Create contractor marker
      const marker = new google.maps.Marker({
        position: contractor.position,
        map,
        title: contractor.name,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${contractor.isMoving ? '#10B981' : '#7C3AED'}" opacity="0.9"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-size="20">${getServiceIcon(contractor.service)}</text>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        },
        zIndex: contractor.isMoving ? 1000 : 100
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-4 min-w-[200px]">
            <h3 class="font-bold text-lg mb-2">${contractor.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${contractor.service}</p>
            <div class="flex items-center mb-2">
              <span class="text-yellow-500">★</span>
              <span class="ml-1 text-sm">${contractor.rating}</span>
              <span class="text-gray-400 text-sm ml-2">(${contractor.reviews} reviews)</span>
            </div>
            <p class="text-sm"><strong>ETA:</strong> ${contractor.eta} min</p>
            <p class="text-sm"><strong>Rate:</strong> $${contractor.hourlyRate}/hr</p>
            ${contractor.isMoving ? '<p class="text-green-600 text-sm mt-2">🚗 En route</p>' : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        if (onContractorSelect) {
          onContractorSelect(contractor);
        }
      });

      markers.push(marker);

      // Animate moving contractors
      if (contractor.isMoving) {
        animateContractorMovement(map, marker, contractor);
      }
    });

    // Store cleanup function on map for later cleanup
    (map as any)._markersCleanup = () => {
      markers.forEach(marker => {
        if ((marker as any)._cleanupAnimation) {
          (marker as any)._cleanupAnimation();
        }
        marker.setMap(null);
      });
    };
  };

  const setupCompletedProjects = (map: google.maps.Map) => {
    const center = map.getCenter();
    if (!center) return;

    // Use real completed projects or generate mock ones
    const projects = completedProjects?.length > 0 ? completedProjects : generateMockProjects(center);
    
    projects.forEach((project: any) => {
      // Create home icon marker for completed project
      const marker = new google.maps.Marker({
        position: project.position || {
          lat: center.lat() + (Math.random() - 0.5) * 0.03,
          lng: center.lng() + (Math.random() - 0.5) * 0.03
        },
        map,
        title: `${project.serviceType} - ${project.contractor.name}`,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(`
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(4, 4)">
                <!-- House shape -->
                <path d="M20 2 L35 15 L35 35 L5 35 L5 15 Z" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2"/>
                <!-- Roof -->
                <path d="M20 2 L38 17 L2 17 Z" fill="#7C3AED" stroke="#6B21A8" stroke-width="2"/>
                <!-- Door -->
                <rect x="15" y="20" width="10" height="15" fill="#9333EA"/>
                <!-- Windows -->
                <rect x="8" y="20" width="5" height="5" fill="#DDD6FE"/>
                <rect x="27" y="20" width="5" height="5" fill="#DDD6FE"/>
                <!-- Checkmark badge -->
                <circle cx="30" cy="10" r="8" fill="#10B981" stroke="white" stroke-width="2"/>
                <path d="M26 10 L28.5 12.5 L34 7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
              </g>
            </svg>
          `)}`,
          scaledSize: new google.maps.Size(48, 48),
          anchor: new google.maps.Point(24, 48)
        },
        zIndex: 500
      });

      // Create info window with project preview
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 min-w-[250px] max-w-[300px]">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-base">${project.serviceType}</h3>
              <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Completed</span>
            </div>
            <div class="text-sm text-gray-600 mb-2">
              <p class="flex items-center mb-1">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ${project.contractor.name}
              </p>
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2 text-xs">
                  <span class="bg-gray-100 px-2 py-1 rounded">User: ${project.userScore || 90}%</span>
                  <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">Leila: ${project.leilaScore || 92}%</span>
                </div>
              </div>
              <p class="text-xs text-gray-500">${project.completionDate || 'Recently completed'}</p>
            </div>
            ${project.photos && project.photos.length > 0 ? `
              <div class="grid grid-cols-3 gap-1 mb-2">
                ${project.photos.slice(0, 3).map((photo: any) => `
                  <img src="${photo.url}" alt="Project photo" class="w-full h-16 object-cover rounded" />
                `).join('')}
              </div>
            ` : ''}
            <div class="flex gap-2">
              <button class="flex-1 bg-purple-600 text-white text-xs py-2 rounded-lg hover:bg-purple-700 transition-colors view-project-btn" data-project-id="${project.id}">
                View Project
              </button>
              <button class="flex-1 bg-indigo-600 text-white text-xs py-2 rounded-lg hover:bg-indigo-700 transition-colors view-contractor-btn" data-contractor-id="${project.contractor.id}">
                View Pro
              </button>
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        
        // Add click handlers for buttons after info window opens
        setTimeout(() => {
          const projectBtn = document.querySelector('.view-project-btn');
          const contractorBtn = document.querySelector('.view-contractor-btn');
          
          if (projectBtn) {
            projectBtn.addEventListener('click', () => {
              setSelectedProject(project);
              infoWindow.close();
            });
          }
          
          if (contractorBtn) {
            contractorBtn.addEventListener('click', () => {
              setContractorProfileData(project.contractor);
              infoWindow.close();
            });
          }
        }, 100);
      });

      // Add subtle pulsing animation to recently completed projects
      if (project.isRecent) {
        const pulseCircle = new google.maps.Circle({
          map,
          center: marker.getPosition()!,
          radius: 50,
          fillColor: '#10B981',
          fillOpacity: 0.2,
          strokeColor: '#10B981',
          strokeOpacity: 0.4,
          strokeWeight: 2
        });

        // Animate the pulse
        let radius = 50;
        let expanding = true;
        const animatePulse = setInterval(() => {
          if (expanding) {
            radius += 1;
            if (radius >= 100) expanding = false;
          } else {
            radius -= 1;
            if (radius <= 50) expanding = true;
          }
          pulseCircle.setRadius(radius);
          pulseCircle.setOptions({
            fillOpacity: 0.2 * (1 - (radius - 50) / 50),
            strokeOpacity: 0.4 * (1 - (radius - 50) / 50)
          });
        }, 50);

        // Store cleanup
        (marker as any)._pulseCleanup = () => {
          clearInterval(animatePulse);
          pulseCircle.setMap(null);
        };
      }
    });
  };

  // Helper function to set contractor profile with mock data
  const setContractorProfileData = (contractor: any) => {
    // Enhance contractor data with algorithm scores and mock job history
    const enhancedContractor = {
      ...contractor,
      email: `${contractor.name.toLowerCase().replace(/[^a-z]/g, '')}@contractor.com`,
      phone: '(555) 123-4567',
      bio: `Professional home service contractor with ${contractor.yearsExperience || 5} years of experience. Committed to quality work and customer satisfaction.`,
      yearsExperience: contractor.yearsExperience || 5,
      certifications: contractor.certifications || ['Licensed & Insured', 'EPA Certified', 'Safety Trained'],
      specialties: contractor.specialties || ['Plumbing', 'General Repairs', 'Emergency Services'],
      responseTime: contractor.responseTime || '30 min',
      verified: true,
      joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      algorithmScore: Math.floor(Math.random() * 20) + 80, // 80-100
      customerApprovalRate: Math.floor(Math.random() * 15) + 85, // 85-100
      onTimeRate: Math.floor(Math.random() * 10) + 90, // 90-100
      qualityScore: Math.floor(Math.random() * 15) + 85, // 85-100
      disputeRate: Math.floor(Math.random() * 5), // 0-5
      blacklisted: false,
      monthlyVolume: Math.floor(Math.random() * 50000) + 10000,
      monthlyRevenue: Math.floor(Math.random() * 40000) + 8000,
      commissionTier: ['Starter', 'Growing', 'Established', 'Professional', 'Enterprise'][Math.floor(Math.random() * 5)],
      userScore: Math.floor(Math.random() * 25) + 75, // 75-100
      leilaScore: Math.floor(Math.random() * 20) + 80 // 80-100
    };

    // Generate mock completed jobs for this contractor
    const mockJobs = Array.from({ length: 8 }, (_, i) => ({
      id: `job-${contractor.id}-${i}`,
      address: `${Math.floor(Math.random() * 999) + 100} ${['Oak', 'Maple', 'Pine', 'Main'][Math.floor(Math.random() * 4)]} St, San Francisco, CA`,
      serviceType: contractor.specialties?.[Math.floor(Math.random() * (contractor.specialties?.length || 1))] || 'Plumbing',
      completionDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      duration: `${Math.floor(Math.random() * 4) + 1} hours`,
      cost: Math.floor(Math.random() * 1500) + 200,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars (legacy)
      userScore: Math.floor(Math.random() * 30) + 70, // 70-100
      leilaScore: Math.floor(Math.random() * 25) + 75, // 75-100
      review: i % 3 === 0 ? `Excellent work! ${contractor.name} was professional, on time, and did a great job. Highly recommend!` : undefined,
      photos: [
        { url: 'https://via.placeholder.com/400x300/9333ea/ffffff?text=Before', type: 'before' },
        { url: 'https://via.placeholder.com/400x300/7c3aed/ffffff?text=After', type: 'after' }
      ],
      aiQualityScore: Math.floor(Math.random() * 15) + 85
    }));

    setSelectedContractorProfile({
      contractor: enhancedContractor,
      completedJobs: mockJobs
    });
  };

  const generateMockProjects = (center: google.maps.LatLng) => {
    const projectTypes = [
      { type: 'Plumbing Repair', icon: '🔧' },
      { type: 'Electrical Work', icon: '⚡' },
      { type: 'HVAC Service', icon: '❄️' },
      { type: 'Kitchen Remodel', icon: '🍳' },
      { type: 'Bathroom Renovation', icon: '🚿' },
      { type: 'Roof Repair', icon: '🏠' },
      { type: 'Painting', icon: '🎨' },
      { type: 'Landscaping', icon: '🌿' }
    ];

    return Array.from({ length: 20 }, (_, i) => {
      const projectType = projectTypes[i % projectTypes.length];
      const daysAgo = Math.floor(Math.random() * 90);
      
      return {
        id: `project-${i}`,
        serviceType: projectType.type,
        position: {
          lat: center.lat() + (Math.random() - 0.5) * 0.04,
          lng: center.lng() + (Math.random() - 0.5) * 0.04
        },
        contractor: {
          id: `contractor-${i}`,
          name: ['John Smith', 'Mike Johnson', 'Sarah Williams', 'Tom Brown'][i % 4],
          rating: (4.5 + Math.random() * 0.5).toFixed(1),
          userScore: Math.floor(Math.random() * 25) + 75, // 75-100
          leilaScore: Math.floor(Math.random() * 20) + 80, // 80-100
          completedJobs: 50 + Math.floor(Math.random() * 200)
        },
        customer: {
          name: ['Alice', 'Bob', 'Charlie', 'Diana'][i % 4] + ' ' + ['Johnson', 'Smith', 'Davis', 'Wilson'][i % 4]
        },
        completionDate: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 5) + 1 + ' days',
        cost: 500 + Math.floor(Math.random() * 4500),
        status: 'completed',
        rating: 4 + Math.random(),
        userScore: Math.floor(Math.random() * 30) + 70, // 70-100
        leilaScore: Math.floor(Math.random() * 25) + 75, // 75-100
        isRecent: daysAgo < 7,
        description: `Professional ${projectType.type.toLowerCase()} service completed with attention to detail.`,
        photos: [
          { id: '1', url: '/api/placeholder/300/200', type: 'before', aiApproved: true },
          { id: '2', url: '/api/placeholder/300/200', type: 'after', aiApproved: true }
        ],
        aiQualityScore: 85 + Math.floor(Math.random() * 15),
        paymentStatus: 'released'
      };
    });
  };

  const generateMockContractors = (center: google.maps.LatLng) => {
    const services = ['Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Lawn Care'];
    const names = ['Mike', 'Sarah', 'John', 'Emily', 'David', 'Lisa', 'Tom', 'Jessica'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `contractor-${i}`,
      name: `${names[i % names.length]} ${['Smith', 'Johnson', 'Williams', 'Brown'][i % 4]}`,
      service: services[i % services.length],
      position: {
        lat: center.lat() + (Math.random() - 0.5) * 0.02,
        lng: center.lng() + (Math.random() - 0.5) * 0.02
      },
      rating: (4 + Math.random()).toFixed(1),
      userScore: Math.floor(Math.random() * 25) + 75, // 75-100
      leilaScore: Math.floor(Math.random() * 20) + 80, // 80-100
      reviews: Math.floor(50 + Math.random() * 200),
      hourlyRate: Math.floor(50 + Math.random() * 100),
      eta: 5 + Math.floor(Math.random() * 25),
      isMoving: i < 3,
      specialties: getRandomSpecialties(),
      vehicle: getRandomVehicle()
    }));
  };

  const animateContractorMovement = (map: google.maps.Map, marker: google.maps.Marker, contractor: any) => {
    // Generate a path for the contractor to follow
    const path = generateRandomPath(contractor.position, 5);
    let currentIndex = 0;
    
    // Store animation state
    let animationId: number | null = null;
    const activeTimeouts: NodeJS.Timeout[] = [];

    const move = () => {
      if (currentIndex >= path.length) {
        currentIndex = 0; // Loop back
      }

      const target = path[currentIndex];
      const current = marker.getPosition();
      if (!current || !target) return;

      const steps = 60;
      let step = 0;

      const animate = () => {
        if (step < steps) {
          const lat = current.lat() + (target.lat - current.lat()) * (step / steps);
          const lng = current.lng() + (target.lng - current.lng()) * (step / steps);
          marker.setPosition({ lat, lng });
          step++;
          animationId = requestAnimationFrame(animate);
        } else {
          currentIndex++;
          const timeoutId = setTimeout(move, 1000); // Pause at each point
          activeTimeouts.push(timeoutId);
        }
      };

      animate();
    };

    move();

    // Store cleanup function on marker for later cleanup
    (marker as any)._cleanupAnimation = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      activeTimeouts.forEach(id => clearTimeout(id));
    };
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
    const intervalId = setInterval(() => {
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

    // Store cleanup function on map instance
    (map as any)._realTimeUpdatesCleanup = () => {
      clearInterval(intervalId);
    };
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
      <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <motion.div
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MapPin className="w-10 h-10 text-purple-600" />
          </motion.div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Interactive Map</h3>
          <p className="text-gray-600 mb-4">Loading your area...</p>
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-purple-600 rounded-full"
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
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      {/* Main 3D Map - properly clipped */}
      <div ref={mapRef} className="absolute inset-0" />

      {/* Minimal UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Stats Bar - minimal glass effect */}
        <motion.div 
          className="absolute top-4 left-4 right-4 flex justify-between items-start gap-3 pointer-events-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Live Activity Feed - minimal and clean */}
          <motion.div 
            className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-gray-800 max-w-[240px] shadow-sm border border-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-xs font-semibold mb-1.5 flex items-center text-gray-600">
              <Zap className="w-3 h-3 mr-1 text-yellow-500" />
              LIVE
            </h3>
            <div className="space-y-1">
              <motion.div 
                className="flex items-center space-x-2 text-xs"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
                <span className="text-gray-600 truncate">New booking - 2m ago</span>
              </motion.div>
            </div>
          </motion.div>

          {/* View Mode Switcher - minimal */}
          <motion.div 
            className="bg-white/60 backdrop-blur-sm rounded-lg p-1 flex space-x-1 shadow-sm border border-white/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === '3d' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              3D
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
                  const focusTimeout = setTimeout(() => {
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

                  // Store cleanup for street view animations
                  (streetView as any)._animationCleanup = () => {
                    clearInterval(animateDrive);
                    clearTimeout(focusTimeout);
                  };
                } else if (map && !streetView) {
                  // Initialize street view if not already created
                  const sv = map.getStreetView();
                  if (sv) {
                    sv.setVisible(true);
                    setStreetView(sv);
                  }
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'street' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setViewMode('heat')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'heat' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Heat
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom Service Cards - minimal and clean */}
        <motion.div 
          className="absolute bottom-4 left-4 right-4 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {activeContractors.slice(0, 3).map((contractor, index) => (
              <motion.div
                key={contractor.id}
                className="bg-white/60 backdrop-blur-sm rounded-lg p-3 min-w-[200px] shadow-sm border border-white/20"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onContractorSelect && onContractorSelect(contractor)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{contractor.name}</h4>
                    <p className="text-xs text-purple-600">{contractor.service}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-xs">
                      <Star className="w-3 h-3 text-yellow-500 mr-0.5" />
                      <span className="text-gray-700">{contractor.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{contractor.eta}m</p>
                  </div>
                </div>
                {contractor.isMoving && (
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1" />
                    En route
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* AR Mode Toggle - minimal floating button */}
        {viewMode === '3d' && (
          <motion.button
            className="absolute bottom-20 right-4 bg-white/60 backdrop-blur-sm rounded-full p-3 shadow-sm border border-white/20 pointer-events-auto"
            onClick={() => setShowARMode(!showARMode)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {showARMode ? '🏙️' : '📱'}
          </motion.button>
        )}

        {/* AR Overlay */}
        {showARMode && (
          <motion.div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <motion.div
                className="text-white text-xl font-bold mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📱 Point your phone at a building
              </motion.div>
              <div className="text-white/80 text-sm">
                See available services in AR
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Project Profile Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectProfile
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      {/* Contractor Profile Modal */}
      <AnimatePresence>
        {selectedContractorProfile && (
          <UserProfile
            contractor={selectedContractorProfile.contractor}
            completedJobs={selectedContractorProfile.completedJobs}
            onClose={() => setSelectedContractorProfile(null)}
            isModal={true}
          />
        )}
      </AnimatePresence>
    </div>
  );
}