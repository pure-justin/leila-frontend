import { NextRequest, NextResponse } from 'next/server';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { clientConfig } from '@/lib/config/secure-config';

export const POST = secureApiHandler(async (request) => {
  const body = await request.json();
  const { lat, lng } = body;

  if (!lat || !lng) {
    return ApiResponse.error('Latitude and longitude are required', 400);
  }

  const apiKey = clientConfig.google.mapsApiKey;
  
  if (!apiKey) {
    console.error('Google Maps API key not found');
    return ApiResponse.error('API configuration error', 500);
  }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    console.log('Geocoding request for:', lat, lng);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Geocoding response status:', data.status);
    if (data.error_message) {
      console.error('Geocoding error message:', data.error_message);
    }

    if (data.status === 'OK' && data.results && data.results[0]) {
      return ApiResponse.success({
        address: data.results[0].formatted_address,
        components: data.results[0].address_components
      });
    } else {
      console.error('Geocoding API error:', {
        status: data.status,
        error_message: data.error_message,
        results_count: data.results?.length || 0
      });
      
      // Provide more specific error messages
      let errorMessage = 'Unable to geocode location';
      if (data.status === 'REQUEST_DENIED') {
        errorMessage = 'Geocoding API access denied. Please check API key configuration.';
      } else if (data.status === 'ZERO_RESULTS') {
        errorMessage = 'No address found for this location.';
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        errorMessage = 'API quota exceeded. Please try again later.';
      }
      
      return ApiResponse.error(errorMessage, 400, {
        details: data.status,
        message: data.error_message
      });
    }
}, {
  allowedMethods: ['POST'],
  requireAuth: false,
  rateLimit: 100 // 100 geocoding requests per minute
});