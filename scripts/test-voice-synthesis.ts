#!/usr/bin/env tsx
/**
 * Test script for voice synthesis
 */

async function testVoiceSynthesis() {
  console.log('🎤 Testing Hey Leila Voice Synthesis...\n');

  const testPhrases = [
    {
      text: "Hi! I'm Leila, your home service assistant. How can I help you today?",
      voiceId: 'leila-warm',
      emotion: 'friendly'
    },
    {
      text: "Perfect! I've booked your house cleaning for tomorrow at 2 PM.",
      voiceId: 'leila-professional',
      emotion: 'professional'
    }
  ];

  for (const phrase of testPhrases) {
    console.log(`Testing: "${phrase.text}"`);
    console.log(`Voice: ${phrase.voiceId}, Emotion: ${phrase.emotion}`);

    try {
      const response = await fetch('http://localhost:3000/api/voice/synthesize-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: phrase.text,
          voiceId: phrase.voiceId,
          settings: { emotion: phrase.emotion }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Success:', result);
      console.log(`   Audio URL: ${result.audioUrl}`);
      console.log(`   Duration: ${result.duration}s`);
      console.log(`   Model: ${result.model || 'demo'}\n`);

    } catch (error) {
      console.error('❌ Error:', error.message);
      console.log('   Make sure the dev server is running: npm run dev\n');
    }
  }

  console.log('Test complete!');
  console.log('\nTo use in production:');
  console.log('1. The Hugging Face API key is already configured');
  console.log('2. Visit http://localhost:3000/voice-studio to test voices');
  console.log('3. For better performance, run the local TTS server');
}

// Run the test
testVoiceSynthesis().catch(console.error);