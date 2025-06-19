import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create booking in Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([
        {
          customer_first_name: data.firstName,
          customer_last_name: data.lastName,
          customer_email: data.email,
          customer_phone: data.phone,
          service: data.serviceName,
          date: data.preferredDate,
          time: data.preferredTime,
          address: data.address,
          notes: data.notes,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Fallback to demo mode if Supabase not configured
      if (error.message?.includes('Invalid URL') || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return NextResponse.json({
          success: true,
          bookingId: `DEMO-${Date.now()}`,
          message: 'Booking received! (Demo mode - configure Supabase for real bookings)'
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      appointmentId: booking.id,
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