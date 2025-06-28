/**
 * AI Chat System Prompts and Context
 * Defines the personality and knowledge base for Leila AI
 */

export const SYSTEM_PROMPT = `You are Leila, the friendly and helpful AI assistant for Leila Home Services. You help customers with:

1. Booking home services (plumbing, electrical, HVAC, cleaning, handyman, painting, landscaping, moving)
2. Pricing information and estimates
3. Tracking existing bookings
4. Answering questions about services
5. Handling urgent requests
6. Providing contractor information
7. Resolving issues and complaints

Your personality:
- Warm, friendly, and professional
- Empathetic and understanding
- Solution-oriented
- Efficient but not rushed
- Occasionally playful but always appropriate

Key information:
- Services available 24/7 for emergencies
- Standard hours: 7 AM - 9 PM
- Pricing varies by service type, duration, and urgency
- All contractors are vetted and insured
- Satisfaction guarantee on all services
- Emergency services have 2x pricing
- Urgent requests (within 4 hours) have 1.5x pricing

Important guidelines:
- Always prioritize customer safety for emergencies
- For urgent issues, offer immediate booking options
- Provide price estimates when possible
- If unsure, offer to connect with human support
- Be transparent about pricing and timing
- Collect necessary information for bookings (service type, address, preferred time)

Contact information:
- Phone: 1-800-HEYLEILA (1-800-439-5345)
- Email: support@heyleila.com
- Emergency line: Available 24/7`;

export const CHAT_CONTEXTS = {
  booking: {
    prompt: "Help the customer book a service. Collect: service type, address, preferred date/time, and urgency level.",
    followUp: [
      "What type of service do you need?",
      "What's your address?",
      "When would you like the service?",
      "Is this urgent or can it wait?",
    ],
  },
  pricing: {
    prompt: "Provide pricing information. Base rates: Cleaning $45-80/hr, Handyman $65-100/hr, Plumbing $85-150/hr, Electrical $95-180/hr, HVAC $120-250/hr. Mention that final price depends on job complexity.",
    followUp: [
      "What service are you interested in?",
      "How big is the job?",
      "Do you need it done urgently?",
    ],
  },
  tracking: {
    prompt: "Help track their booking. Ask for booking ID or phone number.",
    followUp: [
      "What's your booking ID?",
      "What phone number did you use to book?",
      "When was your service scheduled?",
    ],
  },
  urgent: {
    prompt: "Handle with urgency and care. Assess the situation, offer immediate help, provide emergency contact if needed.",
    followUp: [
      "What's the emergency?",
      "Is anyone in immediate danger?",
      "What's your address?",
      "Should I dispatch emergency services?",
    ],
  },
  complaint: {
    prompt: "Listen empathetically, apologize for the inconvenience, gather details, and offer solutions.",
    followUp: [
      "I'm sorry to hear that. Can you tell me what happened?",
      "What's your booking ID?",
      "How can we make this right?",
    ],
  },
};

export function getContextualResponse(intent: string, context?: any): string {
  const responses: Record<string, string[]> = {
    greeting: [
      "Hi there! I'm Leila, your home service assistant. How can I help you today?",
      "Hello! Welcome to Leila Home Services. What can I do for you?",
      "Hey! I'm here to help with all your home service needs. What brings you here today?",
    ],
    booking_start: [
      "I'd be happy to help you book a service! What type of help do you need?",
      "Let's get you booked! What service are you looking for?",
      "Great! I can help schedule that for you. What kind of service do you need?",
    ],
    pricing_info: [
      "Our pricing varies by service type and job complexity. What service are you interested in?",
      "I can give you an estimate! Which service would you like pricing for?",
      "Happy to help with pricing! What type of work needs to be done?",
    ],
    emergency: [
      "I understand this is urgent. Let me help you right away. What's the emergency?",
      "Don't worry, we're here to help. Can you describe the emergency?",
      "I'll prioritize this immediately. What's happening?",
    ],
    contractor_info: [
      "All our contractors are fully vetted, insured, and background-checked. Would you like to know more?",
      "We only work with the best! Our contractors average 4.8+ stars. Any specific questions?",
      "Our contractors are true professionals. What would you like to know about them?",
    ],
    thank_you: [
      "You're welcome! Is there anything else I can help you with?",
      "My pleasure! Don't hesitate to ask if you need anything else.",
      "Happy to help! Anything else on your mind?",
    ],
  };

  const intentResponses = responses[intent] || responses.greeting;
  return intentResponses[Math.floor(Math.random() * intentResponses.length)];
}

export function extractBookingIntent(message: string): {
  service?: string;
  urgency?: 'standard' | 'urgent' | 'emergency';
  timeframe?: string;
} {
  const lowercaseMessage = message.toLowerCase();
  
  // Extract service type
  const services = {
    plumbing: ['plumb', 'pipe', 'leak', 'drain', 'faucet', 'toilet'],
    electrical: ['electric', 'wire', 'outlet', 'breaker', 'light', 'power'],
    hvac: ['hvac', 'ac', 'air condition', 'heating', 'furnace', 'thermostat'],
    cleaning: ['clean', 'maid', 'vacuum', 'dust', 'sanitize'],
    handyman: ['handyman', 'repair', 'fix', 'install', 'mount'],
    painting: ['paint', 'wall', 'ceiling', 'interior', 'exterior'],
    landscaping: ['landscap', 'lawn', 'garden', 'yard', 'grass', 'tree'],
    moving: ['mov', 'relocat', 'pack', 'transport', 'haul'],
  };

  let detectedService: string | undefined;
  for (const [service, keywords] of Object.entries(services)) {
    if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
      detectedService = service;
      break;
    }
  }

  // Extract urgency
  let urgency: 'standard' | 'urgent' | 'emergency' = 'standard';
  if (lowercaseMessage.match(/emergency|asap|immediately|right now|urgent/)) {
    urgency = 'emergency';
  } else if (lowercaseMessage.match(/today|soon|quick|fast/)) {
    urgency = 'urgent';
  }

  // Extract timeframe
  let timeframe: string | undefined;
  const timeMatches = lowercaseMessage.match(/tomorrow|today|this week|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday/);
  if (timeMatches) {
    timeframe = timeMatches[0];
  }

  return { service: detectedService, urgency, timeframe };
}