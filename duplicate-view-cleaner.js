#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color codes for beautiful output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString().substring(11, 23);
  const levelColors = {
    INFO: colors.cyan,
    SUCCESS: colors.green,
    WARNING: colors.yellow,
    ERROR: colors.red,
    CLEANUP: colors.magenta
  };
  
  const color = levelColors[level] || colors.reset;
  console.log(`${color}[${timestamp}] ${level}:${colors.reset} ${message}`);
  
  if (data) {
    console.log(`${colors.bright}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }
}

function logHeader(title) {
  const border = '='.repeat(80);
  console.log(`\n${colors.bgYellow}${colors.bright} ${title.toUpperCase()} ${colors.reset}`);
  console.log(`${colors.yellow}${border}${colors.reset}`);
}

class DuplicateViewCleaner {
  constructor() {
    this.duplicates = new Map();
    this.similarComponents = new Map();
    this.unusedFiles = [];
    this.totalSavings = 0;
  }

  async analyzeDuplicateViews() {
    logHeader('🕵️ HUNTING DOWN DUPLICATE VIEWS');
    
    log('INFO', '🔍 Scanning for duplicate and similar components...');
    
    const directories = [
      './app',
      './components', 
      './pages'
    ];
    
    const allFiles = [];
    
    // Collect all component files
    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        this.scanDirectory(dir, allFiles);
      }
    }
    
    log('INFO', `📁 Found ${allFiles.length} component files to analyze`);
    
    // Analyze each file for duplicates
    await this.findDuplicates(allFiles);
    await this.findSimilarComponents(allFiles);
    await this.findUnusedFiles(allFiles);
    
    this.generateCleanupReport();
  }
  
  scanDirectory(dir, fileList) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        this.scanDirectory(fullPath, fileList);
      } else if (this.isComponentFile(file.name)) {
        const stats = fs.statSync(fullPath);
        fileList.push({
          path: fullPath,
          name: file.name,
          size: stats.size,
          directory: dir,
          lastModified: stats.mtime
        });
      }
    }
  }
  
  isComponentFile(filename) {
    return /\.(tsx|jsx|ts|js)$/.test(filename) && 
           !filename.endsWith('.d.ts') &&
           !filename.includes('.test.') &&
           !filename.includes('.spec.');
  }
  
  async findDuplicates(files) {
    log('INFO', '🔍 Looking for exact duplicates...');
    
    const contentMap = new Map();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const normalizedContent = this.normalizeContent(content);
        const hash = this.simpleHash(normalizedContent);
        
        if (contentMap.has(hash)) {
          contentMap.get(hash).push(file);
        } else {
          contentMap.set(hash, [file]);
        }
      } catch (e) {
        log('WARNING', `Could not read ${file.path}: ${e.message}`);
      }
    }
    
    // Find actual duplicates
    for (const [hash, duplicateFiles] of contentMap) {
      if (duplicateFiles.length > 1) {
        // Sort by last modified to keep the newest
        duplicateFiles.sort((a, b) => b.lastModified - a.lastModified);
        const keepFile = duplicateFiles[0];
        const deleteFiles = duplicateFiles.slice(1);
        
        this.duplicates.set(hash, {
          keep: keepFile,
          delete: deleteFiles,
          savings: deleteFiles.reduce((sum, f) => sum + f.size, 0)
        });
        
        log('WARNING', `🚨 EXACT DUPLICATES FOUND:`);
        log('WARNING', `   Keep: ${keepFile.path} (${keepFile.lastModified.toISOString()})`);
        deleteFiles.forEach(f => {
          log('WARNING', `   Delete: ${f.path} (${Math.round(f.size/1024)}KB)`);
        });
      }
    }
  }
  
  async findSimilarComponents(files) {
    log('INFO', '🔍 Looking for similar components (80%+ match)...');
    
    const components = [];
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const analysis = this.analyzeComponent(content, file);
        if (analysis) {
          components.push({ file, analysis });
        }
      } catch (e) {
        // Skip files we can't read
      }
    }
    
    // Compare components for similarity
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];
        
        const similarity = this.calculateSimilarity(comp1.analysis, comp2.analysis);
        
        if (similarity > 0.8) {
          const key = `${comp1.file.name}_${comp2.file.name}`;
          this.similarComponents.set(key, {
            file1: comp1.file,
            file2: comp2.file,
            similarity: Math.round(similarity * 100),
            analysis1: comp1.analysis,
            analysis2: comp2.analysis
          });
        }
      }
    }
    
    if (this.similarComponents.size > 0) {
      log('WARNING', `🔍 Found ${this.similarComponents.size} pairs of similar components:`);
      for (const [key, similar] of this.similarComponents) {
        log('WARNING', `   ${similar.similarity}% similar: ${similar.file1.path} & ${similar.file2.path}`);
      }
    }
  }
  
  analyzeComponent(content, file) {
    // Extract key features of the component
    const features = {
      imports: [],
      exports: [],
      functions: [],
      hooks: [],
      jsxElements: [],
      props: [],
      className: ''
    };
    
    // Extract imports
    const importMatches = content.match(/import.*from.*['"`]([^'"`]+)['"`]/g) || [];
    features.imports = importMatches.map(imp => imp.match(/from.*['"`]([^'"`]+)['"`]/)?.[1]).filter(Boolean);
    
    // Extract function/component names
    const functionMatches = content.match(/(?:function|const)\s+(\w+)/g) || [];
    features.functions = functionMatches.map(f => f.match(/(?:function|const)\s+(\w+)/)?.[1]).filter(Boolean);
    
    // Extract hooks
    const hookMatches = content.match(/use\w+\s*\(/g) || [];
    features.hooks = hookMatches.map(h => h.replace(/\s*\($/, ''));
    
    // Extract JSX elements
    const jsxMatches = content.match(/<(\w+)(?:\s|>)/g) || [];
    features.jsxElements = [...new Set(jsxMatches.map(jsx => jsx.match(/<(\w+)/)?.[1]).filter(Boolean))];
    
    // Get main export name
    const exportMatch = content.match(/export\s+(?:default\s+)?(?:function\s+)?(\w+)/);
    if (exportMatch) {
      features.className = exportMatch[1];
    }
    
    return features;
  }
  
  calculateSimilarity(analysis1, analysis2) {
    let totalScore = 0;
    let maxScore = 0;
    
    // Compare imports
    const commonImports = analysis1.imports.filter(imp => analysis2.imports.includes(imp));
    const totalImports = new Set([...analysis1.imports, ...analysis2.imports]).size;
    if (totalImports > 0) {
      totalScore += (commonImports.length / totalImports) * 0.3;
    }
    maxScore += 0.3;
    
    // Compare functions
    const commonFunctions = analysis1.functions.filter(fn => analysis2.functions.includes(fn));
    const totalFunctions = new Set([...analysis1.functions, ...analysis2.functions]).size;
    if (totalFunctions > 0) {
      totalScore += (commonFunctions.length / totalFunctions) * 0.2;
    }
    maxScore += 0.2;
    
    // Compare hooks
    const commonHooks = analysis1.hooks.filter(hook => analysis2.hooks.includes(hook));
    const totalHooks = new Set([...analysis1.hooks, ...analysis2.hooks]).size;
    if (totalHooks > 0) {
      totalScore += (commonHooks.length / totalHooks) * 0.2;
    }
    maxScore += 0.2;
    
    // Compare JSX elements
    const commonJSX = analysis1.jsxElements.filter(el => analysis2.jsxElements.includes(el));
    const totalJSX = new Set([...analysis1.jsxElements, ...analysis2.jsxElements]).size;
    if (totalJSX > 0) {
      totalScore += (commonJSX.length / totalJSX) * 0.3;
    }
    maxScore += 0.3;
    
    return maxScore > 0 ? totalScore / maxScore : 0;
  }
  
  async findUnusedFiles(files) {
    log('INFO', '🔍 Looking for unused files...');
    
    // Create a map of all imports across the project
    const importMap = new Map();
    const allImports = new Set();
    
    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const imports = this.extractImports(content, file.path);
        importMap.set(file.path, imports);
        imports.forEach(imp => allImports.add(imp));
      } catch (e) {
        // Skip files we can't read
      }
    }
    
    // Check which files are never imported
    for (const file of files) {
      const relativePath = file.path.replace(process.cwd(), '.');
      const possibleImports = [
        relativePath,
        relativePath.replace(/\.(tsx|jsx|ts|js)$/, ''),
        file.path,
        file.path.replace(/\.(tsx|jsx|ts|js)$/, '')
      ];
      
      const isImported = possibleImports.some(possiblePath => {
        return Array.from(allImports).some(imp => imp.includes(possiblePath));
      });
      
      // Check if it's an entry point (pages, layout, etc.)
      const isEntryPoint = file.path.includes('/app/') && 
                          (file.name === 'page.tsx' || 
                           file.name === 'layout.tsx' || 
                           file.name === 'loading.tsx' ||
                           file.name === 'error.tsx' ||
                           file.name === 'not-found.tsx');
      
      if (!isImported && !isEntryPoint && file.size > 1000) { // Skip tiny files
        this.unusedFiles.push(file);
      }
    }
    
    if (this.unusedFiles.length > 0) {
      log('WARNING', `🗑️  Found ${this.unusedFiles.length} potentially unused files:`);
      this.unusedFiles.forEach(f => {
        log('WARNING', `   ${f.path} (${Math.round(f.size/1024)}KB)`);
      });
    }
  }
  
  extractImports(content, fromFile) {
    const imports = [];
    const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
        imports.push(this.resolveImportPath(importPath, fromFile));
      }
    }
    
    return imports.filter(Boolean);
  }
  
  resolveImportPath(importPath, fromFile) {
    let resolved;
    
    if (importPath.startsWith('@/')) {
      resolved = path.resolve(process.cwd(), importPath.replace('@/', './'));
    } else {
      resolved = path.resolve(path.dirname(fromFile), importPath);
    }
    
    return resolved;
  }
  
  normalizeContent(content) {
    return content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
  
  generateCleanupReport() {
    logHeader('🧹 CLEANUP REPORT & RECOMMENDATIONS');
    
    let totalSavings = 0;
    let cleanupActions = [];
    
    // Report exact duplicates
    if (this.duplicates.size > 0) {
      log('ERROR', `🚨 FOUND ${this.duplicates.size} SETS OF EXACT DUPLICATES!`);
      
      for (const [hash, duplicate] of this.duplicates) {
        const savingsKB = Math.round(duplicate.savings / 1024);
        totalSavings += duplicate.savings;
        
        cleanupActions.push({
          type: 'DELETE_DUPLICATES',
          priority: 'HIGH',
          savings: savingsKB,
          files: duplicate.delete.map(f => f.path),
          keep: duplicate.keep.path
        });
      }
    } else {
      log('SUCCESS', '✅ No exact duplicates found!');
    }
    
    // Report similar components
    if (this.similarComponents.size > 0) {
      log('WARNING', `⚠️  Found ${this.similarComponents.size} pairs of similar components`);
      
      for (const [key, similar] of this.similarComponents) {
        if (similar.similarity > 90) {
          cleanupActions.push({
            type: 'MERGE_SIMILAR',
            priority: 'MEDIUM',
            similarity: similar.similarity,
            file1: similar.file1.path,
            file2: similar.file2.path
          });
        }
      }
    }
    
    // Report unused files
    if (this.unusedFiles.length > 0) {
      const unusedSavings = this.unusedFiles.reduce((sum, f) => sum + f.size, 0);
      totalSavings += unusedSavings;
      
      log('WARNING', `🗑️  Found ${this.unusedFiles.length} unused files (${Math.round(unusedSavings/1024)}KB)`);
      
      cleanupActions.push({
        type: 'DELETE_UNUSED',
        priority: 'LOW',
        savings: Math.round(unusedSavings / 1024),
        files: this.unusedFiles.map(f => f.path)
      });
    }
    
    // Generate cleanup script
    this.generateCleanupScript(cleanupActions);
    
    log('SUCCESS', `💾 Total potential savings: ${Math.round(totalSavings/1024)}KB`);
    log('SUCCESS', `🧹 Generated cleanup script: cleanup-duplicates.sh`);
    
    if (cleanupActions.length > 0) {
      log('CLEANUP', '🚀 Run the cleanup script to make your build GREAT AGAIN!');
      log('CLEANUP', '   bash cleanup-duplicates.sh');
    } else {
      log('SUCCESS', '🎉 Your project is already clean! No major duplicates found.');
    }
  }
  
  generateCleanupScript(actions) {
    let script = `#!/bin/bash
# 🧹 DUPLICATE VIEW CLEANER SCRIPT
# Generated on ${new Date().toISOString()}
# This script will MAKE YOUR BUILD GREAT AGAIN! 🚀

set -e

echo "🧹 Starting duplicate view cleanup..."
echo "💪 We're going to CRUSH these duplicates!"

# Create backup directory
BACKUP_DIR="./cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 Created backup directory: $BACKUP_DIR"

`;

    let totalFiles = 0;
    
    for (const action of actions) {
      switch (action.type) {
        case 'DELETE_DUPLICATES':
          script += `\n# 🚨 DELETE EXACT DUPLICATES (${action.savings}KB savings)\n`;
          script += `echo "🗑️  Removing exact duplicates..."\n`;
          
          for (const file of action.files) {
            script += `echo "  Backing up and deleting: ${file}"\n`;
            script += `cp "${file}" "$BACKUP_DIR/$(basename "${file}")-duplicate-$(date +%s)" 2>/dev/null || true\n`;
            script += `rm "${file}"\n`;
            totalFiles++;
          }
          break;
          
        case 'DELETE_UNUSED':
          script += `\n# 🗑️  DELETE UNUSED FILES (${action.savings}KB savings)\n`;
          script += `echo "🧹 Removing unused files..."\n`;
          
          for (const file of action.files) {
            script += `echo "  Backing up and deleting unused: ${file}"\n`;
            script += `cp "${file}" "$BACKUP_DIR/$(basename "${file}")-unused-$(date +%s)" 2>/dev/null || true\n`;
            script += `rm "${file}"\n`;
            totalFiles++;
          }
          break;
          
        case 'MERGE_SIMILAR':
          script += `\n# ⚠️  SIMILAR COMPONENTS (${action.similarity}% match) - MANUAL REVIEW NEEDED\n`;
          script += `echo "📝 Similar components found (manual review needed):"\n`;
          script += `echo "  File 1: ${action.file1}"\n`;
          script += `echo "  File 2: ${action.file2}"\n`;
          script += `echo "  Similarity: ${action.similarity}%"\n`;
          break;
      }
    }
    
    script += `
echo ""
echo "🎉 CLEANUP COMPLETE! 🎉"
echo "📊 Files processed: ${totalFiles}"
echo "📦 Backup created in: $BACKUP_DIR"
echo ""
echo "🚀 Your build is now CLEAN and FAST!"
echo "💪 Time to make it GREAT AGAIN!"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. Test your app"
echo "3. If everything works, you can delete the backup"
echo ""
`;

    fs.writeFileSync('./cleanup-duplicates.sh', script);
    fs.chmodSync('./cleanup-duplicates.sh', 0o755);
  }
}

// Main execution
async function main() {
  logHeader('🕵️ DUPLICATE VIEW CLEANER - MAKE IT GREAT AGAIN!');
  
  log('INFO', '🔥 Time to clean up those duplicate views!');
  log('INFO', '💪 We\'re going to find EVERY duplicate and CRUSH them!');
  
  const cleaner = new DuplicateViewCleaner();
  await cleaner.analyzeDuplicateViews();
  
  log('SUCCESS', '🎯 Mission accomplished! Check the cleanup script above.');
}

main().catch(console.error);