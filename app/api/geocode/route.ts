
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  
  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter required' },
      { status: 400 }
    );
  }
  
  // Placeholder response
  return NextResponse.json({
    results: [{
      formatted_address: address,
      geometry: {
        location: { lat: 30.2672, lng: -97.7431 } // Austin, TX
      }
    }]
  });
}
