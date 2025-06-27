import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Hugging Face Inference API for TTS models
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/';

// Free/Open-source TTS models on Hugging Face
const TTS_MODELS = {
  // Microsoft SpeechT5 - High quality, fast, multilingual
  speecht5: {
    model: 'microsoft/speecht5_tts',
    speaker_embeddings: 'Matthijs/cmu-arctic-xvectors',
    quality: 'high',
    speed: 'fast'
  },
  // Bark - Very expressive, can do emotions and non-speech sounds
  bark: {
    model: 'suno/bark',
    quality: 'very_high',
    speed: 'slow',
    supports_emotions: true
  },
  // Coqui XTTS - Multi-lingual, voice cloning capable
  xtts: {
    model: 'coqui/XTTS-v2',
    quality: 'high',
    speed: 'medium',
    supports_cloning: true
  },
  // Facebook MMS-TTS - 1000+ languages
  mms: {
    model: 'facebook/mms-tts-eng',
    quality: 'good',
    speed: 'fast'
  }
};

// Voice profiles mapped to speaker embeddings
const VOICE_PROFILES = {
  'leila-flirty': {
    model: 'bark',
    voice_preset: 'v2/en_speaker_6', // Young, playful female voice
    settings: {
      speed: 1.05,
      pitch: 1.15,
      emotion: 'flirty',
      style: 'playful'
    }
  },
  'leila-warm': {
    model: 'speecht5',
    speaker_id: 7, // Female voice, warm tone
    settings: {
      speed: 1.0,
      pitch: 1.05,
      emotion: 'friendly'
    }
  },
  'leila-professional': {
    model: 'speecht5',
    speaker_id: 2, // Female voice, clear and professional
    settings: {
      speed: 0.95,
      pitch: 1.0,
      emotion: 'neutral'
    }
  },
  'leila-energetic': {
    model: 'bark',
    voice_preset: 'v2/en_speaker_9', // Energetic female
    settings: {
      speed: 1.1,
      pitch: 1.1,
      emotion: 'excited'
    }
  }
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

    const voiceProfile = VOICE_PROFILES[voiceId as keyof typeof VOICE_PROFILES] || VOICE_PROFILES['leila-warm'];
    const ttsModel = TTS_MODELS[voiceProfile.model as keyof typeof TTS_MODELS];

    // Option 1: Use Hugging Face Inference API (free tier available)
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const processedText = preprocessTextForEmotion(text, settings?.emotion || voiceProfile.settings.emotion);
        
        // Call Hugging Face model
        const response = await fetch(`${HUGGINGFACE_API_URL}${ttsModel.model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: processedText,
            parameters: {
              speaker_id: voiceProfile.speaker_id,
              ...voiceProfile.settings
            }
          })
        });

        if (!response.ok) {
          throw new Error(`HF API error: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        
        // Save audio file
        const audioDir = join(process.cwd(), 'public', 'audio', 'generated');
        if (!existsSync(audioDir)) {
          await mkdir(audioDir, { recursive: true });
        }

        const filename = `${uuidv4()}.wav`;
        const filepath = join(audioDir, filename);
        await writeFile(filepath, Buffer.from(audioBuffer));

        return NextResponse.json({
          audioUrl: `/audio/generated/${filename}`,
          duration: estimateDuration(text),
          voiceId: voiceId,
          model: ttsModel.model,
          cached: false
        });

      } catch (error) {
        console.error('Hugging Face API error:', error);
      }
    }

    // Option 2: Use local model server (self-hosted)
    if (process.env.LOCAL_TTS_SERVER_URL) {
      try {
        const response = await fetch(`${process.env.LOCAL_TTS_SERVER_URL}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            voice: voiceProfile,
            settings: settings
          })
        });

        const data = await response.json();
        return NextResponse.json(data);

      } catch (error) {
        console.error('Local TTS server error:', error);
      }
    }

    // Fallback to demo audio
    return NextResponse.json({
      audioUrl: `/audio/samples/${voiceId}.mp3`,
      duration: 5.2,
      voiceId: voiceId,
      cached: true,
      demo: true,
      message: 'Using demo audio. Set HUGGINGFACE_API_KEY or LOCAL_TTS_SERVER_URL for real synthesis.'
    });

  } catch (error) {
    console.error('Voice synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize voice' },
      { status: 500 }
    );
  }
}

// Preprocess text to add emotion markers for supported models
function preprocessTextForEmotion(text: string, emotion: string): string {
  let processed = text;

  // Add natural contractions
  processed = processed
    .replace(/\bI will\b/g, "I'll")
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bI have\b/g, "I've")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bcannot\b/g, "can't");

  // For Bark model, add emotion markers
  if (emotion && ['excited', 'happy', 'sad', 'angry'].includes(emotion)) {
    // Bark understands these annotations
    if (emotion === 'excited') {
      processed = `[laughs] ${processed} [laughs]`;
    } else if (emotion === 'sad') {
      processed = `[sighs] ${processed}`;
    }
  }

  return processed;
}

// Estimate duration based on text length
function estimateDuration(text: string): number {
  // Average speaking rate: ~150 words per minute
  const words = text.split(/\s+/).length;
  const minutes = words / 150;
  return Math.round(minutes * 60 * 10) / 10; // Round to 1 decimal
}