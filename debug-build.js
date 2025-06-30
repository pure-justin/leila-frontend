#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 ROBUST BUILD DEBUG SYSTEM STARTING...\n');

// Memory monitoring
const startMemory = process.memoryUsage();
console.log('📊 Initial Memory Usage:', {
  rss: `${Math.round(startMemory.rss / 1024 / 1024)}MB`,
  heapUsed: `${Math.round(startMemory.heapUsed / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(startMemory.heapTotal / 1024 / 1024)}MB`,
  external: `${Math.round(startMemory.external / 1024 / 1024)}MB`
});

let memoryInterval;

function startMemoryMonitoring() {
  memoryInterval = setInterval(() => {
    const mem = process.memoryUsage();
    console.log(`🧠 Memory: RSS=${Math.round(mem.rss/1024/1024)}MB, Heap=${Math.round(mem.heapUsed/1024/1024)}MB/${Math.round(mem.heapTotal/1024/1024)}MB`);
  }, 5000);
}

function stopMemoryMonitoring() {
  if (memoryInterval) clearInterval(memoryInterval);
}

// File analysis functions
function analyzeProjectStructure() {
  console.log('\n📁 ANALYZING PROJECT STRUCTURE...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log('📦 Package Info:', {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length
    });
  } catch (e) {
    console.error('❌ Could not read package.json:', e.message);
  }

  // Check for large files
  console.log('\n📏 LARGE FILES (>100KB):');
  try {
    const result = execSync('find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -c | sort -rn | head -20', { encoding: 'utf8' });
    console.log(result);
  } catch (e) {
    console.error('❌ Could not analyze large files:', e.message);
  }
}

