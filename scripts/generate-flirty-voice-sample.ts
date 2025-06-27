#!/usr/bin/env tsx
/**
 * Generate a flirty voice sample using Hugging Face API
 */

import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generateFlirtyVoiceSample() {
  console.log('💕 Generating Leila Flirty Voice Sample...\n');

  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  
  if (!HUGGINGFACE_API_KEY) {
    console.error('❌ HUGGINGFACE_API_KEY not found in environment variables');
    console.log('Please add it to your .env file');
    return;
  }
  
  // Flirty sample text
  const flirtyText = "Hey there gorgeous! I'm Leila, and I'm here to make your home absolutely perfect. What can I do for you today, sweetie?";

  // Using Microsoft SpeechT5 for now (Bark requires different API format)
  const API_URL = 'https://api-inference.huggingface.co/models/microsoft/speecht5_tts';

  try {
    console.log('🎤 Generating audio with flirty characteristics...');
    console.log(`Text: "${flirtyText}"`);

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: flirtyText,
        parameters: {
          speaker_id: 6, // Young female voice
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Save the audio file
    const outputPath = join(
      process.cwd(),
      'public',
      'audio',
      'generated',
      'leila-flirty-sample.wav'
    );

    writeFileSync(outputPath, Buffer.from(audioBuffer));
    console.log(`✅ Audio saved to: ${outputPath}`);

    // Provide voice description
    console.log('\n💕 Voice Characteristics:');
    console.log('- Tone: Playful and charming');
    console.log('- Style: Flirtatious with warm inflections');
    console.log('- Energy: Bubbly and engaging');
    console.log('- Emotion: Friendly with a hint of playfulness');

    console.log('\n📝 Example phrases for Leila Flirty:');
    console.log('1. "Hey cutie! Ready to make your home sparkle?"');
    console.log('2. "Ooh, great choice! I love a person who knows what they want!"');
    console.log('3. "Don\'t worry sweetie, I\'ve got you covered!"');
    console.log('4. "You\'re going to absolutely love what we do for you!"');
    console.log('5. "See you soon, handsome! Can\'t wait to help!"');

  } catch (error) {
    console.error('❌ Error generating voice:', error);
    
    console.log('\n💡 To hear the flirty voice:');
    console.log('1. Make sure HUGGINGFACE_API_KEY is set in .env');
    console.log('2. Run: npm run dev');
    console.log('3. Visit: http://localhost:3000/voice-studio');
    console.log('4. Select "Leila Flirty" and click play!');
  }
}

// Run the generation
generateFlirtyVoiceSample();