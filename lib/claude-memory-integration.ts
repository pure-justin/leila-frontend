/**
 * Claude Memory Integration
 * Allows Claude to seamlessly use the Vertex AI memory system
 */

import axios from 'axios';

interface MemoryContext {
  id: string;
  type: 'codebase' | 'documentation' | 'conversation' | 'analysis';
  content: any;
  metadata?: Record<string, any>;
}

interface AnalysisQuery {
  question: string;
  contextIds: string[];
  analysisType: 'code' | 'architecture' | 'debug' | 'general';
  options?: {
    includeRelated?: boolean;
    maxContexts?: number;
    outputFormat?: 'detailed' | 'summary' | 'actionable';
  };
}

export class ClaudeMemoryIntegration {
  private apiUrl: string;
  private apiKey: string;
  private localCache: Map<string, any> = new Map();

  constructor() {
    // Use the deployed Cloud Function URL
    this.apiUrl = 'https://us-central1-leila-platform.cloudfunctions.net/memoryApi';
    this.apiKey = process.env.MEMORY_API_KEY || '';
  }

  /**
   * Store large context (codebase, docs, etc)
   */
  async remember(data: {
    id: string;
    type: MemoryContext['type'];
    content: any;
    metadata?: any;
  }): Promise<{ success: boolean; contextId: string }> {
    try {
      const response = await axios.post(this.apiUrl, {
        action: 'store',
        params: data
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      // Cache locally for quick access
      this.localCache.set(data.id, {
        ...data,
        stored: new Date()
      });

      return {
        success: true,
        contextId: response.data.result.id
      };
    } catch (error) {
      console.error('Failed to store context:', error);
      return { success: false, contextId: '' };
    }
  }

  /**
   * Retrieve and analyze with massive context
   */
  async analyze(query: AnalysisQuery): Promise<{
    response: string;
    contextsUsed: number;
    processingTime: number;
  }> {
    try {
      // Check local cache first
      const cachedResponse = this.checkCache(query.question);
      if (cachedResponse) {
        return cachedResponse;
      }

      const response = await axios.post(this.apiUrl, {
        action: 'analyze',
        params: query
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 300000 // 5 minutes
      });

      const result = response.data.result;
      
      // Cache the response
      this.cacheResponse(query.question, result);

      return result;
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Quick semantic search across all memories
   */
  async search(query: string, filters?: {
    type?: MemoryContext['type'];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): Promise<MemoryContext[]> {
    try {
      const response = await axios.post(this.apiUrl, {
        action: 'search',
        params: { query, filters }
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      return response.data.result;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Store entire codebase for analysis
   */
  async rememberCodebase(projectPath: string): Promise<boolean> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const files: Record<string, string> = {};
      
      async function scanDirectory(dir: string) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(projectPath, fullPath);
          
          if (entry.isDirectory()) {
            // Skip node_modules, .git, etc
            if (!['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else {
            // Read text files
            if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md'].some(ext => entry.name.endsWith(ext))) {
              files[relativePath] = await fs.readFile(fullPath, 'utf-8');
            }
          }
        }
      }
      
      await scanDirectory(projectPath);
      
      // Store the codebase
      const result = await this.remember({
        id: `codebase_${path.basename(projectPath)}_${Date.now()}`,
        type: 'codebase',
        content: {
          projectName: path.basename(projectPath),
          files: files,
          fileCount: Object.keys(files).length,
          structure: this.buildFileTree(Object.keys(files))
        },
        metadata: {
          path: projectPath,
          timestamp: new Date(),
          language: 'typescript'
        }
      });
      
      return result.success;
    } catch (error) {
      console.error('Failed to store codebase:', error);
      return false;
    }
  }

  /**
   * Helper to build file tree structure
   */
  private buildFileTree(filePaths: string[]): any {
    const tree: any = {};
    
    filePaths.forEach(filePath => {
      const parts = filePath.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = 'file';
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      });
    });
    
    return tree;
  }

  /**
   * Cache management
   */
  private checkCache(query: string): any {
    const cacheKey = this.getCacheKey(query);
    const cached = this.localCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 1800000) { // 30 minutes
      return cached.data;
    }
    
    return null;
  }

  private cacheResponse(query: string, response: any): void {
    const cacheKey = this.getCacheKey(query);
    this.localCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.localCache.size > 100) {
      const firstKey = this.localCache.keys().next().value;
      this.localCache.delete(firstKey);
    }
  }

  private getCacheKey(query: string): string {
    return `query_${Buffer.from(query).toString('base64').slice(0, 20)}`;
  }
}

// Singleton instance for Claude to use
export const claudeMemory = new ClaudeMemoryIntegration();

// Example usage in Claude's workflow:
export async function demonstrateUsage() {
  // 1. Store the entire codebase
  await claudeMemory.rememberCodebase('/path/to/project');
  
  // 2. Store analysis results
  await claudeMemory.remember({
    id: 'analysis_001',
    type: 'analysis',
    content: {
      findings: ['issue1', 'issue2'],
      recommendations: ['fix1', 'fix2']
    }
  });
  
  // 3. Query with massive context
  const result = await claudeMemory.analyze({
    question: 'What are all the API endpoints in this codebase?',
    contextIds: ['codebase_project_123'],
    analysisType: 'code',
    options: {
      includeRelated: true,
      outputFormat: 'detailed'
    }
  });
  
  console.log(result.response);
}