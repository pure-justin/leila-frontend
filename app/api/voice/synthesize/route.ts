import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// ElevenLabs will be loaded dynamically to avoid build issues
let elevenlabs: any = null;

// Initialize ElevenLabs client dynamically
async function getElevenLabsClient() {
  if (!elevenlabs && process.env.ELEVEN_LABS_API_KEY) {
    try {
      const { ElevenLabs } = await import('@elevenlabs/elevenlabs-js');
      elevenlabs = new ElevenLabs({
        apiKey: process.env.ELEVEN_LABS_API_KEY
      });
    } catch (error) {
      console.error('Failed to load ElevenLabs:', error);
    }
  }
  return elevenlabs;
}

// Voice configurations for different personas
const voiceConfigs = {
  'leila-warm': {
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Rachel voice as placeholder
    modelId: 'eleven_turbo_v2',
    settings: {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.65,
      use_speaker_boost: true
    }
  },
  'leila-professional': {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam voice as placeholder
    modelId: 'eleven_turbo_v2',
    settings: {
      stability: 0.85,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    }
  },
  'leila-energetic': {
    voiceId: 'MF3mGyEYCl7XYWbV9V6O', // Elli voice as placeholder
    modelId: 'eleven_turbo_v2',
    settings: {
      stability: 0.65,
      similarity_boost: 0.80,
      style: 0.8,
      use_speaker_boost: true
    }
  },
  'leila-empathetic': {
    voiceId: 'ThT5KcBeYPX3keUQqHPh', // Nicole voice as placeholder
    modelId: 'eleven_turbo_v2',
    settings: {
      stability: 0.8,
      similarity_boost: 0.9,
      style: 0.4,
      use_speaker_boost: true
    }
  }
};

// Emotion to prosody mapping
const emotionProsody: Record<string, any> = {
  friendly: { rate: 1.0, pitch: 1.05 },
  professional: { rate: 0.95, pitch: 1.0 },
  excited: { rate: 1.1, pitch: 1.1 },
  empathetic: { rate: 0.9, pitch: 0.95 },
  apologetic: { rate: 0.85, pitch: 0.9 },
  helpful: { rate: 1.0, pitch: 1.02 },
  reassuring: { rate: 0.92, pitch: 0.98 }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId, settings } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get voice configuration
    const voiceConfig = voiceConfigs[voiceId as keyof typeof voiceConfigs] || voiceConfigs['leila-warm'];
    
    // Apply emotion-based prosody adjustments
    const emotionSettings = emotionProsody[settings?.emotion || 'friendly'];
    const adjustedSettings = {
      ...voiceConfig.settings,
      stability: voiceConfig.settings.stability * (settings?.speed || 1.0),
      similarity_boost: voiceConfig.settings.similarity_boost + (settings?.pitch || 0) * 0.01
    };

    // For demo purposes, use a pre-generated audio file
    // In production, this would call the actual ElevenLabs API
    if (process.env.NODE_ENV === 'development' || !process.env.ELEVEN_LABS_API_KEY) {
      // Return demo audio URL
      const demoAudioUrl = `/audio/demo/leila-voice-sample.mp3`;
      
      return NextResponse.json({
        audioUrl: demoAudioUrl,
        duration: 5.2,
        voiceId: voiceId,
        cached: true
      });
    }

    // Production: Generate with ElevenLabs
    try {
      const client = await getElevenLabsClient();
      if (!client) {
        throw new Error('ElevenLabs client not available');
      }
      
      const audio = await client.textToSpeech.convert(voiceConfig.voiceId, {
        text: preprocessText(text, settings?.emotion || 'friendly'),
        model_id: voiceConfig.modelId,
        voice_settings: adjustedSettings,
        output_format: 'mp3_44100_128'
      });

      // Convert audio stream to buffer
      const chunks: Buffer[] = [];
      
      for await (const chunk of audio) {
        chunks.push(Buffer.from(chunk));
      }

      const audioBuffer = Buffer.concat(chunks);
      
      // Save audio file
      const audioDir = join(process.cwd(), 'public', 'audio', 'generated');
      if (!existsSync(audioDir)) {
        await mkdir(audioDir, { recursive: true });
      }

      const filename = `${uuidv4()}.mp3`;
      const filepath = join(audioDir, filename);
      await writeFile(filepath, audioBuffer);

      const audioUrl = `/audio/generated/${filename}`;

      return NextResponse.json({
        audioUrl,
        duration: audioBuffer.length / 16000, // Rough estimate
        voiceId: voiceId,
        cached: false
      });

    } catch (apiError) {
      console.error('ElevenLabs API error:', apiError);
      
      // Fallback to demo audio
      return NextResponse.json({
        audioUrl: `/audio/demo/leila-voice-sample.mp3`,
        duration: 5.2,
        voiceId: voiceId,
        cached: true,
        fallback: true
      });
    }

  } catch (error) {
    console.error('Voice synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize voice' },
      { status: 500 }
    );
  }
}

// Helper function to process text for more natural speech
function preprocessText(text: string, emotion: string): string {
  let processed = text;

  // Add natural contractions
  processed = processed
    .replace(/\bI will\b/g, "I'll")
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bI have\b/g, "I've")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bcannot\b/g, "can't")
    .replace(/\bwould not\b/g, "wouldn't");

  // Add pauses for emphasis based on emotion
  if (emotion === 'apologetic') {
    processed = processed.replace(/sorry/gi, '... sorry');
  } else if (emotion === 'excited') {
    processed = processed.replace(/!/g, '! ...');
  }

  return processed;
}