// Leila Voice Integration
// Unified voice interface for the Leila assistant across all platforms

export interface LeilaVoiceConfig {
  provider: 'huggingface' | 'elevenlabs' | 'local';
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
  emotion?: 'neutral' | 'friendly' | 'excited' | 'concerned' | 'professional';
}

export interface VoiceResponse {
  audioUrl?: string;
  audioData?: ArrayBuffer;
  duration: number;
  transcript: string;
}

export class LeilaVoice {
  private config: LeilaVoiceConfig;
  private audioContext?: AudioContext;
  private currentAudio?: HTMLAudioElement;

  constructor(config?: Partial<LeilaVoiceConfig>) {
    this.config = {
      provider: 'huggingface',
      voiceId: 'leila-flirty',
      language: 'en-US',
      speed: 1.05,
      pitch: 1.15,
      emotion: 'friendly',
      ...config
    };

    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Main method to speak text
  async speak(text: string, options?: Partial<LeilaVoiceConfig>): Promise<VoiceResponse> {
    const config = { ...this.config, ...options };
    
    try {
      // Stop any current playback
      this.stop();

      // Get audio based on provider
      let response: VoiceResponse;
      
      switch (config.provider) {
        case 'huggingface':
          response = await this.synthesizeWithHuggingFace(text, config);
          break;
        case 'local':
          response = await this.synthesizeLocally(text, config);
          break;
        case 'elevenlabs':
          response = await this.synthesizeWithElevenLabs(text, config);
          break;
        default:
          throw new Error(`Unknown provider: ${config.provider}`);
      }

      // Play the audio
      if (response.audioUrl) {
        await this.playAudio(response.audioUrl);
      } else if (response.audioData) {
        await this.playAudioData(response.audioData);
      }

      return response;
    } catch (error) {
      console.error('Leila voice error:', error);
      throw error;
    }
  }

  // Stop current playback
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = undefined;
    }
  }

  // Synthesize with Hugging Face
  private async synthesizeWithHuggingFace(
    text: string, 
    config: LeilaVoiceConfig
  ): Promise<VoiceResponse> {
    const response = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: config.voiceId,
        speed: config.speed,
        pitch: config.pitch,
        emotion: config.emotion
      })
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize voice');
    }

    const data = await response.json();
    return {
      audioUrl: data.audioUrl,
      duration: data.duration,
      transcript: text
    };
  }

  // Synthesize locally
  private async synthesizeLocally(
    text: string,
    config: LeilaVoiceConfig
  ): Promise<VoiceResponse> {
    const response = await fetch('/api/voice/synthesize-local', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: config.voiceId,
        settings: {
          speed: config.speed,
          pitch: config.pitch,
          emotion: config.emotion
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize voice locally');
    }

    const audioData = await response.arrayBuffer();
    
    // Calculate approximate duration
    const duration = audioData.byteLength / (16000 * 2); // 16kHz, 16-bit audio

    return {
      audioData,
      duration,
      transcript: text
    };
  }

  // Synthesize with ElevenLabs
  private async synthesizeWithElevenLabs(
    text: string,
    config: LeilaVoiceConfig
  ): Promise<VoiceResponse> {
    const response = await fetch('/api/voice/synthesize-elevenlabs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: config.voiceId,
        modelId: 'eleven_turbo_v2',
        voiceSettings: {
          stability: 0.75,
          similarityBoost: 0.85,
          style: config.emotion === 'friendly' ? 0.5 : 0,
          useSpeakerBoost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to synthesize with ElevenLabs');
    }

    const audioData = await response.arrayBuffer();
    
    return {
      audioData,
      duration: audioData.byteLength / (44100 * 2), // 44.1kHz, 16-bit audio
      transcript: text
    };
  }

  // Play audio from URL
  private async playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(url);
      this.currentAudio.playbackRate = this.config.speed;
      
      this.currentAudio.addEventListener('ended', () => resolve());
      this.currentAudio.addEventListener('error', reject);
      
      this.currentAudio.play().catch(reject);
    });
  }

  // Play audio from ArrayBuffer
  private async playAudioData(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    const audioBuffer = await this.audioContext.decodeAudioData(audioData);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = this.config.speed;
    
    source.connect(this.audioContext.destination);
    
    return new Promise((resolve) => {
      source.addEventListener('ended', () => resolve());
      source.start();
    });
  }

  // Get available voices
  static async getAvailableVoices(): Promise<VoiceOption[]> {
    const response = await fetch('/api/voice/voices');
    const data = await response.json();
    return data.voices;
  }

  // Voice activity detection for wake word
  async startWakeWordDetection(onWakeWord: () => void): Promise<() => void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Voice input not supported');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    let audioChunks: Blob[] = [];

    mediaRecorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener('stop', async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioChunks = [];

      // Send to wake word detection
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/voice/wake-word', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.detected) {
        onWakeWord();
      }
    });

    // Start recording in chunks
    mediaRecorder.start(1000); // 1 second chunks

    // Return cleanup function
    return () => {
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
    };
  }

  // Preset responses for common interactions
  async greet(): Promise<VoiceResponse> {
    const greetings = [
      "Hey there! I'm Leila, your home service assistant. How can I make your day better?",
      "Hi! It's Leila. Ready to help you with any home service you need!",
      "Hello! I'm Leila, and I'm here to make home services super easy for you.",
      "Hey! Leila here. What can I help you with today?"
    ];

    const text = greetings[Math.floor(Math.random() * greetings.length)];
    return this.speak(text, { emotion: 'friendly' });
  }

  async confirmBooking(service: string, time: string): Promise<VoiceResponse> {
    const text = `Perfect! I've booked your ${service} for ${time}. You'll get a confirmation text shortly. Anything else I can help with?`;
    return this.speak(text, { emotion: 'professional' });
  }

  async handleError(): Promise<VoiceResponse> {
    const text = "Oops, something went wrong. Let me try that again for you.";
    return this.speak(text, { emotion: 'concerned' });
  }

  async sayGoodbye(): Promise<VoiceResponse> {
    const farewells = [
      "Thanks for using Leila! Have a wonderful day!",
      "Bye for now! Remember, I'm always here when you need home services!",
      "Take care! Can't wait to help you again soon!"
    ];

    const text = farewells[Math.floor(Math.random() * farewells.length)];
    return this.speak(text, { emotion: 'friendly' });
  }
}

// Voice option interface
export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: string;
  provider: string;
  previewUrl?: string;
}

// Export singleton instance for easy use
export const leilaVoice = new LeilaVoice();

// React hook for voice integration
export function useLeilaVoice(config?: Partial<LeilaVoiceConfig>) {
  const voice = new LeilaVoice(config);

  return {
    speak: (text: string, options?: Partial<LeilaVoiceConfig>) => voice.speak(text, options),
    stop: () => voice.stop(),
    greet: () => voice.greet(),
    confirmBooking: (service: string, time: string) => voice.confirmBooking(service, time),
    handleError: () => voice.handleError(),
    sayGoodbye: () => voice.sayGoodbye()
  };
}