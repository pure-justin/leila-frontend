/**
 * AI Task Router - Intelligently routes tasks between Gemini and Local LLMs
 * Optimizes for performance and cost efficiency
 */

import { geminiAI } from './geminiAI';
import { lmStudio, delegateToLocalLLM } from './lmStudioService';

interface TaskPriority {
  complexity: 'low' | 'medium' | 'high';
  realtime: boolean;
  requiresVision: boolean;
  requiresInternet: boolean;
}

export class AITaskRouter {
  private taskQueue: Map<string, any> = new Map();
  private localLLMAvailable: boolean = false;

  constructor() {
    this.checkLocalLLMStatus();
  }

  async checkLocalLLMStatus() {
    this.localLLMAvailable = await lmStudio.isAvailable();
    console.log('Local LLM Status:', this.localLLMAvailable ? '✅ Available' : '❌ Not Available');
  }

  /**
   * Route tasks intelligently based on requirements
   */
  async routeTask(taskType: string, data: any, priority?: TaskPriority): Promise<any> {
    // Determine routing strategy
    const routing = this.determineRouting(taskType, priority);
    
    if (routing === 'local' && this.localLLMAvailable) {
      console.log(`📍 Routing ${taskType} to Local LLM`);
      return this.executeLocalTask(taskType, data);
    } else {
      console.log(`☁️  Routing ${taskType} to Gemini`);
      return this.executeGeminiTask(taskType, data);
    }
  }

  /**
   * Determine whether to use local or cloud AI
   */
  private determineRouting(taskType: string, priority?: TaskPriority): 'local' | 'cloud' {
    // Always use Gemini for vision and real-time critical tasks
    if (priority?.requiresVision || priority?.requiresInternet) {
      return 'cloud';
    }

    // Route to local LLMs for routine tasks
    const localTasks = [
      'code_generation',
      'data_transformation',
      'documentation',
      'text_summarization',
      'json_formatting',
      'sql_generation',
      'test_generation'
    ];

    if (localTasks.includes(taskType) && this.localLLMAvailable) {
      return 'local';
    }

    // Complex tasks go to Gemini
    return 'cloud';
  }

  /**
   * Execute task on local LLM
   */
  private async executeLocalTask(taskType: string, data: any): Promise<any> {
    switch (taskType) {
      case 'code_generation':
        return lmStudio.generateCode(data.prompt);
        
      case 'data_transformation':
        return lmStudio.processData(data.input, data.instructions);
        
      case 'documentation':
        return lmStudio.generateDocs(data.content, data.type);
        
      case 'text_summarization':
        return lmStudio.generateCode(`Summarize this text concisely:\n\n${data.text}`);
        
      case 'json_formatting':
        return lmStudio.processData(data.input, 'Format this data as clean JSON');
        
      case 'sql_generation':
        return lmStudio.generateCode(`Generate SQL query for: ${data.requirement}`);
        
      case 'test_generation':
        return lmStudio.generateCode(`Generate tests for:\n\n${data.code}`);
        
      default:
        throw new Error(`Unknown local task: ${taskType}`);
    }
  }

  /**
   * Execute task on Gemini
   */
  private async executeGeminiTask(taskType: string, data: any): Promise<any> {
    switch (taskType) {
      case 'voice_command':
        return geminiAI.processVoiceCommand(data.command, data.context);
        
      case 'vision_analysis':
        return geminiAI.analyzeImage(data.image, data.description);
        
      case 'predictive_maintenance':
        return geminiAI.predictMaintenance(data.homeData);
        
      case 'realtime_chat':
        return geminiAI.streamResponse(data.prompt, data.onChunk);
        
      default:
        // Fallback to general Gemini generation
        const model = geminiAI['model'];
        const result = await model.generateContent(data.prompt);
        return result.response.text();
    }
  }

  /**
   * Parallel task execution across multiple LLMs
   */
  async parallelExecute(tasks: Array<{type: string, data: any}>): Promise<any[]> {
    const localTasks: any[] = [];
    const cloudTasks: any[] = [];

    // Separate tasks by routing
    tasks.forEach((task, index) => {
      const routing = this.determineRouting(task.type);
      if (routing === 'local' && this.localLLMAvailable) {
        localTasks.push({ ...task, index });
      } else {
        cloudTasks.push({ ...task, index });
      }
    });

    // Execute in parallel
    const results: any[] = new Array(tasks.length);
    
    const [localResults, cloudResults] = await Promise.all([
      Promise.all(localTasks.map(task => 
        this.executeLocalTask(task.type, task.data)
          .then(result => ({ index: task.index, result }))
      )),
      Promise.all(cloudTasks.map(task => 
        this.executeGeminiTask(task.type, task.data)
          .then(result => ({ index: task.index, result }))
      ))
    ]);

    // Merge results in original order
    [...localResults, ...cloudResults].forEach(({ index, result }) => {
      results[index] = result;
    });

    return results;
  }

  /**
   * Generate code components using local LLM
   */
  async generateComponent(specification: string): Promise<string> {
    if (this.localLLMAvailable) {
      console.log('🏠 Using DeepSeek for component generation');
      return lmStudio.generateCode(`
Generate a React component with TypeScript and Tailwind CSS:

Specification: ${specification}

Requirements:
- Use functional components with hooks
- Include proper TypeScript types
- Use Tailwind CSS for styling
- Follow best practices
- Include error handling
`);
    } else {
      // Fallback to Gemini
      return this.executeGeminiTask('code_generation', { prompt: specification });
    }
  }

  /**
   * Batch process service data
   */
  async processServiceData(services: any[]): Promise<any[]> {
    if (this.localLLMAvailable) {
      console.log('🏠 Using Gemma for data processing');
      return lmStudio.batchProcess(services, async (service) => {
        return lmStudio.processData(service, `
Format this service data:
- Clean up descriptions
- Standardize pricing
- Add relevant tags
- Generate SEO keywords
`);
      });
    } else {
      // Process with Gemini
      return Promise.all(services.map(service => 
        this.executeGeminiTask('data_transformation', { 
          input: service, 
          instructions: 'Format and enhance service data' 
        })
      ));
    }
  }
}

// Export singleton instance
export const aiRouter = new AITaskRouter();

// Convenience functions
export async function generateWithBestModel(prompt: string): Promise<string> {
  return aiRouter.routeTask('code_generation', { prompt });
}

export async function processDataWithAI(data: any, instructions: string): Promise<any> {
  return aiRouter.routeTask('data_transformation', { input: data, instructions });
}

export async function analyzeWithVision(image: string, description?: string): Promise<any> {
  return aiRouter.routeTask('vision_analysis', { image, description }, {
    complexity: 'high',
    realtime: true,
    requiresVision: true,
    requiresInternet: true
  });
}