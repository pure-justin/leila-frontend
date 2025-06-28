import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { serverConfig } from '@/lib/config/secure-config';

export const POST = secureApiHandler(async (request) => {
  const { prompt, context } = await request.json();

  if (!serverConfig.gemini.apiKey) {
    return ApiResponse.error('AI service not configured', 500);
  }

  const genAI = new GoogleGenerativeAI(serverConfig.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: context ? `${context}\n\n${prompt}` : prompt
        }]
      }]
    });

    const response = await result.response;
    const text = response.text();

    return ApiResponse.success({ response: text });
}, {
  allowedMethods: ['POST'],
  requireAuth: false, // Set to true if authentication is needed
  rateLimit: 30 // 30 requests per minute
});