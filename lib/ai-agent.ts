import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AIAgentContext {
  customerId?: string;
  contractorId?: string;
  bookingId?: string;
  conversationHistory: Message[];
  metadata?: Record<string, any>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    entities?: Record<string, any>;
    confidence?: number;
  };
}

export interface AgentResponse {
  message: string;
  actions?: AgentAction[];
  suggestions?: string[];
  requiresHuman?: boolean;
}

export interface AgentAction {
  type: 'booking' | 'scheduling' | 'pricing' | 'contractor_assignment' | 'notification';
  data: any;
  executed?: boolean;
}

// Intent recognition patterns
const INTENT_PATTERNS = {
  booking: {
    patterns: [
      /book.*service/i,
      /schedule.*appointment/i,
      /need.*help.*with/i,
      /want.*to.*hire/i,
      /fix.*my/i,
      /repair/i,
      /install/i
    ],
    entities: ['service', 'date', 'time', 'urgency']
  },
  pricing: {
    patterns: [
      /how.*much/i,
      /cost/i,
      /price/i,
      /estimate/i,
      /quote/i,
      /fee/i,
      /charge/i
    ],
    entities: ['service', 'scope']
  },
  availability: {
    patterns: [
      /available/i,
      /when.*can/i,
      /earliest/i,
      /today/i,
      /tomorrow/i,
      /emergency/i,
      /urgent/i
    ],
    entities: ['date', 'time', 'urgency']
  },
  status: {
    patterns: [
      /status/i,
      /where.*is/i,
      /update/i,
      /progress/i,
      /eta/i,
      /arrival/i
    ],
    entities: ['bookingId']
  },
  cancel: {
    patterns: [
      /cancel/i,
      /reschedule/i,
      /change.*time/i,
      /postpone/i
    ],
    entities: ['bookingId', 'reason']
  }
};

// Service extraction patterns
const SERVICE_PATTERNS = {
  plumbing: /plumb|leak|pipe|drain|faucet|toilet|water|sink/i,
  electrical: /electric|wire|outlet|circuit|breaker|light|power/i,
  hvac: /hvac|heat|cool|air.*condition|ac|furnace|thermostat/i,
  cleaning: /clean|maid|housekeep|tidy|dust|vacuum/i,
  handyman: /handy|repair|fix|general|maintenance|paint/i,
  landscaping: /landscape|lawn|garden|grass|tree|yard/i,
  moving: /move|relocat|pack|transport|haul/i,
  pest: /pest|bug|insect|rodent|termite|extermina/i
};

// Natural language processing for entity extraction
function extractEntities(text: string): Record<string, any> {
  const entities: Record<string, any> = {};

  // Extract service type
  for (const [service, pattern] of Object.entries(SERVICE_PATTERNS)) {
    if (pattern.test(text)) {
      entities.service = service;
      break;
    }
  }

  // Extract date/time
  const timePatterns = {
    today: /today|now|asap|immediately/i,
    tomorrow: /tomorrow/i,
    time: /(\d{1,2})(:\d{2})?\s*(am|pm)/i,
    date: /(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/
  };

  if (timePatterns.today.test(text)) {
    entities.date = new Date().toISOString().split('T')[0];
    entities.urgency = 'high';
  } else if (timePatterns.tomorrow.test(text)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    entities.date = tomorrow.toISOString().split('T')[0];
  }

  const timeMatch = text.match(timePatterns.time);
  if (timeMatch) {
    entities.time = timeMatch[0];
  }

  // Extract urgency
  if (/urgent|emergency|asap|immediately|now/i.test(text)) {
    entities.urgency = 'emergency';
  }

  // Extract location if mentioned
  const addressPattern = /\d+\s+[\w\s]+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|way|boulevard|blvd)/i;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) {
    entities.address = addressMatch[0];
  }

  return entities;
}

// Determine user intent
function detectIntent(text: string): { intent: string; confidence: number } {
  let maxConfidence = 0;
  let detectedIntent = 'general';

  for (const [intent, config] of Object.entries(INTENT_PATTERNS)) {
    const matches = config.patterns.filter(pattern => pattern.test(text)).length;
    const confidence = matches / config.patterns.length;

    if (confidence > maxConfidence) {
      maxConfidence = confidence;
      detectedIntent = intent;
    }
  }

  return {
    intent: detectedIntent,
    confidence: maxConfidence
  };
}

