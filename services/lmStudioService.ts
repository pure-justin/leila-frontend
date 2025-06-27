/**
 * LM Studio Integration Service
 * Offloads routine tasks to local LLMs for efficiency
 */

interface LMStudioModel {
  id: string;
  object: string;
  owned_by: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface TaskType {
  name: string;
  model: string;
  systemPrompt: string;
}

export class LMStudioService {
  private baseUrl = 'http://localhost:1234/v1';
  private availableModels: LMStudioModel[] = [];
  
  // Task configurations for different local models
  private taskConfigs: Record<string, TaskType> = {
    codeGeneration: {
      name: 'Code Generation',
      model: 'deepseek/deepseek-r1-0528-qwen3-8b',
      systemPrompt: 'You are a code generation assistant. Generate clean, efficient code based on requirements.'
    },
    dataProcessing: {
      name: 'Data Processing',
      model: 'google/gemma-3-4b',
      systemPrompt: 'You are a data processing assistant. Transform and analyze data efficiently.'
    },
    documentation: {
      name: 'Documentation',
      model: 'llama-4-scout-17b-6e-instruct-i1',
      systemPrompt: 'You are a documentation assistant. Write clear, comprehensive documentation.'
    },
    embeddings: {
      name: 'Text Embeddings',
      model: 'text-embedding-nomic-embed-text-v1.5',
      systemPrompt: ''
    }
  };

  constructor() {
    this.loadModels();
  }

  /**
   * Load available models from LM Studio
   */
  async loadModels(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      const data = await response.json();
      this.availableModels = data.data;
      console.log('LM Studio models loaded:', this.availableModels.map(m => m.id));
    } catch (error) {
      console.error('Failed to load LM Studio models:', error);
    }
  }

  /**
   * Generate code using DeepSeek
   */
  async generateCode(prompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.taskConfigs.codeGeneration.systemPrompt
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return this.callModel(this.taskConfigs.codeGeneration.model, messages);
  }

  /**
   * Process data using Gemma
   */
  async processData(data: any, instructions: string): Promise<any> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.taskConfigs.dataProcessing.systemPrompt
      },
      {
        role: 'user',
        content: `Data: ${JSON.stringify(data)}\n\nInstructions: ${instructions}`
      }
    ];

    const result = await this.callModel(this.taskConfigs.dataProcessing.model, messages);
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  }

  /**
   * Generate documentation
   */
  async generateDocs(codeOrTopic: string, type: 'api' | 'user' | 'technical'): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.taskConfigs.documentation.systemPrompt
      },
      {
        role: 'user',
        content: `Generate ${type} documentation for:\n\n${codeOrTopic}`
      }
    ];

    return this.callModel(this.taskConfigs.documentation.model, messages);
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.taskConfigs.embeddings.model,
          input: text
        })
      });

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple tasks in parallel
   */
  async batchProcess<T>(
    items: T[],
    processor: (item: T) => Promise<any>,
    modelHint?: string
  ): Promise<any[]> {
    // Process in chunks to avoid overwhelming local models
    const chunkSize = 3;
    const results: any[] = [];

    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map(item => processor(item))
      );
      results.push(...chunkResults);
    }

    return results;
  }

  /**
   * Stream responses for real-time generation
   */
  async streamGeneration(
    model: string,
    messages: ChatMessage[],
    onChunk: (text: string) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) onChunk(content);
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  /**
   * Core method to call any model
   */
  private async callModel(model: string, messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Failed to call model ${model}:`, error);
      throw error;
    }
  }

  /**
   * Check if LM Studio is running
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const lmStudio = new LMStudioService();

// Task delegation helper
export async function delegateToLocalLLM(taskType: 'code' | 'data' | 'docs', input: any): Promise<any> {
  const isAvailable = await lmStudio.isAvailable();
  
  if (!isAvailable) {
    console.warn('LM Studio not available, falling back to Gemini');
    return null; // Fallback to Gemini
  }

  switch (taskType) {
    case 'code':
      return lmStudio.generateCode(input);
    case 'data':
      return lmStudio.processData(input.data, input.instructions);
    case 'docs':
      return lmStudio.generateDocs(input.content, input.type);
    default:
      throw new Error(`Unknown task type: ${taskType}`);
  }
}