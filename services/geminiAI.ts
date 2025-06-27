import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with Tier 3 API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export interface AIResponse {
  text: string;
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  suggestedActions?: string[];
}

export interface VisionAnalysis {
  description: string;
  issues: string[];
  estimatedCost: { min: number; max: number };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  suggestedServices: string[];
}

export class GeminiAIService {
  private model;
  private visionModel;
  
  constructor() {
    // Gemini 2.0 Flash for multimodal capabilities
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Vision model for image analysis
    this.visionModel = genAI.getGenerativeModel({ 
      model: "gemini-pro-vision" 
    });
  }
  
  /**
   * Process natural language commands with intent recognition
   */
  async processVoiceCommand(command: string, context?: any): Promise<AIResponse> {
    const prompt = `
You are Leila, an AI assistant for home services. Analyze this command and provide a structured response.

Command: "${command}"
Context: ${JSON.stringify(context || {})}

Respond in JSON format:
{
  "text": "Natural response to the user",
  "intent": "book_service|get_quote|check_status|find_contractor|emergency|other",
  "entities": {
    "service_type": "plumbing|electrical|hvac|cleaning|etc",
    "urgency": "immediate|today|this_week|flexible",
    "location": "extracted location if any",
    "issue": "specific problem mentioned"
  },
  "confidence": 0.0-1.0,
  "suggestedActions": ["action1", "action2"]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback response
      return {
        text: "I understand you need help. Could you please tell me more about what service you're looking for?",
        intent: "other",
        entities: {},
        confidence: 0.5,
        suggestedActions: ["Browse Services", "Emergency Help", "Get Quote"]
      };
    } catch (error) {
      console.error('Error processing voice command:', error);
      throw error;
    }
  }
  
  /**
   * Analyze images for damage assessment and service recommendations
   */
  async analyzeImage(imageBase64: string, description?: string): Promise<VisionAnalysis> {
    const prompt = `
Analyze this image of a potential home service issue. ${description ? `User description: ${description}` : ''}

Provide a detailed analysis:
1. Describe what you see
2. Identify any issues or problems
3. Estimate repair/service costs (USD)
4. Assess urgency level
5. Recommend appropriate services

Respond in JSON format:
{
  "description": "detailed description",
  "issues": ["issue1", "issue2"],
  "estimatedCost": { "min": 0, "max": 0 },
  "urgency": "low|medium|high|critical",
  "suggestedServices": ["service1", "service2"]
}`;

    try {
      const image = {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: "image/jpeg"
        }
      };
      
      const result = await this.visionModel.generateContent([prompt, image]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback response
      return {
        description: "Unable to fully analyze the image",
        issues: ["Please provide more details"],
        estimatedCost: { min: 50, max: 500 },
        urgency: "medium",
        suggestedServices: ["General Handyman", "Home Inspector"]
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }
  
  /**
   * Generate real-time responses for conversation
   */
  async streamResponse(prompt: string, onChunk: (text: string) => void): Promise<void> {
    try {
      const result = await this.model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        onChunk(chunkText);
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      throw error;
    }
  }
  
  /**
   * Predict maintenance needs based on home data
   */
  async predictMaintenance(homeData: any): Promise<any> {
    const prompt = `
Based on this home data, predict upcoming maintenance needs:
${JSON.stringify(homeData)}

Consider:
- Age of systems
- Last service dates
- Seasonal factors
- Common failure patterns

Provide predictions with timeframes and estimated costs.`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIService();