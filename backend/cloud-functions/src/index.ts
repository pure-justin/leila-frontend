/**
 * Cloud Functions for Vertex AI Memory System
 */

import * as functions from 'firebase-functions';
import { Firestore } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Initialize services
const firestore = new Firestore();
const storage = new Storage();

const BUCKET_NAME = process.env.MEMORY_BUCKET || 'leila-ai-memory';

// Initialize AI models
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

/**
 * Main memory API endpoint
 */
export const memoryApi = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '4GB',
  })
  .https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      const { action, params } = req.body;

      switch (action) {
        case 'store':
          const storeResult = await storeContext(params);
          res.json({ success: true, result: storeResult });
          break;

        case 'analyze':
          const analysisResult = await analyzeWithContext(params);
          res.json({ success: true, result: analysisResult });
          break;

        case 'search':
          const searchResults = await searchContexts(params);
          res.json({ success: true, result: searchResults });
          break;

        default:
          res.status(400).json({ success: false, error: 'Invalid action' });
      }
    } catch (error: any) {
      console.error('Memory API error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

/**
 * Store context in Firestore and Cloud Storage
 */
async function storeContext(params: any) {
  const { id, type, content, metadata } = params;

  // Compress large content
  let storedContent = content;
  let storageRef = null;

  if (JSON.stringify(content).length > 32000) {
    // Store in Cloud Storage
    const compressed = await gzip(JSON.stringify(content));
    const fileName = `contexts/${id}.json.gz`;
    const file = storage.bucket(BUCKET_NAME).file(fileName);
    
    await file.save(compressed, {
      metadata: {
        contentType: 'application/json',
        contentEncoding: 'gzip',
      },
    });

    storageRef = fileName;
    storedContent = '[Stored in Cloud Storage]';
  }

  // Store metadata in Firestore
  await firestore.collection('memory_contexts').doc(id).set({
    id,
    type,
    content: storedContent,
    storageRef,
    metadata: {
      ...metadata,
      createdAt: new Date(),
      version: '1.0',
    },
  });

  return { contextId: id, stored: true };
}

/**
 * Analyze with massive context using Gemini
 */
async function analyzeWithContext(params: any) {
  const { question, contextIds, analysisType, options } = params;

  // Gather contexts
  const contexts = await gatherContexts(contextIds);

  // Choose model based on context size
  const totalTokens = estimateTokens(contexts);
  const model = totalTokens > 500000
    ? genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })
    : genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Build prompt
  const prompt = buildAnalysisPrompt(question, contexts, analysisType, options);

  // Generate response
  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return {
    response,
    contextsUsed: contextIds.length,
    tokensProcessed: totalTokens,
    model: totalTokens > 500000 ? 'gemini-1.5-pro' : 'gemini-1.5-flash',
  };
}

/**
 * Search contexts using metadata
 */
async function searchContexts(params: any) {
  const { query: searchQuery, filters } = params;

  let firestoreQuery = firestore.collection('memory_contexts');

  if (filters?.type) {
    firestoreQuery = firestoreQuery.where('type', '==', filters.type) as any;
  }

  const snapshot = await firestoreQuery.limit(filters?.limit || 10).get();
  const results: any[] = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    // Simple text matching for now
    if (JSON.stringify(data).toLowerCase().includes(searchQuery.toLowerCase())) {
      results.push({
        id: doc.id,
        type: data.type,
        metadata: data.metadata,
        preview: data.content?.slice(0, 200),
      });
    }
  });

  return results;
}

/**
 * Helper functions
 */
async function gatherContexts(contextIds: string[]) {
  const contexts: any[] = [];

  for (const id of contextIds) {
    const doc = await firestore.collection('memory_contexts').doc(id).get();
    if (doc.exists) {
      const data = doc.data()!;
      
      // Load from storage if needed
      if (data.storageRef) {
        const file = storage.bucket(BUCKET_NAME).file(data.storageRef);
        const [compressed] = await file.download();
        const decompressed = await gunzip(compressed);
        data.content = JSON.parse(decompressed.toString());
      }

      contexts.push(data);
    }
  }

  return contexts;
}

function estimateTokens(contexts: any[]): number {
  const text = JSON.stringify(contexts);
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function buildAnalysisPrompt(
  question: string,
  contexts: any[],
  analysisType: string,
  options: any
): string {
  let prompt = `Analysis Type: ${analysisType}\n\n`;
  prompt += `Question: ${question}\n\n`;
  prompt += `Context:\n`;

  contexts.forEach(ctx => {
    prompt += `\n--- ${ctx.type}: ${ctx.id} ---\n`;
    prompt += JSON.stringify(ctx.content, null, 2).slice(0, 50000);
    prompt += '\n';
  });

  if (options?.outputFormat) {
    prompt += `\nOutput Format: ${options.outputFormat}`;
  }

  return prompt;
}

/**
 * Background processor for async operations
 */
export const processMemoryUpdate = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '2GB',
  })
  .pubsub.topic('memory-updates')
  .onPublish(async (message) => {
    const data = message.json;
    console.log('Processing memory update:', data);
    // Add background processing logic here
  });

/**
 * Process large file uploads
 */
export const processLargeUpload = functions
  .runWith({
    timeoutSeconds: 540,
    memory: '8GB',
  })
  .storage.object()
  .onFinalize(async (object) => {
    if (!object.name?.startsWith('uploads/')) return;

    console.log('Processing large upload:', object.name);
    // Add file processing logic here
  });