import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

interface VoiceConfig {
  language: string;
  accent?: string;
  speed: number;
  pitch: number;
  volume: number;
}

interface ConversationContext {
  sessionId: string;
  userId: string;
  language: string;
  previousMessages: Message[];
  userPreferences: UserPreferences;
  currentIntent?: string;
  entities: Record<string, any>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  language: string;
  timestamp: Date;
  intent?: string;
}

interface UserPreferences {
  preferredLanguage: string;
  communicationStyle: 'formal' | 'casual' | 'friendly';
  responseLength: 'brief' | 'detailed';
  proactiveHelp: boolean;
}

export class AdvancedVoiceService {
  private contextStore = new Map<string, ConversationContext>();
  private supportedLanguages = [
    'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'ja-JP',
    'ko-KR', 'zh-CN', 'zh-TW', 'ar-SA', 'hi-IN', 'bn-BD', 'pa-IN', 'te-IN',
    'mr-IN', 'ta-IN', 'ur-PK', 'gu-IN', 'kn-IN', 'ml-IN', 'th-TH', 'vi-VN',
    'id-ID', 'ms-MY', 'fil-PH', 'nl-NL', 'sv-SE', 'no-NO', 'da-DK', 'fi-FI',
    'pl-PL', 'ro-RO', 'hu-HU', 'cs-CZ', 'sk-SK', 'bg-BG', 'hr-HR', 'sr-RS',
    'sl-SI', 'et-EE', 'lv-LV', 'lt-LT', 'uk-UA', 'be-BY', 'kk-KZ', 'uz-UZ',
    'ky-KG', 'tg-TJ', 'tk-TM', 'az-AZ', 'hy-AM', 'ka-GE', 'he-IW', 'yi-YD',
    'mt-MT', 'eu-ES', 'ca-ES', 'gl-ES', 'cy-GB', 'ga-IE', 'gd-GB', 'is-IS',
    'sq-AL', 'mk-MK', 'bs-BA', 'me-ME', 'tr-TR', 'ku-TR', 'el-GR', 'fa-IR',
    'ps-AF', 'sd-PK', 'ne-NP', 'si-LK', 'my-MM', 'km-KH', 'lo-LA', 'mn-MN',
    'am-ET', 'ti-ET', 'so-SO', 'sw-KE', 'rw-RW', 'yo-NG', 'ig-NG', 'ha-NG',
    'zu-ZA', 'xh-ZA', 'af-ZA', 'st-ZA', 'tn-ZA', 'ts-ZA', 've-ZA', 'nso-ZA',
    'ss-ZA', 'nr-ZA', 'nd-ZW', 'sn-ZW', 'ny-MW', 'bem-ZM', 'toi-ZM', 'loz-ZM'
  ]; // 100+ languages

