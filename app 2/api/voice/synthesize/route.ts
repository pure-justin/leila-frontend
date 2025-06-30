import { NextRequest, NextResponse } from 'next/server';

// Temporary fallback route that returns demo audio
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { voiceId } = body;

  // Return demo audio URL
  return NextResponse.json({
    audioUrl: `/audio/samples/${voiceId || 'leila-flirty'}.mp3`,
    duration: 5.2,
    voiceId: voiceId || 'leila-flirty',
    cached: true,
    demo: true,
    message: 'Using demo audio. Voice synthesis will be available soon.'
  });
}