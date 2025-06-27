import { LeilaAIAgent } from './ai-agent';

interface VoiceCommand {
  transcript: string;
  confidence: number;
  timestamp: Date;
  action?: string;
  parameters?: Record<string, any>;
}

export class VoiceControl {
  private recognition: any;
  private synthesis: SpeechSynthesisUtterance;
  private isListening: boolean = false;
  private aiAgent: LeilaAIAgent;
  private wakeWordDetected: boolean = false;
  private wakeWordTimeout: NodeJS.Timeout | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.aiAgent = new LeilaAIAgent();
    this.synthesis = new SpeechSynthesisUtterance();
    this.initializeVoiceRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;

    // Handle results
    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.toLowerCase();
      const confidence = event.results[last][0].confidence;

      console.log('Heard:', transcript, 'Confidence:', confidence);

      if (this.detectWakeWord(transcript)) {
        this.handleWakeWord();
      } else if (this.wakeWordDetected) {
        this.handleCommand(transcript, confidence);
      }
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        this.restart();
      }
    };

    // Auto-restart on end
    this.recognition.onend = () => {
      if (this.isListening) {
        this.restart();
      }
    };
  }

  private initializeSpeechSynthesis() {
    // Configure voice
    this.synthesis.rate = 1.0;
    this.synthesis.pitch = 1.0;
    this.synthesis.volume = 1.0;

    // Select a female voice if available
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Victoria') ||
      voice.name.includes('Karen')
    );

    if (femaleVoice) {
      this.synthesis.voice = femaleVoice;
    }
  }

  private detectWakeWord(transcript: string): boolean {
    const wakeWords = ['hey leila', 'hi leila', 'hello leila', 'okay leila', 'leila'];
    return wakeWords.some(word => transcript.includes(word));
  }

  private handleWakeWord() {
    this.wakeWordDetected = true;
    this.playActivationSound();
    this.speak("I'm listening. How can I help you?");

    // Reset wake word after 10 seconds of inactivity
    if (this.wakeWordTimeout) {
      clearTimeout(this.wakeWordTimeout);
    }
    this.wakeWordTimeout = setTimeout(() => {
      this.wakeWordDetected = false;
      this.playDeactivationSound();
    }, 10000);
  }

  private async handleCommand(transcript: string, confidence: number) {
    // Reset wake word timeout
    if (this.wakeWordTimeout) {
      clearTimeout(this.wakeWordTimeout);
      this.wakeWordTimeout = setTimeout(() => {
        this.wakeWordDetected = false;
        this.playDeactivationSound();
      }, 10000);
    }

    // Process command with AI agent
    const response = await this.aiAgent.processMessage(transcript);
    
    // Speak the response
    this.speak(response.message);

    // Execute any actions
    if (response.actions && response.actions.length > 0) {
      this.executeVoiceActions(response.actions);
    }
  }

  private executeVoiceActions(actions: any[]) {
    actions.forEach(action => {
      switch (action.type) {
        case 'booking':
          this.navigateTo('/book', action.data);
          break;
        case 'navigation':
          this.navigateTo(action.data.path);
          break;
        case 'information':
          // Information already spoken
          break;
        default:
          console.log('Unknown action:', action);
      }
    });
  }

  private navigateTo(path: string, params?: any) {
    if (params) {
      // Store params in session storage for the page to retrieve
      sessionStorage.setItem('voiceCommandParams', JSON.stringify(params));
    }
    window.location.href = path;
  }

  // Text-to-Speech
  speak(text: string) {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    this.synthesis.text = text;
    speechSynthesis.speak(this.synthesis);
  }

  // Voice activation sounds
  private playActivationSound() {
    this.playTone(600, 0.1);
    setTimeout(() => this.playTone(800, 0.1), 100);
  }

  private playDeactivationSound() {
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(600, 0.1), 100);
  }

  private playTone(frequency: number, duration: number) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Control methods
  async start() {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.isListening = true;
      this.recognition.start();
      console.log('Voice control started');
      
      // Initial greeting
      this.speak("Voice control activated. Say 'Hey Leila' to get started.");
    } catch (error) {
      console.error('Failed to start voice control:', error);
      this.speak("I couldn't access the microphone. Please check your permissions.");
    }
  }

  stop() {
    this.isListening = false;
    this.wakeWordDetected = false;
    
    if (this.recognition) {
      this.recognition.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.wakeWordTimeout) {
      clearTimeout(this.wakeWordTimeout);
      this.wakeWordTimeout = null;
    }
    
    console.log('Voice control stopped');
  }

  private restart() {
    if (this.isListening) {
      setTimeout(() => {
        this.recognition.start();
      }, 100);
    }
  }

  // Voice command patterns
  private commandPatterns = {
    booking: {
      patterns: [
        /book (a |an )?(.*) service/i,
        /i need (a |an )?(.*)/i,
        /schedule (a |an )?(.*)/i,
        /get me (a |an )?(.*)/i
      ],
      handler: (matches: RegExpMatchArray) => ({
        action: 'booking',
        service: matches[2] || matches[1]
      })
    },
    emergency: {
      patterns: [
        /emergency/i,
        /urgent/i,
        /right now/i,
        /immediately/i
      ],
      handler: () => ({
        action: 'booking',
        urgency: 'emergency'
      })
    },
    status: {
      patterns: [
        /status/i,
        /where is/i,
        /track/i,
        /when will/i
      ],
      handler: () => ({
        action: 'status'
      })
    },
    navigation: {
      patterns: [
        /go to (.*)/i,
        /open (.*)/i,
        /show me (.*)/i,
        /take me to (.*)/i
      ],
      handler: (matches: RegExpMatchArray) => ({
        action: 'navigation',
        destination: matches[1]
      })
    },
    help: {
      patterns: [
        /help/i,
        /what can you do/i,
        /commands/i,
        /how do i/i
      ],
      handler: () => ({
        action: 'help'
      })
    }
  };

  // Get voice command suggestions
  getVoiceCommands(): string[] {
    return [
      "Hey Leila, book a plumbing service",
      "Hey Leila, I need an electrician urgently",
      "Hey Leila, show me my bookings",
      "Hey Leila, track my service",
      "Hey Leila, what's the status of my booking?",
      "Hey Leila, schedule a cleaning for tomorrow",
      "Hey Leila, find me a handyman",
      "Hey Leila, emergency plumbing service",
      "Hey Leila, go to my dashboard",
      "Hey Leila, what can you do?"
    ];
  }
}

// Singleton instance
let voiceControlInstance: VoiceControl | null = null;

export function getVoiceControl(): VoiceControl {
  if (!voiceControlInstance) {
    voiceControlInstance = new VoiceControl();
  }
  return voiceControlInstance;
}