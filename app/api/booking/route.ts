import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Simple demo booking - no database needed
    const bookingId = `BOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('New booking received:', {
      bookingId,
      customer: `${data.firstName} ${data.lastName}`,
      service: data.serviceName,
      date: data.preferredDate,
      time: data.preferredTime
    });

    // In a real app, you'd save to a database here
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      message: 'Booking confirmed! We\'ll contact you shortly.'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}