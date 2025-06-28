import { NextRequest, NextResponse } from 'next/server';

// Simple wake word detection
// In production, use a proper wake word detection service like Porcupine or Snowboy

const WAKE_WORDS = ['hey leila', 'hi leila', 'hello leila', 'ok leila', 'leila'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // For demo purposes, we'll use a simple implementation
    // In production, process the audio with a wake word detection model
    const detected = await detectWakeWord(audioFile);

    return NextResponse.json({ detected });
  } catch (error) {
    console.error('Wake word detection error:', error);
    return NextResponse.json(
      { error: 'Failed to process wake word' },
      { status: 500 }
    );
  }
}

async function detectWakeWord(audioFile: File): Promise<boolean> {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Convert audio to proper format
  // 2. Run through wake word detection model
  // 3. Return true if wake word detected with high confidence

  // For now, randomly return true 30% of the time for demo
  return Math.random() < 0.3;
}

// Alternative implementation using speech-to-text for wake word
export async function detectWakeWordWithSTT(audioBlob: Blob): Promise<boolean> {
  try {
    // Convert audio to text using browser's speech recognition
    // or send to a speech-to-text API
    
    // For demo, check if any wake words are present
    const transcript = await getTranscriptFromAudio(audioBlob);
    const lowerTranscript = transcript.toLowerCase();
    
    return WAKE_WORDS.some(word => lowerTranscript.includes(word));
  } catch (error) {
    console.error('STT error:', error);
    return false;
  }
}

async function getTranscriptFromAudio(audioBlob: Blob): Promise<string> {
  // Placeholder - in production, use Google Speech-to-Text or similar
  return '';
}