// Generate contextual response
async function generateResponse(
  message: string,
  context: AIAgentContext
): Promise<AgentResponse> {
  const { intent, confidence } = detectIntent(message);
  const entities = extractEntities(message);
  
  const response: AgentResponse = {
    message: '',
    actions: [],
    suggestions: []
  };

  switch (intent) {
    case 'booking':
      if (entities.service) {
        response.message = `I can help you book a ${entities.service} service. `;
        
        if (entities.date) {
          response.message += `I see you need it on ${entities.date}. `;
          
          // Check contractor availability
          const availableContractors = await checkContractorAvailability(
            entities.service,
            entities.date,
            entities.time
          );
          
          if (availableContractors.length > 0) {
            response.message += `We have ${availableContractors.length} contractors available. `;
            
            if (entities.urgency === 'emergency') {
              response.message += 'I can dispatch someone immediately. ';
              response.actions?.push({
                type: 'booking',
                data: {
                  service: entities.service,
                  date: entities.date,
                  urgency: 'emergency',
                  suggestedContractor: availableContractors[0]
                }
              });
            }
          } else {
            response.message += 'Let me find the next available slot for you. ';
            const nextSlot = await findNextAvailableSlot(entities.service);
            response.suggestions = [
              `Book for ${nextSlot.date} at ${nextSlot.time}`,
              'View all available times',
              'Get notified when someone becomes available'
            ];
          }
        } else {
          response.message += 'When would you like to schedule this service?';
          response.suggestions = [
            'Today',
            'Tomorrow',
            'This week',
            'Choose specific date'
          ];
        }
      } else {
        response.message = 'What type of service do you need help with?';
        response.suggestions = [
          'Plumbing',
          'Electrical',
          'HVAC',
          'Cleaning',
          'Handyman',
          'Other'
        ];
      }
      break;

    case 'pricing':
      if (entities.service) {
        const pricing = await getServicePricing(entities.service);
        response.message = `For ${entities.service} services, our rates typically range from $${pricing.min} to $${pricing.max} per hour. `;
        response.message += 'The final cost depends on the specific work needed. Would you like a detailed quote?';
        response.suggestions = [
          'Get instant quote',
          'Schedule free inspection',
          'View pricing details'
        ];
      } else {
        response.message = 'I can provide pricing information. Which service are you interested in?';
      }
      break;

    case 'availability':
      response.message = 'Let me check our availability for you. ';
      const slots = await getAvailableSlots(entities.service || 'general');
      
      if (entities.urgency === 'emergency') {
        response.message += 'For emergency service, we can have someone there within 2 hours. ';
        response.actions?.push({
          type: 'scheduling',
          data: { urgency: 'emergency', eta: '2 hours' }
        });
      } else {
        response.message += `Our next available slots are: ${slots.map(s => `${s.date} at ${s.time}`).join(', ')}`;
      }
      break;

    case 'status':
      if (context.bookingId) {
        const status = await getBookingStatus(context.bookingId);
        response.message = `Your ${status.service} service is ${status.status}. `;
        
        if (status.contractor) {
          response.message += `${status.contractor.name} is assigned and will arrive at ${status.eta}. `;
          if (status.contractor.location) {
            response.message += 'You can track their location in real-time. ';
          }
        }
      } else {
        response.message = 'I can check your booking status. Do you have a booking reference number?';
      }
      break;

    case 'cancel':
      if (context.bookingId) {
        response.message = 'I understand you want to cancel or reschedule. Can you tell me why?';
        response.suggestions = [
          'Need to reschedule',
          'No longer needed',
          'Found another provider',
          'Other reason'
        ];
        response.actions?.push({
          type: 'booking',
          data: { action: 'cancel_initiate', bookingId: context.bookingId }
        });
      }
      break;

    default:
      response.message = "I'm here to help with your home service needs. You can ask me to book a service, check pricing, or see availability.";
      response.suggestions = [
        'Book a service',
        'Get pricing',
        'Emergency service',
        'Track my booking'
      ];
  }

  // Add contextual suggestions based on conversation history
  if (context.conversationHistory.length > 0) {
    const lastUserMessage = context.conversationHistory
      .filter(m => m.role === 'user')
      .slice(-1)[0];
    
    if (lastUserMessage && !response.suggestions?.length) {
      response.suggestions = generateContextualSuggestions(lastUserMessage.content, entities);
    }
  }

  return response;
}

