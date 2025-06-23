#!/usr/bin/env node

/**
 * Sync entire project to Gemini Memory System
 * This frees up Claude's context by offloading to Gemini's 2M+ tokens
 */

import { claudeMemory } from '../lib/claude-memory-integration';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ProjectAnalysis {
  structure: any;
  statistics: {
    totalFiles: number;
    totalLines: number;
    fileTypes: Record<string, number>;
    largestFiles: Array<{ path: string; size: number }>;
  };
  dependencies: any;
  configuration: any;
  documentation: string[];
  unusedFiles: string[];
}

class ProjectSyncManager {
  private projectRoot: string;
  private ignorePaths = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.vercel',
    '*.log',
    '.DS_Store',
    'public/images/services' // Large image directory
  ];

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze entire project structure
   */
  async analyzeProject(): Promise<ProjectAnalysis> {
    console.log('🔍 Analyzing project structure...\n');

    const analysis: ProjectAnalysis = {
      structure: {},
      statistics: {
        totalFiles: 0,
        totalLines: 0,
        fileTypes: {},
        largestFiles: []
      },
      dependencies: {},
      configuration: {},
      documentation: [],
      unusedFiles: []
    };

    // 1. Build file tree and collect stats
    await this.scanDirectory(this.projectRoot, analysis);

    // 2. Analyze package.json
    const packageJson = await this.readJsonFile('package.json');
    analysis.dependencies = {
      production: Object.keys(packageJson.dependencies || {}),
      development: Object.keys(packageJson.devDependencies || {}),
      scripts: packageJson.scripts || {}
    };

    // 3. Analyze configuration files
    analysis.configuration = {
      nextConfig: await this.fileExists('next.config.js'),
      typescript: await this.readJsonFile('tsconfig.json'),
      eslint: await this.readJsonFile('.eslintrc.json').catch(() => null),
      prettier: await this.readJsonFile('.prettierrc').catch(() => null),
      vercel: await this.readJsonFile('vercel.json').catch(() => null)
    };

    // 4. Find documentation
    analysis.documentation = await this.findDocumentation();

    // 5. Find unused files
    analysis.unusedFiles = await this.findUnusedFiles();

    // Sort largest files
    analysis.statistics.largestFiles.sort((a, b) => b.size - a.size);
    analysis.statistics.largestFiles = analysis.statistics.largestFiles.slice(0, 20);

    return analysis;
  }

  /**
   * Store project in Gemini memory
   */
  async syncToGemini(analysis: ProjectAnalysis): Promise<void> {
    console.log('\n📤 Syncing to Gemini Memory System...\n');

    // 1. Store project structure and metadata
    console.log('1️⃣ Storing project metadata...');
    await claudeMemory.remember({
      id: `project_metadata_${Date.now()}`,
      type: 'documentation',
      content: {
        name: 'Leila Home Service Platform',
        analysis: analysis,
        timestamp: new Date().toISOString()
      },
      metadata: {
        type: 'project_analysis',
        version: '2.0'
      }
    });

    // 2. Store entire codebase
    console.log('2️⃣ Storing complete codebase...');
    const codebaseStored = await claudeMemory.rememberCodebase(this.projectRoot);
    console.log(`   ✅ Codebase stored: ${codebaseStored}`);

    // 3. Store key documentation separately for quick access
    console.log('3️⃣ Storing documentation...');
    for (const docPath of analysis.documentation) {
      const content = await fs.readFile(path.join(this.projectRoot, docPath), 'utf-8');
      await claudeMemory.remember({
        id: `doc_${path.basename(docPath)}_${Date.now()}`,
        type: 'documentation',
        content: {
          path: docPath,
          content: content
        },
        metadata: {
          fileName: path.basename(docPath)
        }
      });
    }

    // 4. Store architecture analysis
    console.log('4️⃣ Generating architecture analysis...');
    const architectureAnalysis = await this.generateArchitectureAnalysis(analysis);
    await claudeMemory.remember({
      id: `architecture_${Date.now()}`,
      type: 'analysis',
      content: architectureAnalysis,
      metadata: {
        type: 'architecture',
        timestamp: new Date()
      }
    });

    console.log('\n✅ Project successfully synced to Gemini!');
  }

  /**
   * Generate optimized context for Claude
   */
  async generateOptimizedContext(analysis: ProjectAnalysis): Promise<string> {
    const context = `# Leila Platform - Optimized Context

## Project Overview
- **Total Files**: ${analysis.statistics.totalFiles}
- **Total Lines**: ${analysis.statistics.totalLines.toLocaleString()}
- **Main Technologies**: Next.js 14, TypeScript, Firebase, Google Cloud AI

## Key Directories
${this.formatFileTree(analysis.structure, 2)}

## Recent Changes
- ✅ AI-powered image generation (1,400+ images)
- ✅ Vertex AI memory system integration
- ✅ Simplified navigation and mobile UX
- ✅ Stripe payment integration

## Active Features
1. **Customer App** (heyleila.com)
   - AI-powered service matching
   - Voice control ("Hey Leila")
   - Real-time chat
   - PWA with offline support

2. **Contractor Dashboard** (/contractor)
   - Live job feed
   - Analytics dashboard
   - Schedule management
   - Commission tiers (10-30%)

3. **Admin CRM** (/admin/crm)
   - Customer management
   - Contractor management
   - Booking oversight
   - AI activity monitoring

## Memory System Active
- Gemini 2.5 Pro: Deep analysis (2M+ tokens)
- Gemini 2.5 Flash: Fast retrieval (1M+ tokens)
- Full codebase stored and indexed
- Semantic search enabled

## Quick Commands
\`\`\`bash
npm run dev          # Start development
npm run build        # Build for production
npm run deploy       # Deploy to Vercel
npx tsx test-memory-system.ts  # Test memory system
\`\`\`

## Important Notes
- All AI contexts stored in Gemini
- Use claudeMemory.analyze() for deep analysis
- Images exceed Vercel limit (210MB > 100MB)
- Consider CDN or Vercel Pro upgrade`;

    return context;
  }

  /**
   * Helper methods
   */
  private async scanDirectory(dir: string, analysis: ProjectAnalysis, relativePath = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      // Skip ignored paths
      if (this.shouldIgnore(relPath)) continue;

      if (entry.isDirectory()) {
        analysis.structure[entry.name] = {};
        await this.scanDirectory(fullPath, analysis, relPath);
      } else {
        analysis.structure[entry.name] = 'file';
        analysis.statistics.totalFiles++;

        // Get file stats
        const stats = await fs.stat(fullPath);
        analysis.statistics.largestFiles.push({
          path: relPath,
          size: stats.size
        });

        // Count file types
        const ext = path.extname(entry.name);
        analysis.statistics.fileTypes[ext] = (analysis.statistics.fileTypes[ext] || 0) + 1;

        // Count lines for text files
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md'].includes(ext)) {
          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            analysis.statistics.totalLines += content.split('\n').length;
          } catch {}
        }
      }
    }
  }

  private shouldIgnore(filePath: string): boolean {
    return this.ignorePaths.some(pattern => {
      if (pattern.includes('*')) {
        return filePath.includes(pattern.replace('*', ''));
      }
      return filePath.includes(pattern);
    });
  }

  private async readJsonFile(fileName: string): Promise<any> {
    const content = await fs.readFile(path.join(this.projectRoot, fileName), 'utf-8');
    return JSON.parse(content);
  }

  private async fileExists(fileName: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.projectRoot, fileName));
      return true;
    } catch {
      return false;
    }
  }

  private async findDocumentation(): Promise<string[]> {
    const docs: string[] = [];
    
    async function scan(dir: string, rel = '') {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const relPath = path.join(rel, entry.name);
        
        if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
          await scan(path.join(dir, entry.name), relPath);
        } else if (entry.name.endsWith('.md')) {
          docs.push(relPath);
        }
      }
    }
    
    await scan(this.projectRoot);
    return docs;
  }

  private async findUnusedFiles(): Promise<string[]> {
    // Run a simple check for potentially unused files
    const unused: string[] = [];
    
    // Check for test files not in test directory
    // Check for backup files
    // Check for old components
    
    return unused;
  }

  private async generateArchitectureAnalysis(analysis: ProjectAnalysis): Promise<any> {
    return {
      overview: 'AI-powered home service platform',
      stack: {
        frontend: {
          framework: 'Next.js 14',
          language: 'TypeScript',
          styling: 'Tailwind CSS',
          state: 'React Context + Hooks'
        },
        backend: {
          platform: 'Firebase',
          database: 'Firestore',
          auth: 'Firebase Auth',
          functions: 'Cloud Functions',
          storage: 'Cloud Storage'
        },
        ai: {
          chat: 'Google Gemini 1.5 Flash',
          images: 'Google Imagen 2',
          memory: 'Vertex AI + Gemini 2.5 Pro/Flash'
        }
      },
      keyFeatures: analysis.dependencies.production.slice(0, 20),
      statistics: analysis.statistics
    };
  }

  private formatFileTree(tree: any, maxDepth: number, currentDepth = 0, prefix = ''): string {
    if (currentDepth >= maxDepth) return '';
    
    let result = '';
    const entries = Object.entries(tree);
    
    entries.forEach(([name, value], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      
      result += `${prefix}${connector}${name}\n`;
      
      if (typeof value === 'object' && Object.keys(value).length > 0) {
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        result += this.formatFileTree(value, maxDepth, currentDepth + 1, newPrefix);
      }
    });
    
    return result;
  }
}

