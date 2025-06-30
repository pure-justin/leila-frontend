'use client';

import { useEffect, useRef, useState } from 'react';
import { Ruler, Home, TreePine, Layers, Calculator, Camera, MapPin, Info } from 'lucide-react';
import { propertyDataService, PropertyParcel, PropertyData } from '@/lib/property-data-service';

interface PropertyMap3DProps {
  address: string;
  onMeasurement?: (measurements: PropertyMeasurements) => void;
  onPropertyData?: (data: PropertyData) => void;
}

interface PropertyMeasurements {
  roofArea?: number;
  yardArea?: number;
  drivewayArea?: number;
  buildingFootprint?: number;
  estimatedHeight?: number;
  propertyBoundaries?: google.maps.LatLngLiteral[];
}

export default function PropertyMap3D({ address, onMeasurement }: PropertyMap3DProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [measurements, setMeasurements] = useState<PropertyMeasurements>({});
  const [measureMode, setMeasureMode] = useState<'roof' | 'yard' | 'driveway' | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [activePolygon, setActivePolygon] = useState<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize map with 3D buildings and satellite view
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 20,
      tilt: 45, // Enable 3D view
      mapTypeId: 'satellite',
      mapTypeControl: true,
      mapTypeControlOptions: {
        mapTypeIds: ['satellite', 'hybrid'],
        position: google.maps.ControlPosition.TOP_RIGHT
      },
      fullscreenControl: true,
      streetViewControl: true,
      rotateControl: true,
      scaleControl: true,
      zoomControl: true
    });

    // Enable WebGL for 3D rendering
    mapInstance.setOptions({
      mapId: 'YOUR_MAP_ID', // You'll need to create a Map ID in Google Cloud Console
      disableDefaultUI: false
    });

    setMap(mapInstance);

    // Geocode the address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        mapInstance.setCenter(location);
        
        // Add a marker at the property
        new google.maps.Marker({
          position: location,
          map: mapInstance,
          title: address,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#7C3AED',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        // Try to get property boundaries (if available)
        fetchPropertyBoundaries(location.lat(), location.lng());
      }
    });

    // Initialize Drawing Manager
    const manager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        fillColor: '#7C3AED',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#7C3AED',
        editable: true,
        draggable: true
      }
    });
    manager.setMap(mapInstance);
    setDrawingManager(manager);

    // Handle polygon complete
    google.maps.event.addListener(manager, 'polygoncomplete', (polygon: google.maps.Polygon) => {
      calculateArea(polygon);
      setActivePolygon(polygon);
      manager.setDrawingMode(null);
    });

    return () => {
      mapInstance.unbindAll();
    };
  }, [address]);

  const fetchPropertyBoundaries = async (lat: number, lng: number) => {
    // In a real implementation, you would fetch property boundaries from a service
    // like county records or a property data API
    console.log('Fetching property boundaries for:', lat, lng);
  };

  const calculateArea = (polygon: google.maps.Polygon) => {
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    const squareFeet = area * 10.764; // Convert square meters to square feet
    
    const newMeasurements = { ...measurements };
    
    switch (measureMode) {
      case 'roof':
        newMeasurements.roofArea = Math.round(squareFeet);
        break;
      case 'yard':
        newMeasurements.yardArea = Math.round(squareFeet);
        break;
      case 'driveway':
        newMeasurements.drivewayArea = Math.round(squareFeet);
        break;
    }
    
    setMeasurements(newMeasurements);
    onMeasurement?.(newMeasurements);
  };

  const startMeasuring = (mode: 'roof' | 'yard' | 'driveway') => {
    if (activePolygon) {
      activePolygon.setMap(null);
      setActivePolygon(null);
    }
    
    setMeasureMode(mode);
    if (drawingManager) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const clearMeasurements = () => {
    if (activePolygon) {
      activePolygon.setMap(null);
      setActivePolygon(null);
    }
    setMeasurements({});
    setMeasureMode(null);
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  };

  const generateQuote = () => {
    const quotes = [];
    
    if (measurements.roofArea) {
      // Average roofing cost: $3-5 per sq ft
      const roofingCost = measurements.roofArea * 4;
      quotes.push({
        service: 'Roofing',
        area: measurements.roofArea,
        priceRange: `$${(roofingCost * 0.8).toLocaleString()} - $${(roofingCost * 1.2).toLocaleString()}`
      });
    }
    
    if (measurements.yardArea) {
      // Lawn care: $0.05-0.10 per sq ft
      const lawnCost = measurements.yardArea * 0.075;
      quotes.push({
        service: 'Lawn Care (Monthly)',
        area: measurements.yardArea,
        priceRange: `$${(lawnCost * 0.8).toFixed(2)} - $${(lawnCost * 1.2).toFixed(2)}`
      });
      
      // Landscaping: $5-10 per sq ft
      const landscapingCost = measurements.yardArea * 7.5;
      quotes.push({
        service: 'Landscaping',
        area: measurements.yardArea,
        priceRange: `$${(landscapingCost * 0.8).toLocaleString()} - $${(landscapingCost * 1.2).toLocaleString()}`
      });
    }
    
    if (measurements.drivewayArea) {
      // Driveway sealing: $0.20-0.40 per sq ft
      const sealingCost = measurements.drivewayArea * 0.30;
      quotes.push({
        service: 'Driveway Sealing',
        area: measurements.drivewayArea,
        priceRange: `$${(sealingCost * 0.8).toFixed(2)} - $${(sealingCost * 1.2).toFixed(2)}`
      });
    }
    
    return quotes;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Map Container */}
      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full min-h-[500px]" />
        
        {/* Measurement Controls */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-lg mb-3">Property Measurements</h3>
          
          <div className="space-y-2 mb-4">
            <button
              onClick={() => startMeasuring('roof')}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                measureMode === 'roof' 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Home className="w-5 h-5 mr-2" />
                <span>Measure Roof</span>
              </div>
              {measurements.roofArea && (
                <span className="text-sm font-medium">{measurements.roofArea.toLocaleString()} sq ft</span>
              )}
            </button>
            
            <button
              onClick={() => startMeasuring('yard')}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                measureMode === 'yard' 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <TreePine className="w-5 h-5 mr-2" />
                <span>Measure Yard</span>
              </div>
              {measurements.yardArea && (
                <span className="text-sm font-medium">{measurements.yardArea.toLocaleString()} sq ft</span>
              )}
            </button>
            
            <button
              onClick={() => startMeasuring('driveway')}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
                measureMode === 'driveway' 
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-500' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <Layers className="w-5 h-5 mr-2" />
                <span>Measure Driveway</span>
              </div>
              {measurements.drivewayArea && (
                <span className="text-sm font-medium">{measurements.drivewayArea.toLocaleString()} sq ft</span>
              )}
            </button>
          </div>
          
          {measureMode && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">
                Click on the map to draw around the {measureMode} area. 
                Double-click to complete the shape.
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={clearMeasurements}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                const quotes = generateQuote();
                console.log('Generated quotes:', quotes);
              }}
              disabled={Object.keys(measurements).length === 0}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4 inline mr-1" />
              Get Quote
            </button>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 max-w-sm">
          <h4 className="font-medium text-sm mb-2">3D View Controls</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Hold Ctrl/Cmd + drag to rotate view</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Right-click + drag to tilt view</li>
          </ul>
        </div>
        
        {/* Quote Display */}
        {Object.keys(measurements).length > 0 && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <h4 className="font-semibold mb-3">Estimated Quotes</h4>
            <div className="space-y-3">
              {generateQuote().map((quote, index) => (
                <div key={index} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{quote.service}</p>
                      <p className="text-xs text-gray-500">{quote.area.toLocaleString()} sq ft</p>
                    </div>
                    <p className="text-sm font-semibold text-purple-600">{quote.priceRange}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              *Estimates based on average market rates. Actual prices may vary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}