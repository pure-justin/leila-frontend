import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API key not found');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
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
      return NextResponse.json({
        success: true,
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
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          details: data.status,
          message: data.error_message 
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}