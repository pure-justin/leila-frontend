import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { serverConfig } from '@/lib/config/secure-config';
import { SYSTEM_PROMPT, CHAT_CONTEXTS, extractBookingIntent, getContextualResponse } from '@/lib/ai/chat-prompts';

export const POST = secureApiHandler(async (request) => {
  const { message, context, history } = await request.json();

  if (!message) {
    return ApiResponse.error('Message is required', 400);
  }

  // Verify API key exists (server-side only)
  if (!serverConfig.gemini.apiKey) {
    console.error('Gemini API key not configured');
    return ApiResponse.error('AI service not configured', 500);
  }

  const genAI = new GoogleGenerativeAI(serverConfig.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  // Extract intent and context from message
  const bookingIntent = extractBookingIntent(message);
  
  // Build enhanced context
  let enhancedContext = SYSTEM_PROMPT;
  
  if (context === 'customer_support') {
    enhancedContext += "\n\nYou are specifically helping with customer support. Be extra helpful and patient.";
  }
  
  if (bookingIntent.service) {
    enhancedContext += `\n\nThe customer seems interested in ${bookingIntent.service} services.`;
  }
  
  if (bookingIntent.urgency === 'emergency') {
    enhancedContext += "\n\nThis appears to be an emergency. Prioritize immediate assistance and safety.";
  }

    // Build the prompt with enhanced context
    let prompt = `${enhancedContext}\n\nUser: ${message}\n\nResponse:`;

    // Start chat session with history if provided
    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();

    return ApiResponse.success({
      response: text,
      intent: bookingIntent,
      context: context
    });
}, {
  allowedMethods: ['POST'],
  requireAuth: false, // Set to true if you want to require authentication
  rateLimit: 60 // 60 messages per minute
});

// Also support GET for health check
export const GET = secureApiHandler(async () => {
  return ApiResponse.success({
    status: 'ok',
    configured: !!serverConfig.gemini.apiKey
  });
}, {
  allowedMethods: ['GET'],
  requireAuth: false
});