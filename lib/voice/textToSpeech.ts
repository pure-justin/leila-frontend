interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

// Cache for available voices
let cachedVoices: SpeechSynthesisVoice[] = [];

// Get available voices
export async function getVoices(): Promise<SpeechSynthesisVoice[]> {
  if (cachedVoices.length > 0) {
    return cachedVoices;
  }

  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
    } else {
      // Wait for voices to load
      speechSynthesis.addEventListener('voiceschanged', () => {
        cachedVoices = speechSynthesis.getVoices();
        resolve(cachedVoices);
      }, { once: true });
    }
  });
}

// Get the best available voice
export async function getBestVoice(preferredLang = 'en-US'): Promise<SpeechSynthesisVoice | null> {
  const voices = await getVoices();
  
  // Try to find a female voice in the preferred language
  const femaleVoice = voices.find(voice => 
    voice.lang.startsWith(preferredLang.split('-')[0]) && 
    (voice.name.toLowerCase().includes('female') || 
     voice.name.toLowerCase().includes('samantha') ||
     voice.name.toLowerCase().includes('victoria') ||
     voice.name.toLowerCase().includes('karen'))
  );
  
  if (femaleVoice) return femaleVoice;
  
  // Fallback to any voice in the preferred language
  const langVoice = voices.find(voice => 
    voice.lang.startsWith(preferredLang.split('-')[0])
  );
  
  if (langVoice) return langVoice;
  
  // Final fallback to default voice
  return voices[0] || null;
}

// Main speak function
export async function speak(
  text: string, 
  options: SpeakOptions = {}
): Promise<void> {
  // Check if speech synthesis is supported
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice
  const voice = options.voice || await getBestVoice();
  if (voice) {
    utterance.voice = voice;
  }
  
  // Set speech parameters
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  // Return promise that resolves when speech ends
  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      reject(event);
    };
    
    // Speak
    speechSynthesis.speak(utterance);
  });
}

// Stop speaking
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

// Check if currently speaking
export function isSpeaking(): boolean {
  if ('speechSynthesis' in window) {
    return speechSynthesis.speaking;
  }
  return false;
}

// Pause speech
export function pauseSpeech(): void {
  if ('speechSynthesis' in window && speechSynthesis.speaking) {
    speechSynthesis.pause();
  }
}

// Resume speech
export function resumeSpeech(): void {
  if ('speechSynthesis' in window && speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}