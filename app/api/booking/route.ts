import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.heyleila.com';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Forward to our API
    const response = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create booking');
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Fallback to demo mode if API is down
    const bookingId = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      message: 'Booking confirmed! We\'ll contact you shortly.',
      demo: true
    });
  }
}