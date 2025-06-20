// API endpoint for Claude to send debug messages
import { NextRequest, NextResponse } from 'next/server';

// Store messages in memory (for development only)
const messages: any[] = [];

export async function POST(request: NextRequest) {
  const data = await request.json();
  
  // Add timestamp
  const message = {
    ...data,
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  messages.push(message);
  
  // Keep only last 100 messages
  if (messages.length > 100) {
    messages.shift();
  }
  
  console.log('🤖 Claude Debug:', data.message);
  
  return NextResponse.json({ success: true, message });
}

export async function GET() {
  return NextResponse.json({ messages });
}