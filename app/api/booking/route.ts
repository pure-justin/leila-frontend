
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // For now, just return success
    // TODO: Add Firebase booking logic
    return NextResponse.json({
      success: true,
      bookingId: 'temp-' + Date.now(),
      message: 'Booking created (placeholder)'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
