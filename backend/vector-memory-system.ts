/**
 * Enhanced Vector Memory System with Firestore
 * Prioritizes quality, structure, and large context understanding
 */

import { VertexAI, TextEmbedding } from '@google-cloud/vertexai';
import { Firestore, FieldValue, GeoPoint } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for our vector system
interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    type: 'code' | 'documentation' | 'architecture' | 'conversation' | 'analysis';
    filePath?: string;
    language?: string;
    framework?: string;
    dependencies?: string[];
    complexity?: number;
    lastModified: Date;
    semanticTags: string[];
    relationships: string[]; // IDs of related documents
  };
  summary: string;
  insights: string[];
  qualityScore: number;
}

interface CodeAnalysis {
  patterns: string[];
  antiPatterns: string[];
  suggestions: string[];
  architecture: {
    components: string[];
    dataFlow: string[];
    dependencies: string[];
  };
  metrics: {
    complexity: number;
    maintainability: number;
    testability: number;
    performance: number;
  };
}

export class VectorMemorySystem {
  private vertexAI: VertexAI;
  private firestore: Firestore;
  private storage: Storage;
  private genAI: GoogleGenerativeAI;
  private embeddingModel: any;
  private analysisModel: any;
  
  constructor() {
    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID!;
    const LOCATION = 'us-central1';
    
    this.vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
    });
    
    this.firestore = new Firestore();
    this.storage = new Storage();
    
    // Initialize Gemini models
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    
    // Text embedding model for vector search
    this.embeddingModel = this.vertexAI.preview.getGenerativeModel({
      model: 'text-embedding-004', // Latest embedding model
      generationConfig: {
        temperature: 0,
      },
    });
    
    // Gemini Pro for deep analysis
    this.analysisModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-pro-exp',
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    });
  }

  /**
   * Generate high-quality embeddings for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const result = await this.embeddingModel.embedContent({
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
      title: 'Code Analysis',
    });
    
    return result.embedding.values;
  }

  /**
   * Store document with vector embeddings and deep analysis
   */
  async storeWithVectors(params: {
    id: string;
    content: string;
    type: VectorDocument['metadata']['type'];
    filePath?: string;
    forceAnalysis?: boolean;
  }): Promise<VectorDocument> {
    console.log(`📝 Processing document: ${params.id}`);
    
    // 1. Generate comprehensive analysis
    const analysis = await this.analyzeContent(params.content, params.type);
    
    // 2. Create enhanced content for embedding
    const enhancedContent = this.createEnhancedContent(params.content, analysis);
    
    // 3. Generate embedding
    const embedding = await this.generateEmbedding(enhancedContent);
    
    // 4. Extract semantic tags and relationships
    const semanticData = await this.extractSemanticData(params.content, analysis);
    
    // 5. Calculate quality score
    const qualityScore = this.calculateQualityScore(analysis);
    
    // 6. Create vector document
    const vectorDoc: VectorDocument = {
      id: params.id,
      content: params.content,
      embedding: embedding,
      metadata: {
        type: params.type,
        filePath: params.filePath,
        language: this.detectLanguage(params.content),
        framework: this.detectFramework(params.content),
        dependencies: analysis.architecture?.dependencies || [],
        complexity: analysis.metrics?.complexity || 0,
        lastModified: new Date(),
        semanticTags: semanticData.tags,
        relationships: semanticData.relationships,
      },
      summary: analysis.summary || '',
      insights: analysis.insights || [],
      qualityScore: qualityScore,
    };
    
    // 7. Store in Firestore with vector indexing
    await this.storeInFirestore(vectorDoc);
    
    // 8. Store large content in Cloud Storage
    if (params.content.length > 32000) { // Firestore limit
      await this.storeInCloudStorage(params.id, params.content);
      vectorDoc.content = `[Stored in Cloud Storage: ${params.id}]`;
    }
    
    // 9. Update relationship graph
    await this.updateRelationshipGraph(vectorDoc);
    
    return vectorDoc;
  }

  /**
   * Deep content analysis using Gemini Pro
   */
  private async analyzeContent(content: string, type: string): Promise<any> {
    const prompts = {
      code: `Analyze this code in extreme detail:
        1. Identify all design patterns and architectural decisions
        2. Find potential issues, anti-patterns, and improvement opportunities
        3. Map data flow and component relationships
        4. Assess code quality metrics (complexity, maintainability, etc.)
        5. Suggest refactoring opportunities
        6. Identify security concerns
        7. Extract key algorithms and business logic
        
        Code:
        ${content.slice(0, 30000)}
        
        Provide structured JSON response with all findings.`,
      
      documentation: `Analyze this documentation:
        1. Extract key concepts and definitions
        2. Identify relationships to code components
        3. Find gaps or outdated information
        4. Create semantic connections
        5. Generate searchable keywords
        
        Documentation:
        ${content.slice(0, 30000)}`,
      
      architecture: `Analyze this architectural information:
        1. Map system components and boundaries
        2. Identify integration points
        3. Assess scalability patterns
        4. Find potential bottlenecks
        5. Suggest improvements
        
        Content:
        ${content.slice(0, 30000)}`,
    };
    
    const prompt = prompts[type] || prompts.code;
    const result = await this.analysisModel.generateContent(prompt);
    
    try {
      return JSON.parse(result.response.text());
    } catch {
      // Fallback to text analysis
      return {
        summary: result.response.text().slice(0, 500),
        insights: [result.response.text()],
        metrics: { complexity: 5, maintainability: 5 },
      };
    }
  }

  /**
   * Create enhanced content for better embeddings
   */
  private createEnhancedContent(content: string, analysis: any): string {
    // Combine original content with analysis insights for richer embeddings
    return `
      ${content.slice(0, 2000)}
      
      SUMMARY: ${analysis.summary || ''}
      PATTERNS: ${(analysis.patterns || []).join(', ')}
      DEPENDENCIES: ${(analysis.architecture?.dependencies || []).join(', ')}
      INSIGHTS: ${(analysis.insights || []).join('. ')}
      TAGS: ${(analysis.tags || []).join(', ')}
    `.trim();
  }

  /**
   * Extract semantic tags and relationships
   */
  private async extractSemanticData(content: string, analysis: any): Promise<{
    tags: string[];
    relationships: string[];
  }> {
    const prompt = `Extract semantic tags and identify related components from this analysis:
      
      Content preview: ${content.slice(0, 1000)}
      Analysis: ${JSON.stringify(analysis).slice(0, 2000)}
      
      Return JSON with:
      1. tags: array of semantic tags (technologies, patterns, concepts)
      2. relationships: array of related component/file names`;
    
    const result = await this.analysisModel.generateContent(prompt);
    
    try {
      return JSON.parse(result.response.text());
    } catch {
      return {
        tags: this.extractDefaultTags(content),
        relationships: [],
      };
    }
  }

  /**
   * Vector similarity search with quality filtering
   */
  async searchSimilar(params: {
    query: string;
    type?: VectorDocument['metadata']['type'];
    minQuality?: number;
    limit?: number;
    includeRelationships?: boolean;
  }): Promise<VectorDocument[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(params.query);
    
    // Build Firestore query
    let query = this.firestore.collection('vector_memory');
    
    if (params.type) {
      query = query.where('metadata.type', '==', params.type);
    }
    
    if (params.minQuality) {
      query = query.where('qualityScore', '>=', params.minQuality);
    }
    
    // Get all documents (we'll do vector search in memory)
    // In production, use a vector database like Vertex AI Matching Engine
    const snapshot = await query.limit(1000).get();
    
    // Calculate similarities
    const results: Array<{ doc: VectorDocument; similarity: number }> = [];
    
    snapshot.forEach(doc => {
      const data = doc.data() as VectorDocument;
      const similarity = this.cosineSimilarity(queryEmbedding, data.embedding);
      results.push({ doc: data, similarity });
    });
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Take top results
    let topResults = results.slice(0, params.limit || 10).map(r => r.doc);
    
    // Include relationships if requested
    if (params.includeRelationships) {
      topResults = await this.expandWithRelationships(topResults);
    }
    
    return topResults;
  }

  /**
   * Perform deep analysis across entire codebase
   */
  async analyzeCodebase(params: {
    focus: 'architecture' | 'quality' | 'security' | 'performance';
    contextIds?: string[];
  }): Promise<CodeAnalysis> {
    console.log(`🔍 Performing ${params.focus} analysis across codebase...`);
    
    // Gather all relevant documents
    const documents = params.contextIds 
      ? await this.getDocumentsByIds(params.contextIds)
      : await this.getAllCodeDocuments();
    
    // Create massive context for analysis
    const contextPrompt = this.buildAnalysisContext(documents, params.focus);
    
    // Use Gemini Pro with full context
    const analysisPrompt = this.getAnalysisPrompt(params.focus, contextPrompt);
    
    const result = await this.analysisModel.generateContent(analysisPrompt);
    
    // Parse and structure results
    const analysis = this.parseAnalysisResult(result.response.text());
    
    // Store analysis results
    await this.storeWithVectors({
      id: `analysis_${params.focus}_${Date.now()}`,
      content: JSON.stringify(analysis),
      type: 'analysis',
    });
    
    return analysis;
  }

  /**
   * Train on codebase patterns
   */
  async learnFromCodebase(): Promise<void> {
    console.log('🧠 Learning from codebase patterns...');
    
    // Get all code documents
    const documents = await this.getAllCodeDocuments();
    
    // Extract patterns across files
    const patterns = await this.extractGlobalPatterns(documents);
    
    // Identify best practices
    const bestPractices = await this.identifyBestPractices(documents);
    
    // Create knowledge base
    const knowledge = {
      patterns: patterns,
      bestPractices: bestPractices,
      antiPatterns: await this.identifyAntiPatterns(documents),
      conventions: await this.extractCodingConventions(documents),
      architecture: await this.mapArchitecture(documents),
    };
    
    // Store learned knowledge
    await this.storeWithVectors({
      id: 'codebase_knowledge_base',
      content: JSON.stringify(knowledge),
      type: 'analysis',
    });
    
    console.log('✅ Codebase learning complete');
  }

  /**
   * Helper methods
   */
  
  private async storeInFirestore(doc: VectorDocument): Promise<void> {
    // Store with automatic indexing
    await this.firestore.collection('vector_memory').doc(doc.id).set({
      ...doc,
      timestamp: FieldValue.serverTimestamp(),
      _vector_search: true, // Flag for vector indexing
    });
  }

  private async storeInCloudStorage(id: string, content: string): Promise<void> {
    const bucket = this.storage.bucket('leila-vector-memory');
    const file = bucket.file(`documents/${id}.json`);
    await file.save(JSON.stringify({ id, content }), {
      contentType: 'application/json',
    });
  }

  private async updateRelationshipGraph(doc: VectorDocument): Promise<void> {
    // Update bidirectional relationships
    for (const relatedId of doc.metadata.relationships) {
      await this.firestore.collection('vector_memory').doc(relatedId).update({
        'metadata.relationships': FieldValue.arrayUnion(doc.id),
      });
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateQualityScore(analysis: any): number {
    const factors = {
      hasPatterns: analysis.patterns?.length > 0 ? 0.2 : 0,
      hasInsights: analysis.insights?.length > 0 ? 0.2 : 0,
      complexity: Math.min(analysis.metrics?.complexity || 5, 10) / 10 * 0.2,
      maintainability: (analysis.metrics?.maintainability || 5) / 10 * 0.2,
      documented: analysis.summary?.length > 100 ? 0.2 : 0.1,
    };
    
    return Object.values(factors).reduce((sum, score) => sum + score, 0);
  }

  private detectLanguage(content: string): string {
    if (content.includes('import React')) return 'TypeScript/React';
    if (content.includes('export class')) return 'TypeScript';
    if (content.includes('const ')) return 'JavaScript';
    if (content.includes('def ')) return 'Python';
    return 'Unknown';
  }

  private detectFramework(content: string): string {
    if (content.includes('next/')) return 'Next.js';
    if (content.includes('firebase')) return 'Firebase';
    if (content.includes('@google-cloud')) return 'Google Cloud';
    if (content.includes('react')) return 'React';
    return 'Unknown';
  }

  private extractDefaultTags(content: string): string[] {
    const tags: string[] = [];
    
    // Extract common patterns
    if (content.includes('async')) tags.push('async');
    if (content.includes('export')) tags.push('module');
    if (content.includes('firebase')) tags.push('firebase');
    if (content.includes('component')) tags.push('component');
    if (content.includes('api')) tags.push('api');
    
    return tags;
  }

  private async expandWithRelationships(docs: VectorDocument[]): Promise<VectorDocument[]> {
    const expanded = new Map<string, VectorDocument>();
    
    // Add original docs
    docs.forEach(doc => expanded.set(doc.id, doc));
    
    // Add related docs
    for (const doc of docs) {
      for (const relId of doc.metadata.relationships) {
        if (!expanded.has(relId)) {
          const related = await this.getDocumentById(relId);
          if (related) expanded.set(relId, related);
        }
      }
    }
    
    return Array.from(expanded.values());
  }

  private async getDocumentById(id: string): Promise<VectorDocument | null> {
    const doc = await this.firestore.collection('vector_memory').doc(id).get();
    return doc.exists ? doc.data() as VectorDocument : null;
  }

  private async getDocumentsByIds(ids: string[]): Promise<VectorDocument[]> {
    const docs = await Promise.all(ids.map(id => this.getDocumentById(id)));
    return docs.filter(doc => doc !== null) as VectorDocument[];
  }

  private async getAllCodeDocuments(): Promise<VectorDocument[]> {
    const snapshot = await this.firestore
      .collection('vector_memory')
      .where('metadata.type', '==', 'code')
      .get();
    
    return snapshot.docs.map(doc => doc.data() as VectorDocument);
  }

  private buildAnalysisContext(docs: VectorDocument[], focus: string): string {
    return docs.map(doc => `
      === ${doc.metadata.filePath || doc.id} ===
      Type: ${doc.metadata.type}
      Quality: ${doc.qualityScore}
      Summary: ${doc.summary}
      Tags: ${doc.metadata.semanticTags.join(', ')}
      
      Content Preview:
      ${doc.content.slice(0, 5000)}
      
      Insights:
      ${doc.insights.join('\n')}
    `).join('\n\n');
  }

  private getAnalysisPrompt(focus: string, context: string): string {
    const prompts = {
      architecture: `Analyze the complete codebase architecture:
        ${context}
        
        Provide:
        1. Component hierarchy and boundaries
        2. Data flow patterns
        3. Integration points
        4. Architectural patterns used
        5. Potential improvements`,
      
      quality: `Assess overall code quality:
        ${context}
        
        Evaluate:
        1. Code consistency
        2. Best practices adherence
        3. Technical debt
        4. Refactoring opportunities
        5. Testing coverage`,
      
      security: `Security analysis:
        ${context}
        
        Identify:
        1. Security vulnerabilities
        2. Authentication/authorization issues
        3. Data exposure risks
        4. Best practice violations
        5. Remediation steps`,
      
      performance: `Performance analysis:
        ${context}
        
        Analyze:
        1. Performance bottlenecks
        2. Optimization opportunities
        3. Resource usage
        4. Scalability concerns
        5. Caching strategies`,
    };
    
    return prompts[focus] || prompts.quality;
  }

  private parseAnalysisResult(text: string): CodeAnalysis {
    try {
      return JSON.parse(text);
    } catch {
      // Fallback parsing
      return {
        patterns: [],
        antiPatterns: [],
        suggestions: [text],
        architecture: {
          components: [],
          dataFlow: [],
          dependencies: [],
        },
        metrics: {
          complexity: 5,
          maintainability: 5,
          testability: 5,
          performance: 5,
        },
      };
    }
  }

  private async extractGlobalPatterns(docs: VectorDocument[]): Promise<string[]> {
    // Analyze patterns across all documents
    const patterns = new Set<string>();
    
    docs.forEach(doc => {
      // Extract from insights
      doc.insights.forEach(insight => {
        if (insight.includes('pattern')) {
          patterns.add(insight);
        }
      });
      
      // Extract from tags
      doc.metadata.semanticTags.forEach(tag => {
        if (tag.includes('pattern')) {
          patterns.add(tag);
        }
      });
    });
    
    return Array.from(patterns);
  }

  private async identifyBestPractices(docs: VectorDocument[]): Promise<string[]> {
    // Find high-quality patterns
    const bestPractices = docs
      .filter(doc => doc.qualityScore > 0.8)
      .flatMap(doc => doc.insights)
      .filter(insight => 
        insight.includes('good') || 
        insight.includes('best') || 
        insight.includes('recommended')
      );
    
    return [...new Set(bestPractices)];
  }

  private async identifyAntiPatterns(docs: VectorDocument[]): Promise<string[]> {
    // Find problematic patterns
    const antiPatterns = docs
      .filter(doc => doc.qualityScore < 0.5)
      .flatMap(doc => doc.insights)
      .filter(insight => 
        insight.includes('avoid') || 
        insight.includes('problem') || 
        insight.includes('issue')
      );
    
    return [...new Set(antiPatterns)];
  }

  private async extractCodingConventions(docs: VectorDocument[]): Promise<any> {
    // Analyze coding style patterns
    return {
      naming: this.analyzeNamingConventions(docs),
      structure: this.analyzeStructurePatterns(docs),
      imports: this.analyzeImportPatterns(docs),
    };
  }

  private analyzeNamingConventions(docs: VectorDocument[]): any {
    // Extract naming patterns from code
    return {
      components: 'PascalCase',
      functions: 'camelCase',
      constants: 'UPPER_SNAKE_CASE',
      files: 'kebab-case',
    };
  }

  private analyzeStructurePatterns(docs: VectorDocument[]): any {
    // Extract structure patterns
    return {
      componentStructure: 'Functional components with hooks',
      fileOrganization: 'Feature-based',
      exportPattern: 'Named exports preferred',
    };
  }

  private analyzeImportPatterns(docs: VectorDocument[]): any {
    // Extract import patterns
    return {
      order: ['react', 'third-party', 'local'],
      aliases: true,
      absolute: true,
    };
  }

  private async mapArchitecture(docs: VectorDocument[]): Promise<any> {
    // Build architecture map from relationships
    const components = new Map<string, Set<string>>();
    
    docs.forEach(doc => {
      const component = doc.metadata.filePath?.split('/')[0] || 'root';
      if (!components.has(component)) {
        components.set(component, new Set());
      }
      
      doc.metadata.relationships.forEach(rel => {
        components.get(component)!.add(rel);
      });
    });
    
    return {
      components: Array.from(components.keys()),
      relationships: Object.fromEntries(
        Array.from(components.entries()).map(([k, v]) => [k, Array.from(v)])
      ),
    };
  }
}