function detectCircularDependencies() {
  console.log('\n🔄 DETECTING CIRCULAR DEPENDENCIES...');
  
  const fileImports = new Map();
  const visited = new Set();
  const recursionStack = new Set();
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      
      // Match various import patterns
      const importRegex = /import.*from\s+['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        
        // Resolve relative imports
        if (importPath.startsWith('./') || importPath.startsWith('../')) {
          importPath = path.resolve(path.dirname(filePath), importPath);
          
          // Try different extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            const fullPath = importPath + ext;
            if (fs.existsSync(fullPath)) {
              imports.push(fullPath);
              break;
            }
          }
        } else if (importPath.startsWith('@/')) {
          // Handle alias imports
          const relativePath = importPath.replace('@/', './');
          const fullPath = path.resolve(process.cwd(), relativePath);
          
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            const testPath = fullPath + ext;
            if (fs.existsSync(testPath)) {
              imports.push(testPath);
              break;
            }
          }
        }
      }
      
      return imports;
    } catch (e) {
      console.warn(`⚠️  Could not scan ${filePath}: ${e.message}`);
      return [];
    }
  }
  
  function detectCycle(filePath, path = []) {
    if (recursionStack.has(filePath)) {
      const cycleStart = path.indexOf(filePath);
      const cycle = path.slice(cycleStart).concat([filePath]);
      console.log('🚨 CIRCULAR DEPENDENCY FOUND:');
      cycle.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.replace(process.cwd(), '.')}`);
      });
      return true;
    }
    
    if (visited.has(filePath)) return false;
    
    visited.add(filePath);
    recursionStack.add(filePath);
    
    const imports = fileImports.get(filePath) || scanFile(filePath);
    fileImports.set(filePath, imports);
    
    for (const importPath of imports) {
      if (detectCycle(importPath, [...path, filePath])) {
        return true;
      }
    }
    
    recursionStack.delete(filePath);
    return false;
  }
  
  // Scan key files
  const keyFiles = [
    './app/layout.tsx',
    './app/page.tsx',
    './app/book/page.tsx',
    './components/PersonalizedHomePage.tsx',
    './lib/comprehensive-services-catalog.ts',
    './lib/service-images.ts'
  ];
  
  let foundCycles = false;
  for (const file of keyFiles) {
    if (fs.existsSync(file)) {
      console.log(`🔍 Scanning ${file}...`);
      if (detectCycle(path.resolve(file))) {
        foundCycles = true;
      }
    }
  }
  
  if (!foundCycles) {
    console.log('✅ No obvious circular dependencies found in key files');
  }
}

function analyzeImportPatterns() {
  console.log('\n📋 ANALYZING IMPORT PATTERNS...');
  
  try {
    const result = execSync(`find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs grep -h "^import" | sort | uniq -c | sort -rn | head -20`, { encoding: 'utf8' });
    console.log('Most common imports:');
    console.log(result);
  } catch (e) {
    console.error('❌ Could not analyze imports:', e.message);
  }
  
  // Check for problematic imports
  console.log('\n🚨 CHECKING FOR PROBLEMATIC IMPORTS...');
  try {
    const problematicPatterns = [
      'service-images-local',
      'service-images-expanded', 
      'service-images-optimized',
      'professional-service-images',
      'service-image-mapping'
    ];
    
    for (const pattern of problematicPatterns) {
      try {
        const result = execSync(`grep -r "${pattern}" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules`, { encoding: 'utf8' });
        if (result.trim()) {
          console.log(`❌ Found references to deleted file: ${pattern}`);
          console.log(result);
        }
      } catch (e) {
        // No matches found (which is good)
      }
    }
  } catch (e) {
    console.error('❌ Could not check for problematic imports:', e.message);
  }
}

function analyzeNextConfig() {
  console.log('\n⚙️  ANALYZING NEXT.JS CONFIG...');
  
  try {
    if (fs.existsSync('next.config.js')) {
      const config = fs.readFileSync('next.config.js', 'utf8');
      console.log('📄 Next.js config content:');
      console.log(config);
      
      // Check for memory-intensive options
      if (config.includes('experimental')) {
        console.log('⚠️  Experimental features detected');
      }
      if (config.includes('webpack')) {
        console.log('⚠️  Custom webpack config detected');
      }
    }
  } catch (e) {
    console.error('❌ Could not analyze next.config.js:', e.message);
  }
}

function checkTypeScriptConfig() {
  console.log('\n📝 CHECKING TYPESCRIPT CONFIG...');
  
  try {
    if (fs.existsSync('tsconfig.json')) {
      const config = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      console.log('🔧 TypeScript config:', {
        strict: config.compilerOptions?.strict,
        target: config.compilerOptions?.target,
        module: config.compilerOptions?.module,
        skipLibCheck: config.compilerOptions?.skipLibCheck,
        incremental: config.compilerOptions?.incremental
      });
    }
  } catch (e) {
    console.error('❌ Could not analyze tsconfig.json:', e.message);
  }
}

async function attemptBuildWithLogging() {
  console.log('\n🏗️  ATTEMPTING BUILD WITH ENHANCED LOGGING...');
  
  // Create a custom Next.js config with logging
  const debugConfig = `
const originalConfig = require('./next.config.js');

module.exports = {
  ...originalConfig,
  webpack: (config, { dev, isServer }) => {
    // Log webpack stats
    console.log('📊 Webpack Config Analysis:', {
      mode: config.mode,
      target: config.target,
      entrypoints: Object.keys(config.entry || {}),
      isServer,
      isDev: dev
    });
    
    // Add memory monitoring
    const originalBuild = config.plugins?.find(p => p.constructor.name === 'DefinePlugin');
    
    config.plugins = config.plugins || [];
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('MemoryMonitor', () => {
          const mem = process.memoryUsage();
          console.log(\`🧠 Pre-compile Memory: \${Math.round(mem.heapUsed/1024/1024)}MB\`);
        });
        
        compiler.hooks.afterCompile.tap('MemoryMonitor', () => {
          const mem = process.memoryUsage();
          console.log(\`🧠 Post-compile Memory: \${Math.round(mem.heapUsed/1024/1024)}MB\`);
        });
      }
    });
    
    // Call original webpack config if it exists
    if (originalConfig.webpack) {
      return originalConfig.webpack(config, { dev, isServer });
    }
    
    return config;
  }
};
`;

  fs.writeFileSync('next.config.debug.js', debugConfig);
  
  startMemoryMonitoring();
  
  try {
    console.log('🚀 Starting build with debug config...');
    const buildCommand = 'NEXT_CONFIG=next.config.debug.js node --max-old-space-size=8192 --trace-warnings --trace-uncaught node_modules/.bin/next build';
    
    execSync(buildCommand, { 
      stdio: 'inherit',
      timeout: 300000 // 5 minute timeout
    });
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    
    // Additional error analysis
    if (error.message.includes('heap')) {
      console.log('\n💡 MEMORY LEAK DETECTION TIPS:');
      console.log('1. Large object retention in closures');
      console.log('2. Circular references preventing garbage collection');
      console.log('3. Event listeners not being cleaned up');
      console.log('4. Large data structures being duplicated');
    }
  } finally {
    stopMemoryMonitoring();
    
    // Cleanup debug config
    if (fs.existsSync('next.config.debug.js')) {
      fs.unlinkSync('next.config.debug.js');
    }
  }
}

// Main execution
async function runDiagnostics() {
  console.log('🎯 Running comprehensive build diagnostics...\n');
  
  analyzeProjectStructure();
  detectCircularDependencies();
  analyzeImportPatterns();
  analyzeNextConfig();
  checkTypeScriptConfig();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 DIAGNOSTIC SUMMARY COMPLETE');
  console.log('='.repeat(60));
  
  // Ask user if they want to attempt the build
  console.log('\n🤔 Would you like to attempt a build with enhanced monitoring?');
  console.log('This will help identify exactly where the memory leak occurs...');
  
  // For automation, we'll attempt it
  await attemptBuildWithLogging();
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  stopMemoryMonitoring();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  stopMemoryMonitoring();
  process.exit(1);
});

// Run the diagnostics
runDiagnostics().catch(console.error);