// Helper functions for data retrieval
async function checkContractorAvailability(
  service: string,
  date: string,
  time?: string
): Promise<any[]> {
  const { data } = await supabase
    .from('contractors')
    .select('*')
    .contains('services', [service])
    .eq('available', true);
  
  return data || [];
}

async function findNextAvailableSlot(service: string): Promise<any> {
  // Implementation for finding next available slot
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    date: tomorrow.toISOString().split('T')[0],
    time: '10:00 AM'
  };
}

async function getServicePricing(service: string): Promise<any> {
  // Implementation for dynamic pricing
  const basePrices: Record<string, any> = {
    plumbing: { min: 75, max: 150 },
    electrical: { min: 80, max: 175 },
    hvac: { min: 100, max: 250 },
    cleaning: { min: 50, max: 100 },
    handyman: { min: 60, max: 120 }
  };
  
  return basePrices[service] || { min: 50, max: 150 };
}

async function getAvailableSlots(service: string): Promise<any[]> {
  // Implementation for available slots
  const slots = [];
  const now = new Date();
  
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    slots.push({
      date: date.toISOString().split('T')[0],
      time: '9:00 AM'
    }, {
      date: date.toISOString().split('T')[0],
      time: '2:00 PM'
    });
  }
  
  return slots;
}

async function getBookingStatus(bookingId: string): Promise<any> {
  const { data } = await supabase
    .from('bookings')
    .select('*, contractors(*)')
    .eq('id', bookingId)
    .single();
  
  return {
    service: data?.service || 'Service',
    status: data?.status || 'pending',
    contractor: data?.contractors ? {
      name: `${data.contractors.first_name} ${data.contractors.last_name}`,
      location: null
    } : null,
    eta: data?.scheduled_time || 'TBD'
  };
}

function generateContextualSuggestions(
  lastMessage: string,
  entities: Record<string, any>
): string[] {
  const suggestions = [];
  
  if (entities.service && !entities.date) {
    suggestions.push('Book for today', 'Book for tomorrow', 'Choose date');
  }
  
  if (entities.date && !entities.time) {
    suggestions.push('Morning (9AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)');
  }
  
  if (!entities.service) {
    suggestions.push('Home repair', 'Cleaning service', 'Emergency service');
  }
  
  return suggestions;
}

// Main AI Agent class
export class LeilaAIAgent {
  private context: AIAgentContext;

  constructor(context?: Partial<AIAgentContext>) {
    this.context = {
      conversationHistory: [],
      ...context
    };
  }

  async processMessage(message: string): Promise<AgentResponse> {
    // Add message to history
    this.context.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate response
    const response = await generateResponse(message, this.context);

    // Add response to history
    this.context.conversationHistory.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      metadata: {
        intent: response.intent,
        entities: response.entities,
        confidence: response.confidence
      }
    });

    // Execute actions if auto-execute is enabled
    if (response.actions) {
      for (const action of response.actions) {
        if (!action.executed) {
          await this.executeAction(action);
        }
      }
    }

    return response;
  }

  private async executeAction(action: AgentAction): Promise<void> {
    switch (action.type) {
      case 'booking':
        // Execute booking action
        console.log('Executing booking action:', action.data);
        break;
      
      case 'notification':
        // Send notification
        console.log('Sending notification:', action.data);
        break;
      
      case 'contractor_assignment':
        // Assign contractor
        console.log('Assigning contractor:', action.data);
        break;
    }
    
    action.executed = true;
  }

  getContext(): AIAgentContext {
    return this.context;
  }

  clearContext(): void {
    this.context.conversationHistory = [];
  }
}