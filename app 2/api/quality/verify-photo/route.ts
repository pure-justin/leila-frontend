import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { serverConfig } from '@/lib/config/secure-config';

export const POST = secureApiHandler(async (request) => {
  const { imageData, prompt } = await request.json();

  if (!imageData || !prompt) {
    return ApiResponse.error('Image data and prompt are required', 400);
  }

  // Verify API key exists (server-side only)
  if (!serverConfig.gemini.apiKey) {
    console.error('Gemini API key not configured on server');
    return ApiResponse.error('AI verification service not configured', 500);
  }

  const genAI = new GoogleGenerativeAI(serverConfig.gemini.apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Analyze image with AI
    const result = await model.generateContent([
      { text: prompt },
      { 
        inlineData: { 
          mimeType: 'image/jpeg', 
          data: imageData 
        } 
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Parse the response to extract score and analysis
    const analysis = parseAIResponse(text);

    return ApiResponse.success({
      analysis,
      rawResponse: text
    });
}, {
  allowedMethods: ['POST'],
  requireAuth: true, // Require authentication for photo verification
  rateLimit: 20 // 20 verifications per minute
});

function parseAIResponse(response: string): {
  score: number;
  summary: string;
  issues: string[];
  recommendations: string[];
} {
  // Basic parsing - in production this would be more sophisticated
  // You could ask the AI to return JSON format for easier parsing
  
  const lines = response.split('\n').filter(line => line.trim());
  
  // Try to extract score from response
  const scoreMatch = response.match(/score[:\s]+(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
  
  // Extract issues (lines that mention problems, issues, concerns)
  const issues = lines.filter(line => 
    /issue|problem|concern|violation|incorrect/i.test(line)
  ).slice(0, 3);
  
  // Extract recommendations
  const recommendations = lines.filter(line => 
    /recommend|suggest|should|improve/i.test(line)
  ).slice(0, 3);
  
  // Use first few lines as summary if available
  const summary = lines.slice(0, 2).join(' ').substring(0, 200);
  
  return {
    score: Math.min(100, Math.max(0, score)),
    summary: summary || 'Analysis complete',
    issues: issues.length > 0 ? issues : ['No issues found'],
    recommendations: recommendations.length > 0 ? recommendations : ['Work appears satisfactory']
  };
}