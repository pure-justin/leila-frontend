import { NextResponse } from 'next/server';

export async function GET() {
  const voices = [
    {
      id: 'leila-flirty',
      name: 'Leila (Flirty)',
      language: 'en-US',
      gender: 'female',
      provider: 'huggingface',
      description: 'Cute, playful, and charming voice',
      previewUrl: '/audio/samples/leila-flirty.mp3'
    },
    {
      id: 'leila-professional',
      name: 'Leila (Professional)',
      language: 'en-US',
      gender: 'female',
      provider: 'huggingface',
      description: 'Clear and professional tone',
      previewUrl: '/audio/samples/leila-professional.mp3'
    },
    {
      id: 'leila-friendly',
      name: 'Leila (Friendly)',
      language: 'en-US',
      gender: 'female',
      provider: 'huggingface',
      description: 'Warm and welcoming voice',
      previewUrl: '/audio/samples/leila-friendly.mp3'
    },
    {
      id: 'leila-excited',
      name: 'Leila (Excited)',
      language: 'en-US',
      gender: 'female',
      provider: 'huggingface',
      description: 'Energetic and enthusiastic',
      previewUrl: '/audio/samples/leila-excited.mp3'
    }
  ];

  return NextResponse.json({ voices });
}