import { NextRequest, NextResponse } from 'next/server';
import { services } from '@/lib/services';

// This is a simplified chatbot implementation
// In production, you'd want to use OpenAI or another LLM service
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const lowerMessage = message.toLowerCase();

    let response = '';

    // Service information queries
    if (lowerMessage.includes('service') || lowerMessage.includes('offer')) {
      const serviceList = services.map(s => `• ${s.name}: ${s.description} (${s.priceRange})`).join('\n');
      response = `We offer the following home services:\n\n${serviceList}\n\nWhich service are you interested in?`;
    }
    // Booking queries
    else if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
      response = 'I can help you book a service! Please click on any service card above to start the booking process. You\'ll need to provide your contact information and preferred appointment time.';
    }
    // Price queries
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      const priceInfo = services.map(s => `• ${s.name}: ${s.priceRange}`).join('\n');
      response = `Here are our typical price ranges:\n\n${priceInfo}\n\nFinal prices depend on the specific work required. We\'ll provide a detailed quote after assessing your needs.`;
    }
    // Availability queries
    else if (lowerMessage.includes('available') || lowerMessage.includes('when') || lowerMessage.includes('time')) {
      response = 'We typically have availability within 24-48 hours for most services. Emergency services may be available sooner. When you book through our form, you can select your preferred date and time, and we\'ll confirm availability.';
    }
    // Contact queries
    else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      response = 'You can reach us through this chat, or by filling out the booking form above. Once you submit a booking request, our team will contact you within 2 hours during business hours to confirm your appointment.';
    }
    // Emergency queries
    else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      response = 'For emergency services, please select your needed service and note "EMERGENCY" in the additional notes field. We prioritize emergency requests and will dispatch a technician as soon as possible.';
    }
    // Status queries
    else if (lowerMessage.includes('status') || lowerMessage.includes('appointment') || lowerMessage.includes('booking')) {
      response = 'To check your appointment status, please provide your booking reference number or the email address you used for booking. Our team can then look up your appointment details.';
    }
    // Default response
    else {
      response = `I'm here to help you with:\n• Information about our services\n• Booking appointments\n• Pricing details\n• Availability\n• Emergency services\n\nWhat would you like to know about?`;
    }

    // In production, you would:
    // 1. Use OpenAI API to generate more intelligent responses
    // 2. Query CRM for customer data if they provide identifying info
    // 3. Create leads/opportunities in CRM based on chat interactions
    // 4. Handle appointment lookups and modifications

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}