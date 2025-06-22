import * as functions from 'firebase-functions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './config';
import { Timestamp } from 'firebase-admin/firestore';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(functions.config().google?.gemini_api_key || process.env.GOOGLE_GEMINI_API_KEY || '');

export const processAIChat = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB'
  })
  .https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { message, userContext, conversationHistory, timestamp } = data;

    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Message is required');
    }

    try {
      // Get the Gemini model
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      // Build context prompt
      const contextPrompt = buildContextPrompt(userContext, conversationHistory);
      
      // Generate response
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `${contextPrompt}\n\nUser message: ${message}\n\nProvide a helpful, friendly response as their personal AI assistant for home services. Include relevant suggestions and action buttons when appropriate.`
          }]
        }]
      });

      const response = result.response.text();
      
      // Extract suggestions and actions from the response
      const { suggestions, actions } = extractSuggestionsAndActions(response, message, userContext);

      // Log conversation for analytics (minimal data)
      await logConversation(context.auth.uid, message, response, timestamp);

      return {
        response: cleanResponse(response),
        suggestions,
        actions
      };

    } catch (error) {
      console.error('Error processing AI chat:', error);
      throw new functions.https.HttpsError('internal', 'Failed to process chat');
    }
  });

function buildContextPrompt(userContext: any, conversationHistory: string[]): string {
  let prompt = `You are Leila, an AI assistant for a home services platform. You help users book services, answer questions about contractors, find deals, and provide personalized recommendations.

Current user context:
- Name: ${userContext?.name || 'User'}
- User ID: ${userContext?.userId}
- Current property: ${userContext?.currentProperty?.nickname || 'Not specified'} ${userContext?.currentProperty?.address || ''}
`;

  if (userContext?.recentBookings?.length > 0) {
    prompt += `\nRecent bookings: ${userContext.recentBookings.map((b: any) => b.name).join(', ')}`;
  }

  if (userContext?.favoriteServices?.length > 0) {
    prompt += `\nFavorite services: ${userContext.favoriteServices.join(', ')}`;
  }

  if (userContext?.preferences) {
    prompt += `\nPreferences: ${JSON.stringify(userContext.preferences)}`;
  }

  if (conversationHistory?.length > 0) {
    prompt += `\n\nRecent conversation:\n${conversationHistory.slice(-5).join('\n')}`;
  }

  prompt += `\n\nAvailable services include: House Cleaning, Plumbing, Electrical, HVAC, Lawn Care, Handyman, Pet Care, Moving, and more.`;
  
  return prompt;
}

function extractSuggestionsAndActions(response: string, userMessage: string, userContext: any) {
  const suggestions: string[] = [];
  const actions: any[] = [];

  // Smart suggestion extraction based on context
  const lowerMessage = userMessage.toLowerCase();
  const lowerResponse = response.toLowerCase();

  // Service-related keywords
  if (lowerMessage.includes('clean') || lowerResponse.includes('clean')) {
    suggestions.push('Book a house cleaning', 'Deep cleaning options', 'Recurring cleaning schedule');
    actions.push({
      type: 'book',
      label: 'Book Cleaning',
      data: { serviceId: 'house-cleaning' }
    });
  }

  if (lowerMessage.includes('plumb') || lowerResponse.includes('plumb')) {
    suggestions.push('Emergency plumbing', 'Leak repair', 'Drain cleaning');
    actions.push({
      type: 'search',
      label: 'Find Plumbers',
      data: { query: 'plumbing' }
    });
  }

  if (lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
    if (userContext?.recentBookings?.length > 0) {
      suggestions.push(`Rebook ${userContext.recentBookings[0].name}`, 'View my bookings', 'Schedule for later');
    }
    actions.push({
      type: 'schedule',
      label: 'My Bookings',
    });
  }

  // Deal-related
  if (lowerMessage.includes('deal') || lowerMessage.includes('discount') || lowerMessage.includes('save')) {
    suggestions.push('Today\'s deals', 'Bundle services', 'First-time discounts');
    actions.push({
      type: 'search',
      label: 'View Deals',
      data: { query: 'deals' }
    });
  }

  // Profile/account related
  if (lowerMessage.includes('profile') || lowerMessage.includes('account') || lowerMessage.includes('property')) {
    suggestions.push('Update property info', 'Payment methods', 'Service preferences');
    actions.push({
      type: 'viewProfile',
      label: 'My Profile',
    });
  }

  // Default suggestions if none were added
  if (suggestions.length === 0) {
    if (userContext?.favoriteServices?.length > 0) {
      suggestions.push(`Book ${userContext.favoriteServices[0]}`, 'Browse all services', 'Get a quote');
    } else {
      suggestions.push('Popular services', 'Get started', 'How it works', 'Contact support');
    }
  }

  return { suggestions: suggestions.slice(0, 4), actions: actions.slice(0, 3) };
}

function cleanResponse(response: string): string {
  // Remove any markdown formatting that might confuse the UI
  return response
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .trim();
}

async function logConversation(userId: string, message: string, response: string, timestamp: string) {
  try {
    // Store minimal conversation data for analytics
    await db.collection('chat_analytics').add({
      userId,
      messageLength: message.length,
      responseLength: response.length,
      timestamp: Timestamp.fromDate(new Date(timestamp)),
      // Don't store actual message content for privacy
      topics: extractTopics(message),
      created: Timestamp.now()
    });
  } catch (error) {
    console.error('Error logging conversation:', error);
    // Don't throw - logging failure shouldn't break chat
  }
}

function extractTopics(message: string): string[] {
  const topics: string[] = [];
  const lower = message.toLowerCase();
  
  const topicKeywords = {
    'cleaning': ['clean', 'maid', 'housekeep'],
    'plumbing': ['plumb', 'leak', 'drain', 'pipe', 'toilet'],
    'electrical': ['electric', 'outlet', 'wire', 'light'],
    'hvac': ['hvac', 'heat', 'cool', 'ac', 'air condition'],
    'booking': ['book', 'schedule', 'appoint'],
    'pricing': ['price', 'cost', 'quote', 'fee'],
    'support': ['help', 'issue', 'problem', 'support']
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      topics.push(topic);
    }
  }

  return topics;
}