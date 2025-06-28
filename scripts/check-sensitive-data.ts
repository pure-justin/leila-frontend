#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Patterns to check for sensitive data
const SENSITIVE_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /private[_-]?key/i,
  /client[_-]?secret/i,
  /firebase.*config/i,
  /stripe.*key/i,
  /AIza[0-9A-Za-z\-_]{35}/g, // Google API key pattern
  /sk_[a-zA-Z0-9]{32}/g, // Stripe secret key pattern
  /pk_[a-zA-Z0-9]{32}/g, // Stripe public key pattern
];

// Files to always check
const FILES_TO_CHECK = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  '.env',
  '.env.local',
  '.env.production',
];

// Directories to skip
const SKIP_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'out',
  'build',
  'dist',
];

async function checkFile(filePath: string): Promise<string[]> {
  const issues: string[] = [];
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      SENSITIVE_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          // Skip if it's a comment or example
          if (!line.trim().startsWith('//') && !line.trim().startsWith('#') && !line.includes('example')) {
            issues.push(`${filePath}:${index + 1} - Potential sensitive data: ${line.trim()}`);
          }
        }
      });
    });
  } catch (error) {
    // File might not exist or be readable
  }
  
  return issues;
}

async function scanDirectory(dir: string): Promise<string[]> {
  const issues: string[] = [];
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.includes(entry.name)) {
          const subIssues = await scanDirectory(fullPath);
          issues.push(...subIssues);
        }
      } else if (entry.isFile()) {
        // Check TypeScript, JavaScript, JSON files
        if (/\.(ts|tsx|js|jsx|json)$/.test(entry.name)) {
          const fileIssues = await checkFile(fullPath);
          issues.push(...fileIssues);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return issues;
}

async function checkGitStatus() {
  try {
    const { stdout } = await execAsync('git status --porcelain');
    const modifiedFiles = stdout.split('\n').filter(line => line.trim());
    
    if (modifiedFiles.length > 0) {
      console.log('\n📝 Modified files:');
      modifiedFiles.forEach(file => console.log(`  ${file}`));
    }
  } catch (error) {
    console.error('Error checking git status:', error);
  }
}

async function main() {
  console.log('🔍 Checking for sensitive data...\n');
  
  const issues: string[] = [];
  
  // Check specific files
  for (const file of FILES_TO_CHECK) {
    const fileIssues = await checkFile(file);
    issues.push(...fileIssues);
  }
  
  // Scan directories
  const srcIssues = await scanDirectory('app');
  issues.push(...srcIssues);
  
  const componentIssues = await scanDirectory('components');
  issues.push(...componentIssues);
  
  const libIssues = await scanDirectory('lib');
  issues.push(...libIssues);
  
  // Report findings
  if (issues.length > 0) {
    console.log('⚠️  Potential sensitive data found:\n');
    issues.forEach(issue => console.log(`  ${issue}`));
    console.log('\n❌ Please review and remove sensitive data before committing!');
    process.exit(1);
  } else {
    console.log('✅ No obvious sensitive data patterns found.');
    console.log('\n⚠️  Remember to still manually review for:');
    console.log('  - Business logic that should remain private');
    console.log('  - Customer data or PII');
    console.log('  - Internal URLs or endpoints');
    console.log('  - Proprietary algorithms');
  }
  
  // Check git status
  await checkGitStatus();
}

main().catch(console.error);