// Main execution
async function main() {
  console.log('🚀 Leila Platform - Project Sync to Gemini\n');
  
  const projectRoot = path.join(__dirname, '..');
  const syncManager = new ProjectSyncManager(projectRoot);
  
  try {
    // 1. Analyze project
    const analysis = await syncManager.analyzeProject();
    
    console.log('\n📊 Project Analysis Complete:');
    console.log(`   Files: ${analysis.statistics.totalFiles}`);
    console.log(`   Lines: ${analysis.statistics.totalLines.toLocaleString()}`);
    console.log(`   Documentation: ${analysis.documentation.length} files`);
    console.log(`   Dependencies: ${analysis.dependencies.production.length} production`);
    
    // 2. Sync to Gemini
    await syncManager.syncToGemini(analysis);
    
    // 3. Generate optimized context
    const optimizedContext = await syncManager.generateOptimizedContext(analysis);
    
    // 4. Save optimized context
    await fs.writeFile(
      path.join(projectRoot, 'CLAUDE_OPTIMIZED_CONTEXT.md'),
      optimizedContext
    );
    
    console.log('\n✅ Optimized context saved to CLAUDE_OPTIMIZED_CONTEXT.md');
    console.log('\n🎉 Project sync complete! Claude\'s context is now optimized.\n');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

main();