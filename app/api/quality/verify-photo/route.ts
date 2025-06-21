import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-side only - no NEXT_PUBLIC prefix
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { imageData, prompt } = await request.json();

    if (!imageData || !prompt) {
      return NextResponse.json(
        { error: 'Image data and prompt are required' },
        { status: 400 }
      );
    }

    // Verify API key exists (server-side only)
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured on server');
      return NextResponse.json(
        { error: 'AI verification service not configured' },
        { status: 500 }
      );
    }

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

    return NextResponse.json({
      success: true,
      analysis,
      rawResponse: text
    });

  } catch (error) {
    console.error('Photo verification API Error:', error);
    
    // Don't expose internal error details
    return NextResponse.json(
      { 
        error: 'Failed to verify photo',
        success: false 
      },
      { status: 500 }
    );
  }
}

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