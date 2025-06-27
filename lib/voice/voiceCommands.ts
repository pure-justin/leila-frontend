import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface VoiceCommandResult {
  response: string;
  action?: {
    type: 'navigate' | 'book' | 'search' | 'track' | 'help';
    path?: string;
    service?: string;
    query?: string;
  };
}

// Service keywords mapping
const serviceKeywords: Record<string, string[]> = {
  'house-cleaning': ['clean', 'cleaning', 'house cleaning', 'maid', 'housekeeping'],
  'plumbing': ['plumber', 'plumbing', 'pipe', 'leak', 'drain', 'toilet', 'faucet'],
  'electrical': ['electrician', 'electrical', 'electricity', 'outlet', 'wiring', 'lights'],
  'handyman': ['handyman', 'repair', 'fix', 'maintenance', 'general'],
  'painting': ['paint', 'painting', 'painter', 'wall'],
  'moving': ['move', 'moving', 'mover', 'relocate'],
  'landscaping': ['landscape', 'landscaping', 'lawn', 'garden', 'yard'],
  'pest-control': ['pest', 'exterminator', 'bugs', 'insects', 'rodent'],
  'hvac': ['hvac', 'air conditioning', 'ac', 'heating', 'furnace', 'ventilation'],
  'appliance-repair': ['appliance', 'refrigerator', 'washer', 'dryer', 'dishwasher', 'oven'],
  'carpet-cleaning': ['carpet', 'rug', 'carpet cleaning', 'upholstery'],
  'window-cleaning': ['window', 'window cleaning', 'glass'],
  'pool-service': ['pool', 'swimming pool', 'pool cleaning', 'pool maintenance'],
  'locksmith': ['lock', 'locksmith', 'key', 'locked out'],
  'roofing': ['roof', 'roofing', 'shingles', 'gutter'],
  'flooring': ['floor', 'flooring', 'hardwood', 'tile', 'carpet installation'],
  'junk-removal': ['junk', 'trash', 'debris', 'removal', 'haul away'],
  'home-security': ['security', 'alarm', 'camera', 'security system'],
  'solar': ['solar', 'solar panel', 'renewable energy'],
  'water-heater': ['water heater', 'hot water', 'tankless']
};

// Navigation keywords
const navigationKeywords: Record<string, string[]> = {
  '/': ['home', 'main', 'start'],
  '/services': ['services', 'all services', 'browse'],
  '/book': ['book', 'booking', 'schedule', 'appointment'],
  '/contractor/dashboard': ['contractor', 'provider', 'pro dashboard'],
  '/how-it-works': ['how it works', 'help', 'guide', 'tutorial'],
  '/status': ['status', 'track', 'tracking', 'my booking', 'my order']
};

export async function processVoiceCommand(transcript: string): Promise<VoiceCommandResult> {
  const lowerTranscript = transcript.toLowerCase().trim();

  // Remove wake words
  const cleanedTranscript = lowerTranscript
    .replace(/^(hey |hi |hello )?(leila|layla)/i, '')
    .trim();

  // Check for service booking intent
  const bookingKeywords = ['book', 'schedule', 'need', 'want', 'looking for', 'find me', 'get me'];
  const isBookingIntent = bookingKeywords.some(keyword => cleanedTranscript.includes(keyword));

  if (isBookingIntent) {
    // Find matching service
    for (const [service, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some(keyword => cleanedTranscript.includes(keyword))) {
        return {
          response: `I'll help you book ${service.replace('-', ' ')} service. Let me take you to the booking page.`,
          action: {
            type: 'book',
            service
          }
        };
      }
    }
  }

  // Check for navigation intent
  for (const [path, keywords] of Object.entries(navigationKeywords)) {
    if (keywords.some(keyword => cleanedTranscript.includes(keyword))) {
      const pageName = path === '/' ? 'home page' : path.substring(1).replace('-', ' ');
      return {
        response: `Taking you to the ${pageName}.`,
        action: {
          type: 'navigate',
          path
        }
      };
    }
  }

  // Check for tracking intent
  if (cleanedTranscript.includes('track') || cleanedTranscript.includes('status') || cleanedTranscript.includes('where is')) {
    return {
      response: "I'll show you your booking status.",
      action: {
        type: 'navigate',
        path: '/status'
      }
    };
  }

  // Check for search intent
  if (cleanedTranscript.includes('search') || cleanedTranscript.includes('find') || cleanedTranscript.includes('show me')) {
    const searchQuery = cleanedTranscript
      .replace(/(search|find|show me|look for)/g, '')
      .trim();
    
    if (searchQuery) {
      return {
        response: `Searching for ${searchQuery} services.`,
        action: {
          type: 'search',
          query: searchQuery
        }
      };
    }
  }

  // Use Gemini AI for complex queries
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are Leila, a helpful home service booking assistant. 
    The user said: "${cleanedTranscript}"
    
    Provide a brief, friendly response (max 2 sentences). 
    If they're asking about a service, mention you can help them book it.
    If they need help, guide them to available services.
    Keep the tone conversational and helpful.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return {
      response: response.trim()
    };
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Fallback responses
    if (cleanedTranscript.includes('help')) {
      return {
        response: "I can help you book home services like cleaning, plumbing, electrical work, and more. What service do you need today?",
        action: {
          type: 'navigate',
          path: '/services'
        }
      };
    }

    return {
      response: "I can help you book various home services. Would you like to see all available services?",
      action: {
        type: 'navigate',
        path: '/services'
      }
    };
  }
}