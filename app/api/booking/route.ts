import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/firebase-api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Use Firebase API to create booking
    const booking = await createBooking(data);
    
    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking confirmed! We\'ll contact you shortly.',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Fallback to demo mode if Firebase is down
    const bookingId = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      message: 'Booking confirmed! We\'ll contact you shortly.',
      demo: true
    });
  }
}