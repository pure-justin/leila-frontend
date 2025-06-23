#!/usr/bin/env node

/**
 * Test script for the Vertex AI Memory System
 * Run with: npx tsx test-memory-system.ts
 */

import { claudeMemory } from './lib/claude-memory-integration';
import * as path from 'path';

async function testMemorySystem() {
  console.log('🧪 Testing Vertex AI Memory System...\n');

  try {
    // Test 1: Store a simple context
    console.log('Test 1: Storing simple context...');
    const storeResult = await claudeMemory.remember({
      id: 'test_context_001',
      type: 'documentation',
      content: {
        title: 'Leila Platform Architecture',
        sections: {
          frontend: 'Next.js 14 with TypeScript',
          backend: 'Firebase + Cloud Functions',
          ai: 'Google Gemini + Vertex AI',
          database: 'Firestore',
          storage: 'Cloud Storage'
        }
      },
      metadata: {
        project: 'leila-platform',
        version: '1.0.0'
      }
    });
    console.log('✅ Store result:', storeResult);

    // Test 2: Store current project codebase
    console.log('\nTest 2: Storing current codebase...');
    const codebaseResult = await claudeMemory.rememberCodebase(
      path.join(__dirname)
    );
    console.log('✅ Codebase stored:', codebaseResult);

    // Test 3: Search for contexts
    console.log('\nTest 3: Searching for contexts...');
    const searchResults = await claudeMemory.search('architecture', {
      type: 'documentation',
      limit: 5
    });
    console.log('✅ Search results:', searchResults.length, 'contexts found');

    // Test 4: Analyze with context
    console.log('\nTest 4: Analyzing with massive context...');
    const analysis = await claudeMemory.analyze({
      question: 'What is the overall architecture of this project? List all major components and their interactions.',
      contextIds: ['test_context_001'],
      analysisType: 'architecture',
      options: {
        outputFormat: 'detailed',
        includeRelated: true
      }
    });
    console.log('✅ Analysis result:');
    console.log('Response length:', analysis.response.length);
    console.log('Contexts used:', analysis.contextsUsed);
    console.log('Processing time:', analysis.processingTime, 'ms');
    console.log('\nResponse preview:');
    console.log(analysis.response.slice(0, 500) + '...');

    // Test 5: Code analysis
    console.log('\nTest 5: Code analysis...');
    const codeAnalysis = await claudeMemory.analyze({
      question: 'Find all API endpoints in the codebase and list them with their methods and paths',
      contextIds: [`codebase_${path.basename(__dirname)}_${Date.now()}`],
      analysisType: 'code',
      options: {
        outputFormat: 'actionable'
      }
    });
    console.log('✅ Code analysis complete');

    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
testMemorySystem();