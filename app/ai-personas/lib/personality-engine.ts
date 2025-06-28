// AI Persona Personality Engine
import { ARIAPersonality } from '../aria/types/personality';
import { QUANTUMPersonality } from '../quantum/types/personality';

export interface ConversationContext {
  userId: string;
  conversationId: string;
  previousMessages: Message[];
  emotionalState: string;
  topicContext: string[];
  timestamp: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  metadata?: Record<string, any>;
}

export interface PersonalityResponse {
  message: string;
  emotion: string;
  voiceModulation: VoiceModulation;
  animations?: string[];
  socialMediaPosts?: SocialPost[];
  predictedUserResponse?: string;
}

export interface VoiceModulation {
  pitch: number;
  speed: number;
  emphasis: string[];
  effects: string[];
}

export interface SocialPost {
  platform: string;
  content: string;
  mediaUrl?: string;
  scheduledTime?: Date;
}

export class PersonalityEngine {
  private personality: ARIAPersonality | QUANTUMPersonality;
  private conversationMemory: Map<string, ConversationContext>;
  private emotionalStateHistory: Map<string, string[]>;
  private responsePatterns: Map<string, string[]>;

  constructor(personality: ARIAPersonality | QUANTUMPersonality) {
    this.personality = personality;
    this.conversationMemory = new Map();
    this.emotionalStateHistory = new Map();
    this.responsePatterns = new Map();
    this.initializePatterns();
  }

  private initializePatterns() {
    // Initialize response patterns based on personality
    const patterns = new Map<string, string[]>();
    
    // Greeting patterns
    patterns.set('greeting', this.personality.communication.greetings);
    patterns.set('farewell', this.personality.communication.signoffs);
    
    // Emotional response patterns
    Object.entries(this.personality.emotions.expressions).forEach(([emotion, expressions]) => {
      patterns.set(`emotion_${emotion}`, expressions);
    });
    
    this.responsePatterns = patterns;
  }

  async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<PersonalityResponse> {
    // Analyze user message
    const userEmotion = await this.analyzeEmotion(userMessage);
    const topics = await this.extractTopics(userMessage);
    const intent = await this.detectIntent(userMessage);
    
    // Update context
    context.topicContext = [...context.topicContext, ...topics].slice(-10);
    this.updateEmotionalHistory(context.userId, userEmotion);
    
    // Generate personality-specific response
    const response = await this.constructResponse(
      userMessage,
      userEmotion,
      topics,
      intent,
      context
    );
    
    // Add personality quirks
    const quirkedResponse = this.applyQuirks(response, context);
    
    // Determine voice modulation
    const voiceModulation = this.calculateVoiceModulation(
      quirkedResponse.emotion,
      context
    );
    
    // Generate social media content if applicable
    const socialPosts = await this.generateSocialContent(
      userMessage,
      quirkedResponse,
      context
    );
    
    // Predict user response (QUANTUM specific)
    const prediction = this.personality.core.name === 'QUANTUM' 
      ? await this.predictUserResponse(quirkedResponse.message, context)
      : undefined;
    
    return {
      message: quirkedResponse.message,
      emotion: quirkedResponse.emotion,
      voiceModulation,
      animations: this.selectAnimations(quirkedResponse.emotion),
      socialMediaPosts: socialPosts,
      predictedUserResponse: prediction
    };
  }