  private model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
    }
  });

  /**
   * Initialize multi-language speech recognition
   */
  async initializeRecognition(config: VoiceConfig): Promise<any> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = config.language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    // Advanced configuration
    if ('grammars' in recognition) {
      // Add context-aware grammars for better recognition
      const grammar = this.generateContextGrammar(config.language);
      const speechRecognitionList = new (window as any).webkitSpeechGrammarList();
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    return recognition;
  }

  /**
   * Process voice input with language detection and translation
   */
  async processVoiceInput(
    audio: ArrayBuffer, 
    sessionId: string,
    detectedLanguage?: string
  ): Promise<{
    text: string;
    language: string;
    intent: string;
    response: string;
    suggestions: string[];
  }> {
    // Get or create context
    const context = this.getOrCreateContext(sessionId);

    // Language detection if not provided
    const language = detectedLanguage || await this.detectLanguage(audio);
    
    // Update context language if changed
    if (language !== context.language) {
      context.language = language;
      this.contextStore.set(sessionId, context);
    }

    // Transcribe audio
    const transcription = await this.transcribeAudio(audio, language);

    // Process with context preservation
    const response = await this.processWithContext(transcription, context);

    // Generate proactive suggestions
    const suggestions = await this.generateProactiveSuggestions(context);

    return {
      text: transcription,
      language,
      intent: response.intent,
      response: response.text,
      suggestions
    };
  }

  /**
   * Detect language from audio
   */
  private async detectLanguage(audio: ArrayBuffer): Promise<string> {
    // In production, use Google Cloud Speech-to-Text language detection
    // For now, analyze audio characteristics
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(audio);
    
    // Analyze frequency patterns for language hints
    // This is simplified - real implementation would use ML model
    return 'en-US'; // Default fallback
  }

  /**
   * Transcribe audio in detected language
   */
  private async transcribeAudio(audio: ArrayBuffer, language: string): Promise<string> {
    // In production, use Google Cloud Speech-to-Text
    // This is a placeholder for the actual implementation
    return "Transcribed text would appear here";
  }

  /**
   * Process with context preservation
   */
  private async processWithContext(
    text: string, 
    context: ConversationContext
  ): Promise<{ text: string; intent: string }> {
    // Build context-aware prompt
    const prompt = `
You are Leila, a multilingual AI assistant for home services.
Current language: ${context.language}
User preferences: ${JSON.stringify(context.userPreferences)}

Conversation history:
${context.previousMessages.slice(-5).map(m => 
  `${m.role}: ${m.content}`
).join('\n')}

Current message: ${text}

Respond in ${context.language} with:
1. Natural, culturally appropriate response
2. Identified intent
3. Maintain conversation context
4. Style: ${context.userPreferences.communicationStyle}
5. Length: ${context.userPreferences.responseLength}

Response format:
{
  "text": "response in target language",
  "intent": "identified intent",
  "entities": {}
}`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    try {
      const parsed = JSON.parse(responseText.match(/\{[\s\S]*\}/)?.[0] || '{}');
      
      // Update context
      context.previousMessages.push({
        role: 'user',
        content: text,
        language: context.language,
        timestamp: new Date()
      });
      
      context.previousMessages.push({
        role: 'assistant',
        content: parsed.text,
        language: context.language,
        timestamp: new Date(),
        intent: parsed.intent
      });

      // Keep conversation history manageable
      if (context.previousMessages.length > 20) {
        context.previousMessages = context.previousMessages.slice(-20);
      }

      this.contextStore.set(context.sessionId, context);

      return parsed;
    } catch (error) {
      return {
        text: "I understand. How can I help you?",
        intent: "unknown"
      };
    }
  }

  /**
   * Generate proactive suggestions based on context
   */
  private async generateProactiveSuggestions(
    context: ConversationContext
  ): Promise<string[]> {
    if (!context.userPreferences.proactiveHelp) {
      return [];
    }

    const prompt = `
Based on this conversation context, suggest 3 helpful follow-up actions:
Language: ${context.language}
Recent topics: ${context.previousMessages.slice(-3).map(m => m.content).join(', ')}
Current intent: ${context.currentIntent}

Provide suggestions in ${context.language} that would be helpful for home services.
Format: JSON array of strings
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const suggestions = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]');
      return suggestions.slice(0, 3);
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate context-aware grammar for better recognition
   */
  private generateContextGrammar(language: string): string {
    // JSGF grammar format
    const serviceTerms = {
      'en-US': ['plumbing', 'electrical', 'HVAC', 'cleaning', 'repair'],
      'es-ES': ['fontanería', 'electricidad', 'climatización', 'limpieza', 'reparación'],
      'fr-FR': ['plomberie', 'électricité', 'climatisation', 'nettoyage', 'réparation'],
      // Add more languages
    };

    const terms = serviceTerms[language] || serviceTerms['en-US'];
    
    return `#JSGF V1.0;
grammar services;
public <service> = ${terms.join(' | ')};
public <command> = book <service> | need <service> | fix <service>;`;
  }

  /**
   * Get or create conversation context
   */
  private getOrCreateContext(sessionId: string): ConversationContext {
    if (this.contextStore.has(sessionId)) {
      return this.contextStore.get(sessionId)!;
    }

    const newContext: ConversationContext = {
      sessionId,
      userId: '', // Set from auth
      language: 'en-US',
      previousMessages: [],
      userPreferences: {
        preferredLanguage: 'en-US',
        communicationStyle: 'friendly',
        responseLength: 'detailed',
        proactiveHelp: true
      },
      entities: {}
    };

    this.contextStore.set(sessionId, newContext);
    return newContext;
  }

  /**
   * Text-to-speech with accent adaptation
   */
  async synthesizeSpeech(
    text: string, 
    language: string,
    accent?: string
  ): Promise<ArrayBuffer> {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Find voice with specific accent
    const voices = speechSynthesis.getVoices();
    const targetVoice = voices.find(voice => 
      voice.lang === language && 
      (accent ? voice.name.includes(accent) : true)
    );
    
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    // Advanced voice configuration
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return new Promise((resolve, reject) => {
      // In production, use Google Cloud Text-to-Speech for better quality
      speechSynthesis.speak(utterance);
      
      // Simulate audio buffer return
      setTimeout(() => {
        resolve(new ArrayBuffer(0)); // Placeholder
      }, 1000);
    });
  }

  /**
   * Real-time translation
   */
  async translateMessage(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    const prompt = `
Translate this message from ${fromLang} to ${toLang}:
"${text}"

Provide natural, culturally appropriate translation for home services context.
Keep technical terms accurate.
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^"|"$/g, '');
  }

  /**
   * Accent adaptation for better understanding
   */
  async adaptToAccent(
    audioFeatures: Float32Array,
    detectedAccent: string
  ): Promise<Float32Array> {
    // In production, use ML model to adapt to specific accents
    // This improves recognition accuracy for non-native speakers
    return audioFeatures; // Placeholder
  }

  /**
   * Cultural context adaptation
   */
  async adaptCulturalContext(
    message: string,
    culture: string
  ): Promise<string> {
    const prompt = `
Adapt this message for ${culture} cultural context:
"${message}"

Consider:
- Politeness levels
- Cultural sensitivities
- Local customs
- Appropriate greetings
`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

// Export singleton
export const advancedVoice = new AdvancedVoiceService();