import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Service keywords mapping
const SERVICE_KEYWORDS = {
  cleaning: ['clean', 'cleaning', 'maid', 'housekeeping', 'tidy'],
  plumbing: ['plumb', 'pipe', 'leak', 'drain', 'faucet', 'toilet', 'water'],
  electrical: ['electric', 'wire', 'outlet', 'breaker', 'light', 'power'],
  hvac: ['ac', 'heat', 'cool', 'air', 'hvac', 'furnace', 'thermostat'],
  handyman: ['fix', 'repair', 'handyman', 'install', 'mount', 'assemble'],
  painting: ['paint', 'wall', 'ceiling', 'color'],
  gardening: ['garden', 'lawn', 'grass', 'plant', 'yard', 'landscape'],
  moving: ['move', 'moving', 'pack', 'transport', 'haul']
};

// Time extraction patterns
const TIME_PATTERNS = [
  /tomorrow/i,
  /today/i,
  /this (week|weekend|morning|afternoon|evening)/i,
  /next (week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
  /(\d{1,2})(:\d{2})?\s*(am|pm)?/i,
  /in (\d+) (hour|day|week)s?/i
];

export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();

    if (!command) {
      return NextResponse.json(
        { error: 'No command provided' },
        { status: 400 }
      );
    }

    // Process the command
    const processedCommand = await processVoiceCommand(command);
    
    return NextResponse.json(processedCommand);
  } catch (error) {
    console.error('Voice processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
      { status: 500 }
    );
  }
}

async function processVoiceCommand(command: string) {
  const lowerCommand = command.toLowerCase();
  
  // Detect intent
  const intent = detectIntent(lowerCommand);
  
  // Extract entities
  const service = detectService(lowerCommand);
  const time = extractTime(lowerCommand);
  const location = extractLocation(lowerCommand);

  // Generate contextual response
  let response = '';
  let action = null;

  switch (intent) {
    case 'booking':
      if (service) {
        response = `I can help you book ${service} service`;
        if (time) {
          response += ` for ${time}`;
        }
        response += '. Would you like me to find available contractors?';
        
        action = {
          type: 'navigate',
          screen: 'booking',
          params: { service, time }
        };
      } else {
        response = 'What service would you like to book? I can help with cleaning, plumbing, electrical work, and more.';
        action = {
          type: 'show_services'
        };
      }
      break;

    case 'status':
      response = 'Let me check your booking status. One moment please.';
      action = {
        type: 'check_status'
      };
      break;

    case 'cancel':
      response = 'I can help you cancel a booking. Which booking would you like to cancel?';
      action = {
        type: 'show_bookings'
      };
      break;

    case 'pricing':
      if (service) {
        response = `Let me show you pricing for ${service} services in your area.`;
        action = {
          type: 'show_pricing',
          service
        };
      } else {
        response = 'Which service would you like pricing information for?';
      }
      break;

    case 'help':
      response = 'I can help you book home services, check booking status, view pricing, or answer questions. What would you like to do?';
      break;

    case 'greeting':
      response = getGreetingResponse();
      break;

    default:
      // Use AI for complex queries
      response = await generateAIResponse(command);
  }

  return {
    command,
    intent,
    entities: {
      service,
      time,
      location
    },
    response,
    action,
    confidence: calculateConfidence(intent, service)
  };
}

function detectIntent(command: string): string {
  if (command.match(/book|schedule|need|want|looking for|require/i)) {
    return 'booking';
  }
  if (command.match(/status|check|where|when is/i)) {
    return 'status';
  }
  if (command.match(/cancel|stop|remove/i)) {
    return 'cancel';
  }
  if (command.match(/price|cost|how much|rate|charge/i)) {
    return 'pricing';
  }
  if (command.match(/help|what can you|how do|explain/i)) {
    return 'help';
  }
  if (command.match(/hi|hello|hey|good morning|good afternoon/i)) {
    return 'greeting';
  }
  return 'unknown';
}

function detectService(command: string): string | null {
  for (const [service, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some(keyword => command.includes(keyword))) {
      return service;
    }
  }
  return null;
}

function extractTime(command: string): string | null {
  for (const pattern of TIME_PATTERNS) {
    const match = command.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}

function extractLocation(command: string): string | null {
  // Simple location extraction - can be enhanced
  const locationMatch = command.match(/(?:in|at|near)\s+([A-Za-z\s]+?)(?:\.|,|$)/i);
  return locationMatch ? locationMatch[1].trim() : null;
}

function calculateConfidence(intent: string, service: string | null): number {
  if (intent === 'unknown') return 0.3;
  if (intent === 'booking' && !service) return 0.6;
  if (intent === 'booking' && service) return 0.9;
  return 0.8;
}

function getGreetingResponse(): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  
  const greetings = [
    `Good ${timeOfDay}! I'm Leila, ready to help with your home services.`,
    `Hi there! What home service can I help you with today?`,
    `Hello! I'm here to make booking home services super easy for you.`
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

async function generateAIResponse(command: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are Leila, a friendly and helpful home service booking assistant. 
    Respond to this user command in a conversational, helpful way. Keep it brief (1-2 sentences).
    If they're asking about services, mention we offer cleaning, plumbing, electrical, HVAC, handyman, painting, gardening, and moving services.
    
    User command: "${command}"
    
    Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI generation error:', error);
    return "I'm having trouble understanding that. Could you please rephrase your request?";
  }
}