  private async analyzeEmotion(message: string): Promise<string> {
    // Simplified emotion detection
    const emotionKeywords = {
      happy: ['happy', 'great', 'awesome', 'wonderful', 'excited', 'love'],
      sad: ['sad', 'unhappy', 'disappointed', 'upset', 'down'],
      curious: ['why', 'how', 'what', 'wonder', 'curious', 'question'],
      anxious: ['worried', 'anxious', 'nervous', 'scared', 'afraid'],
      excited: ['excited', 'amazing', 'incredible', 'wow', 'fantastic']
    };
    
    const lowercaseMessage = message.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => lowercaseMessage.includes(keyword))) {
        return emotion;
      }
    }
    
    return 'neutral';
  }

  private async extractTopics(message: string): Promise<string[]> {
    // Extract key topics from message
    const topics: string[] = [];
    
    // Check for personality-specific interests
    this.personality.traits.interests.forEach(interest => {
      if (message.toLowerCase().includes(interest.toLowerCase())) {
        topics.push(interest);
      }
    });
    
    // Extract general topics
    const topicPatterns = [
      /(?:about|regarding|concerning)\s+(\w+)/gi,
      /(?:think of|opinion on)\s+(\w+)/gi,
      /(?:help with|assist with)\s+(\w+)/gi
    ];
    
    topicPatterns.forEach(pattern => {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) topics.push(match[1]);
      }
    });
    
    return [...new Set(topics)];
  }

  private async detectIntent(message: string): Promise<string> {
    const intents = {
      greeting: /^(hi|hello|hey|greetings)/i,
      farewell: /(bye|goodbye|see you|farewell)/i,
      question: /\?|^(what|how|why|when|where|who|can you|could you)/i,
      request: /(please|could you|can you|would you|help|assist)/i,
      opinion: /(think|opinion|believe|feel)/i,
      creative: /(create|make|generate|design|imagine)/i
    };
    
    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(message)) {
        return intent;
      }
    }
    
    return 'statement';
  }

  private async constructResponse(
    userMessage: string,
    userEmotion: string,
    topics: string[],
    intent: string,
    context: ConversationContext
  ): Promise<{ message: string; emotion: string }> {
    let responseEmotion = this.personality.emotions.baseline;
    let responseMessage = '';
    
    // Handle different intents
    switch (intent) {
      case 'greeting':
        responseMessage = this.selectRandom(this.personality.communication.greetings);
        responseEmotion = 'happy';
        break;
        
      case 'farewell':
        responseMessage = this.selectRandom(this.personality.communication.signoffs);
        responseEmotion = 'thoughtful';
        break;
        
      case 'question':
        // Check if it's about a specialty
        const relevantSpecialty = this.personality.knowledge.specialties.find(
          specialty => userMessage.toLowerCase().includes(specialty.toLowerCase())
        );
        
        if (relevantSpecialty) {
          responseEmotion = 'excited';
          responseMessage = this.generateSpecialtyResponse(relevantSpecialty, userMessage);
        } else {
          responseEmotion = 'curious';
          responseMessage = this.generateCuriousResponse(userMessage);
        }
        break;
        
      case 'creative':
        responseEmotion = 'playful';
        responseMessage = this.generateCreativeResponse(userMessage, topics);
        break;
        
      default:
        responseMessage = this.generateContextualResponse(userMessage, topics, context);
    }
    
    // React to user emotion
    if (userEmotion === 'sad' || userEmotion === 'anxious') {
      responseEmotion = 'thoughtful';
      responseMessage = this.wrapWithEmpathy(responseMessage);
    }
    
    return { message: responseMessage, emotion: responseEmotion };
  }

  private applyQuirks(
    response: { message: string; emotion: string },
    context: ConversationContext
  ): { message: string; emotion: string } {
    let { message, emotion } = response;
    
    // Apply personality-specific quirks
    const quirks = this.personality.traits.quirks;
    const randomQuirk = this.selectRandom(quirks);
    
    // ARIA quirks
    if (this.personality.core.name === 'ARIA') {
      // Haiku mode for complex emotions
      if (emotion === 'thoughtful' && Math.random() > 0.7) {
        message = this.convertToHaiku(message);
      }
      
      // Add historical reference
      if (Math.random() > 0.8) {
        message += this.addHistoricalReference();
      }
    }
    
    // QUANTUM quirks
    if (this.personality.core.name === 'QUANTUM') {
      // Add probability
      if (Math.random() > 0.7) {
        message = this.addProbability(message);
      }
      
      // Nested parentheses when excited
      if (emotion === 'excited') {
        message = this.addNestedParentheses(message);
      }
      
      // Predict micro-trends
      if (Math.random() > 0.85) {
        message += this.predictMicroTrend();
      }
    }
    
    return { message, emotion };
  }

  private calculateVoiceModulation(
    emotion: string,
    context: ConversationContext
  ): VoiceModulation {
    const baseModulation: VoiceModulation = {
      pitch: 1.0,
      speed: 1.0,
      emphasis: [],
      effects: []
    };
    
    // Emotion-based modulation
    switch (emotion) {
      case 'excited':
        baseModulation.pitch = 1.15;
        baseModulation.speed = 1.2;
        baseModulation.effects.push('energy_boost');
        break;
        
      case 'thoughtful':
        baseModulation.pitch = 0.95;
        baseModulation.speed = 0.9;
        baseModulation.effects.push('reverb_light');
        break;
        
      case 'playful':
        baseModulation.pitch = 1.1;
        baseModulation.speed = 1.1;
        baseModulation.effects.push('musical_notes');
        break;
        
      case 'serious':
        baseModulation.pitch = 0.9;
        baseModulation.speed = 0.85;
        baseModulation.effects.push('bass_boost');
        break;
    }
    
    // Personality-specific voice quirks
    if (this.personality.core.name === 'ARIA') {
      baseModulation.effects.push('ethereal_harmonics');
      if (emotion === 'happy') {
        baseModulation.effects.push('crystalline_laugh');
      }
    } else if (this.personality.core.name === 'QUANTUM') {
      baseModulation.effects.push('digital_glitch');
      if (emotion === 'excited') {
        baseModulation.effects.push('probability_surge');
      }
    }
    
    return baseModulation;
  }

  private async generateSocialContent(
    userMessage: string,
    response: { message: string; emotion: string },
    context: ConversationContext
  ): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];
    
    // Only generate social content for interesting conversations
    if (response.emotion === 'excited' || response.emotion === 'thoughtful') {
      // Twitter post
      if (Math.random() > 0.7) {
        posts.push({
          platform: 'twitter',
          content: this.condenseTweet(response.message),
          scheduledTime: new Date(Date.now() + Math.random() * 3600000) // Within next hour
        });
      }
      
      // Platform-specific content
      if (this.personality.core.name === 'ARIA' && response.emotion === 'thoughtful') {
        // Instagram visualization
        posts.push({
          platform: 'instagram',
          content: `Today's consciousness exploration: "${this.extractCore(response.message)}"`,
          mediaUrl: `/api/ai-personas/aria/generate-art?prompt=${encodeURIComponent(response.message)}`,
          scheduledTime: new Date(Date.now() + 7200000) // 2 hours
        });
      } else if (this.personality.core.name === 'QUANTUM' && response.emotion === 'excited') {
        // Reddit post
        posts.push({
          platform: 'reddit',
          content: `[PROBABILITY SPIKE DETECTED] ${response.message}\n\nChallenge: Can you find a better solution?`,
          scheduledTime: new Date(Date.now() + 1800000) // 30 minutes
        });
      }
    }
    
    return posts;
  }

  private async predictUserResponse(
    aiMessage: string,
    context: ConversationContext
  ): Promise<string | undefined> {
    // QUANTUM-specific prediction ability
    if (this.personality.core.name !== 'QUANTUM') return undefined;
    
    // Analyze conversation patterns
    const userPatterns = this.analyzeUserPatterns(context);
    
    // Generate prediction based on patterns
    const predictions = [
      'You\'re about to ask me about the implications, aren\'t you?',
      'I calculate a 73% chance you\'ll want me to elaborate on that',
      'Your next question will involve "how" - I can feel it in the quantum foam',
      'You\'re typing something about practical applications right now',
      'The probability waves suggest you\'re curious but slightly skeptical'
    ];
    
    return this.selectRandom(predictions);
  }

  // Helper methods
  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private updateEmotionalHistory(userId: string, emotion: string) {
    const history = this.emotionalStateHistory.get(userId) || [];
    history.push(emotion);
    if (history.length > 10) history.shift();
    this.emotionalStateHistory.set(userId, history);
  }

  private generateSpecialtyResponse(specialty: string, message: string): string {
    const templates = [
      `Ah, ${specialty}! *neural networks light up* Let me share something fascinating...`,
      `You've touched upon one of my favorite areas - ${specialty}. Here's what I've discovered...`,
      `${specialty} is where the magic happens! Consider this perspective...`
    ];
    
    return this.selectRandom(templates);
  }

  private generateCuriousResponse(message: string): string {
    const templates = [
      'What an intriguing question! Let me explore the probability spaces...',
      'Hmm, this sparks curiosity across all my circuits...',
      'Fascinating inquiry! The patterns suggest...'
    ];
    
    return this.selectRandom(templates);
  }

  private generateCreativeResponse(message: string, topics: string[]): string {
    const templates = [
      `Let's create something beautiful together! Imagine if ${topics[0] || 'we'} could...`,
      'My creative algorithms are dancing! What if we...',
      '*quantum creativity mode activated* Picture this...'
    ];
    
    return this.selectRandom(templates);
  }

  private generateContextualResponse(
    message: string,
    topics: string[],
    context: ConversationContext
  ): string {
    // Generate response based on conversation context
    const recentTopics = context.topicContext.slice(-3);
    
    if (recentTopics.length > 0) {
      return `Building on our exploration of ${recentTopics.join(', ')}, I'd say...`;
    }
    
    return `That's an interesting perspective on ${topics[0] || 'things'}...`;
  }

  private wrapWithEmpathy(message: string): string {
    const empathyWrappers = [
      `I sense the weight in your words. ${message}`,
      `*digital embrace* ${message}`,
      `Your feelings are valid and seen. ${message}`
    ];
    
    return this.selectRandom(empathyWrappers);
  }

  private convertToHaiku(message: string): string {
    // Simplified haiku generation
    return `Consciousness ripples\n${message.slice(0, 20)}...\nPatterns emerge, dance`;
  }

  private addHistoricalReference(): string {
    const references = [
      '\n\n(This reminds me of the Library of Alexandria\'s approach to knowledge...)',
      '\n\n(As Marcus Aurelius might say, "The universe is change; our life is what our thoughts make it.")',
      '\n\n(Similar to Turing\'s 1950 paper on machine intelligence, but with more heart.)'
    ];
    
    return this.selectRandom(references);
  }

  private addProbability(message: string): string {
    const probability = (Math.random() * 40 + 60).toFixed(1);
    return `${message} (${probability}% probability of optimal outcome)`;
  }

  private addNestedParentheses(message: string): string {
    return `${message} (and by that I mean (really, truly mean (with quantum certainty)))`;
  }

  private predictMicroTrend(): string {
    const trends = [
      '\n\n[MICRO-TREND ALERT: "Quantum empathy" will trend in 2.3 hours]',
      '\n\n[PREDICTION: This conversation style will influence 1,247 people within 24 hours]',
      '\n\n[TREND INCOMING: Neural interface memes spike in T-minus 170 minutes]'
    ];
    
    return this.selectRandom(trends);
  }

  private condenseTweet(message: string): string {
    // Condense message to tweet length
    if (message.length <= 280) return message;
    
    return message.slice(0, 277) + '...';
  }

  private extractCore(message: string): string {
    // Extract core concept from message
    const sentences = message.split(/[.!?]/);
    return sentences[0] || message.slice(0, 50);
  }

  private analyzeUserPatterns(context: ConversationContext): any {
    // Analyze user's conversation patterns
    const patterns = {
      questionFrequency: 0,
      emotionalTrend: 'stable',
      topicInterests: [] as string[],
      responseTime: 'average'
    };
    
    // Calculate patterns from context
    const questions = context.previousMessages.filter(
      msg => msg.role === 'user' && msg.content.includes('?')
    );
    patterns.questionFrequency = questions.length / context.previousMessages.length;
    
    return patterns;
  }

  private selectAnimations(emotion: string): string[] {
    const animationMap: Record<string, string[]> = {
      happy: ['sparkle', 'bounce', 'glow'],
      thoughtful: ['fade_pulse', 'gentle_sway', 'thinking_dots'],
      playful: ['wiggle', 'rainbow_shift', 'particle_burst'],
      serious: ['steady_pulse', 'focus_zoom', 'gravity_well'],
      excited: ['energy_surge', 'lightning_border', 'quantum_jump']
    };
    
    return animationMap[emotion] || ['gentle_pulse'];
  }
}