#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const os = require('os');

// Color codes for beautiful console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

// Enhanced logging functions
function log(level, message, data = null) {
  const timestamp = new Date().toISOString().substring(11, 23);
  const levelColors = {
    INFO: colors.cyan,
    SUCCESS: colors.green,
    WARNING: colors.yellow,
    ERROR: colors.red,
    DEBUG: colors.magenta,
    MEMORY: colors.blue,
    SYSTEM: colors.white
  };
  
  const color = levelColors[level] || colors.white;
  console.log(`${color}[${timestamp}] ${level}:${colors.reset} ${message}`);
  
  if (data) {
    console.log(`${colors.bright}${JSON.stringify(data, null, 2)}${colors.reset}`);
  }
}

function logHeader(title) {
  const border = '='.repeat(80);
  console.log(`\n${colors.bgCyan}${colors.bright} ${title.toUpperCase()} ${colors.reset}`);
  console.log(`${colors.cyan}${border}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bgBlue}${colors.white} ${title} ${colors.reset}`);
  console.log(`${colors.blue}${'─'.repeat(50)}${colors.reset}`);
}

// System information
function getSystemInfo() {
  logSection('SYSTEM INFORMATION');
  
  const systemInfo = {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
    freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
    cpuCount: os.cpus().length,
    hostname: os.hostname(),
    uptime: `${Math.round(os.uptime() / 3600)}h`,
    loadAverage: os.loadavg()
  };
  
  log('SYSTEM', 'System specifications:', systemInfo);
  
  // Check Node.js memory limits
  const v8Heap = process.memoryUsage();
  log('MEMORY', 'Current Node.js memory usage:', {
    rss: `${Math.round(v8Heap.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(v8Heap.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(v8Heap.heapTotal / 1024 / 1024)}MB`,
    external: `${Math.round(v8Heap.external / 1024 / 1024)}MB`,
    arrayBuffers: `${Math.round(v8Heap.arrayBuffers / 1024 / 1024)}MB`
  });
}

// Deep project analysis
function analyzeProject() {
  logSection('PROJECT STRUCTURE ANALYSIS');
  
  try {
    // Analyze package.json
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    log('INFO', 'Package information:', {
      name: packageJson.name,
      version: packageJson.version,
      nextVersion: packageJson.dependencies?.next,
      reactVersion: packageJson.dependencies?.react,
      typescriptVersion: packageJson.devDependencies?.typescript,
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length
    });
    
    // Check for problematic dependencies
    const problematicDeps = [
      '@vercel/analytics', '@vercel/speed-insights', 'sharp', 'canvas',
      '@tensorflow/tfjs', 'three', 'babylon', 'webgl'
    ];
    
    const foundProblematic = problematicDeps.filter(dep => 
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    );
    
    if (foundProblematic.length > 0) {
      log('WARNING', 'Memory-intensive dependencies found:', foundProblematic);
    }
    
  } catch (e) {
    log('ERROR', 'Could not analyze package.json:', e.message);
  }
  
  // File count analysis
  try {
    const counts = {
      totalFiles: 0,
      jsFiles: 0,
      tsFiles: 0,
      tsxFiles: 0,
      cssFiles: 0,
      imageFiles: 0,
      nodeModules: 0
    };
    
    function countFiles(dir, isNodeModules = false) {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          if (file.name === 'node_modules') {
            countFiles(fullPath, true);
          } else if (!isNodeModules) {
            countFiles(fullPath);
          }
        } else {
          counts.totalFiles++;
          if (isNodeModules) counts.nodeModules++;
          
          const ext = path.extname(file.name).toLowerCase();
          switch (ext) {
            case '.js': case '.jsx': counts.jsFiles++; break;
            case '.ts': counts.tsFiles++; break;
            case '.tsx': counts.tsxFiles++; break;
            case '.css': case '.scss': case '.sass': counts.cssFiles++; break;
            case '.png': case '.jpg': case '.jpeg': case '.gif': case '.svg': case '.webp':
              counts.imageFiles++; break;
          }
        }
      }
    }
    
    countFiles('.');
    log('INFO', 'File analysis:', counts);
    
    if (counts.nodeModules > 50000) {
      log('WARNING', 'Excessive node_modules files detected!', { count: counts.nodeModules });
    }
    
  } catch (e) {
    log('ERROR', 'File counting failed:', e.message);
  }
  
  // Large file detection
  try {
    log('INFO', 'Scanning for large files...');
    const largeFiles = [];
    
    function scanForLargeFiles(dir, maxDepth = 3, currentDepth = 0) {
      if (currentDepth > maxDepth || !fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory() && file.name !== 'node_modules' && file.name !== '.git') {
          scanForLargeFiles(fullPath, maxDepth, currentDepth + 1);
        } else if (file.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            const sizeKB = Math.round(stats.size / 1024);
            
            if (sizeKB > 100) { // Files larger than 100KB
              largeFiles.push({
                file: fullPath.replace(process.cwd(), '.'),
                size: `${sizeKB}KB`,
                sizeBytes: stats.size
              });
            }
          } catch (e) {
            // Ignore permission errors
          }
        }
      }
    }
    
    scanForLargeFiles('.');
    largeFiles.sort((a, b) => b.sizeBytes - a.sizeBytes);
    
    log('INFO', `Found ${largeFiles.length} large files:`, largeFiles.slice(0, 15));
    
  } catch (e) {
    log('ERROR', 'Large file scan failed:', e.message);
  }
}

// Advanced dependency analysis
function analyzeDependencies() {
  logSection('DEPENDENCY ANALYSIS');
  
  return new Promise((resolve) => {
    // Check for circular dependencies with madge
    exec('npx madge --circular --format json .', (error, stdout, stderr) => {
      if (error) {
        log('WARNING', 'Madge not available, using manual detection');
        manualCircularDetection();
        resolve();
      } else {
        try {
          const circular = JSON.parse(stdout);
          if (circular.length > 0) {
            log('ERROR', 'Circular dependencies detected:', circular);
          } else {
            log('SUCCESS', 'No circular dependencies found');
          }
        } catch (e) {
          log('WARNING', 'Could not parse madge output');
        }
        resolve();
      }
    });
  });
}

function manualCircularDetection() {
  const importMap = new Map();
  const visited = new Set();
  const processing = new Set();
  const cycles = [];
  
  function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      
      // Enhanced import detection
      const importPatterns = [
        /import\s+(?:.*\s+from\s+)?['"`]([^'"`]+)['"`]/g,
        /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
        /from\s+['"`]([^'"`]+)['"`]/g
      ];
      
      for (const pattern of importPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('.') || importPath.startsWith('@/')) {
            const resolved = resolveImportPath(importPath, filePath);
            if (resolved) imports.push(resolved);
          }
        }
      }
      
      return imports;
    } catch (e) {
      return [];
    }
  }
  
  function resolveImportPath(importPath, fromFile) {
    let resolved;
    
    if (importPath.startsWith('@/')) {
      resolved = path.resolve(process.cwd(), importPath.replace('@/', './'));
    } else {
      resolved = path.resolve(path.dirname(fromFile), importPath);
    }
    
    const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    
    for (const ext of extensions) {
      const fullPath = resolved + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    return null;
  }
  
  function detectCycle(file, path = []) {
    if (processing.has(file)) {
      const cycleStart = path.indexOf(file);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat([file]);
        cycles.push(cycle.map(f => f.replace(process.cwd(), '.')));
        return true;
      }
    }
    
    if (visited.has(file)) return false;
    
    visited.add(file);
    processing.add(file);
    
    const imports = importMap.get(file) || scanFile(file);
    importMap.set(file, imports);
    
    for (const imp of imports) {
      if (detectCycle(imp, [...path, file])) {
        return true;
      }
    }
    
    processing.delete(file);
    return false;
  }
  
  // Scan key entry points
  const entryPoints = [
    './app/layout.tsx',
    './app/page.tsx',
    './app/book/page.tsx',
    './lib/comprehensive-services-catalog.ts',
    './lib/service-images.ts'
  ];
  
  for (const entry of entryPoints) {
    if (fs.existsSync(entry)) {
      detectCycle(path.resolve(entry));
    }
  }
  
  if (cycles.length > 0) {
    log('ERROR', `Found ${cycles.length} circular dependencies:`, cycles);
  } else {
    log('SUCCESS', 'No circular dependencies found in manual scan');
  }
}

// Memory monitoring class
class MemoryMonitor {
  constructor() {
    this.snapshots = [];
    this.interval = null;
    this.startTime = Date.now();
  }
  
  start() {
    log('MEMORY', 'Starting continuous memory monitoring...');
    
    this.interval = setInterval(() => {
      const mem = process.memoryUsage();
      const snapshot = {
        timestamp: Date.now() - this.startTime,
        rss: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
        arrayBuffers: Math.round(mem.arrayBuffers / 1024 / 1024)
      };
      
      this.snapshots.push(snapshot);
      
      // Alert on dangerous memory usage
      if (snapshot.rss > 3000) {
        log('ERROR', `🚨 CRITICAL MEMORY USAGE: ${snapshot.rss}MB RSS`);
      } else if (snapshot.rss > 2000) {
        log('WARNING', `⚠️  HIGH MEMORY USAGE: ${snapshot.rss}MB RSS`);
      }
      
      // Log every 5 seconds
      if (this.snapshots.length % 5 === 0) {
        log('MEMORY', `Memory: RSS=${snapshot.rss}MB, Heap=${snapshot.heapUsed}/${snapshot.heapTotal}MB`);
      }
      
    }, 1000); // Every second
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    this.analyzeMemoryPattern();
  }
  
  analyzeMemoryPattern() {
    if (this.snapshots.length === 0) return;
    
    logSection('MEMORY ANALYSIS');
    
    const maxRSS = Math.max(...this.snapshots.map(s => s.rss));
    const maxHeap = Math.max(...this.snapshots.map(s => s.heapUsed));
    const avgRSS = Math.round(this.snapshots.reduce((sum, s) => sum + s.rss, 0) / this.snapshots.length);
    const avgHeap = Math.round(this.snapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.snapshots.length);
    
    log('MEMORY', 'Memory usage summary:', {
      duration: `${Math.round((Date.now() - this.startTime) / 1000)}s`,
      samples: this.snapshots.length,
      maxRSS: `${maxRSS}MB`,
      maxHeap: `${maxHeap}MB`,
      avgRSS: `${avgRSS}MB`,
      avgHeap: `${avgHeap}MB`
    });
    
    // Detect memory leaks
    if (this.snapshots.length > 10) {
      const firstQuarter = this.snapshots.slice(0, Math.floor(this.snapshots.length / 4));
      const lastQuarter = this.snapshots.slice(-Math.floor(this.snapshots.length / 4));
      
      const firstAvg = firstQuarter.reduce((sum, s) => sum + s.heapUsed, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((sum, s) => sum + s.heapUsed, 0) / lastQuarter.length;
      
      const growthRate = ((lastAvg - firstAvg) / firstAvg) * 100;
      
      if (growthRate > 50) {
        log('ERROR', `🚨 MEMORY LEAK DETECTED: ${Math.round(growthRate)}% growth in heap usage`);
      } else if (growthRate > 20) {
        log('WARNING', `⚠️  Possible memory leak: ${Math.round(growthRate)}% growth in heap usage`);
      } else {
        log('SUCCESS', `✅ Memory usage appears stable (${Math.round(growthRate)}% growth)`);
      }
    }
    
    // Show memory spikes
    const spikes = this.snapshots.filter((snapshot, i) => {
      if (i === 0) return false;
      const prev = this.snapshots[i - 1];
      return snapshot.rss - prev.rss > 100; // 100MB spike
    });
    
    if (spikes.length > 0) {
      log('WARNING', `Found ${spikes.length} memory spikes:`, spikes.slice(0, 5));
    }
  }
}

// Enhanced build monitoring
async function runEnhancedBuild() {
  logSection('ENHANCED BUILD MONITORING');
  
  const monitor = new MemoryMonitor();
  monitor.start();
  
  return new Promise((resolve) => {
    log('INFO', 'Starting Next.js build with enhanced monitoring...');
    
    // Create even more detailed Next.js config
    const enhancedConfig = `
const originalConfig = require('./next.config.js') || {};

let compilationPhase = 'initialization';
let compiledFiles = 0;
let errorCount = 0;

module.exports = {
  ...originalConfig,
  
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2
  },
  
  experimental: {
    ...originalConfig.experimental,
    optimizeCss: false,
    optimizeServerReact: false,
    optimizePackageImports: undefined
  },
  
  webpack: (config, { dev, isServer, buildId }) => {
    console.log('\\n🔧 WEBPACK CONFIG PHASE:', {
      phase: compilationPhase,
      isServer,
      isDev: dev,
      buildId: buildId?.slice(0, 8),
      target: config.target,
      mode: config.mode
    });
    
    // Track memory during webpack phases
    const mem = process.memoryUsage();
    console.log('🧠 WEBPACK MEMORY:', {
      rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
      heap: Math.round(mem.heapUsed / 1024 / 1024) + 'MB'
    });
    
    // Add comprehensive logging plugin
    config.plugins = config.plugins || [];
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.beforeCompile.tap('MemoryDebugger', (params) => {
          compilationPhase = 'before-compile';
          const mem = process.memoryUsage();
          console.log('📊 BEFORE-COMPILE:', {
            phase: compilationPhase,
            heap: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
            dependencies: Object.keys(params.dependencies || {}).length
          });
        });
        
        compiler.hooks.compile.tap('MemoryDebugger', () => {
          compilationPhase = 'compiling';
          console.log('⚙️  COMPILATION STARTED');
        });
        
        compiler.hooks.compilation.tap('MemoryDebugger', (compilation) => {
          compilation.hooks.buildModule.tap('MemoryDebugger', (module) => {
            compiledFiles++;
            if (compiledFiles % 100 === 0) {
              const mem = process.memoryUsage();
              console.log(\`📁 COMPILED \${compiledFiles} FILES - Memory: \${Math.round(mem.heapUsed/1024/1024)}MB\`);
            }
            
            // Check for problematic modules
            if (module.resource) {
              const resourcePath = module.resource;
              if (resourcePath.includes('node_modules') && resourcePath.includes('comprehensive-services-catalog')) {
                console.log('🚨 SUSPICIOUS MODULE:', resourcePath);
              }
              if (resourcePath.length > 200) {
                console.log('⚠️  LONG PATH:', resourcePath.slice(-100));
              }
            }
          });
          
          compilation.hooks.failed.tap('MemoryDebugger', (error) => {
            errorCount++;
            console.log('❌ COMPILATION ERROR #' + errorCount + ':', error.message);
          });
          
          compilation.hooks.seal.tap('MemoryDebugger', () => {
            const mem = process.memoryUsage();
            console.log('🔒 SEAL PHASE:', {
              compiledFiles,
              heap: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
              modules: compilation.modules ? compilation.modules.size : 'unknown'
            });
          });
        });
        
        compiler.hooks.afterCompile.tap('MemoryDebugger', (compilation) => {
          const mem = process.memoryUsage();
          console.log('✅ AFTER-COMPILE:', {
            heap: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
            assets: Object.keys(compilation.assets || {}).length,
            warnings: compilation.warnings?.length || 0,
            errors: compilation.errors?.length || 0
          });
        });
        
        compiler.hooks.done.tap('MemoryDebugger', (stats) => {
          compilationPhase = 'done';
          const mem = process.memoryUsage();
          console.log('🏁 COMPILATION DONE:', {
            duration: stats.endTime - stats.startTime + 'ms',
            heap: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
            hasErrors: stats.hasErrors(),
            hasWarnings: stats.hasWarnings()
          });
        });
      }
    });
    
    // Enhanced module resolution logging
    const originalResolve = config.resolve;
    config.resolve = {
      ...originalResolve,
      plugins: [
        ...(originalResolve.plugins || []),
        {
          apply: (resolver) => {
            resolver.hooks.resolve.tap('MemoryDebugger', (request, resolveContext) => {
              if (request.request && request.request.includes('comprehensive-services-catalog')) {
                console.log('🔍 RESOLVING CATALOG:', request.request, 'from', request.context);
              }
            });
          }
        }
      ]
    };
    
    // Call original webpack config if exists
    if (originalConfig.webpack) {
      return originalConfig.webpack(config, { dev, isServer, buildId });
    }
    
    return config;
  }
};
`;

    fs.writeFileSync('next.config.enhanced.js', enhancedConfig);
    
    const buildProcess = spawn('node', [
      '--max-old-space-size=6144',
      '--expose-gc',
      '--trace-gc',
      '--trace-gc-verbose',
      '--heap-prof',
      'node_modules/.bin/next',
      'build'
    ], {
      stdio: ['inherit', 'pipe', 'pipe'],
      env: { ...process.env, NEXT_CONFIG: 'next.config.enhanced.js' }
    });
    
    let outputBuffer = '';
    let errorBuffer = '';
    let lastPhase = '';
    
    buildProcess.stdout.on('data', (data) => {
      const text = data.toString();
      outputBuffer += text;
      
      // Real-time phase detection
      if (text.includes('WEBPACK CONFIG PHASE')) {
        const match = text.match(/phase: '([^']+)'/);
        if (match && match[1] !== lastPhase) {
          lastPhase = match[1];
          log('DEBUG', `📊 Build phase changed to: ${lastPhase}`);
        }
      }
      
      // Real-time memory alerts
      if (text.includes('Memory:') || text.includes('heap:')) {
        const memMatch = text.match(/(\d+)MB/);
        if (memMatch) {
          const memMB = parseInt(memMatch[1]);
          if (memMB > 3000) {
            log('ERROR', `🚨 CRITICAL BUILD MEMORY: ${memMB}MB`);
          }
        }
      }
      
      // Progress tracking
      if (text.includes('COMPILED') && text.includes('FILES')) {
        log('DEBUG', text.trim());
      }
      
      // Error detection
      if (text.includes('ERROR') || text.includes('Failed')) {
        log('ERROR', `Build error: ${text.trim()}`);
      }
      
      process.stdout.write(text);
    });
    
    buildProcess.stderr.on('data', (data) => {
      const text = data.toString();
      errorBuffer += text;
      
      // Memory-related errors
      if (text.includes('heap') || text.includes('memory') || text.includes('allocation')) {
        log('ERROR', `Memory error: ${text.trim()}`);
      }
      
      // GC information
      if (text.includes('Scavenge') || text.includes('Mark-Compact')) {
        log('MEMORY', `GC: ${text.trim()}`);
      }
      
      process.stderr.write(text);
    });
    
    buildProcess.on('exit', (code) => {
      monitor.stop();
      
      log('INFO', `Build process exited with code: ${code}`);
      
      // Cleanup
      if (fs.existsSync('next.config.enhanced.js')) {
        fs.unlinkSync('next.config.enhanced.js');
      }
      
      if (code === 0) {
        log('SUCCESS', '🎉 Build completed successfully!');
      } else {
        log('ERROR', '💥 Build failed - analyzing logs...');
        analyzeBuildFailure(outputBuffer, errorBuffer);
      }
      
      resolve(code);
    });
    
    // Kill after 10 minutes
    setTimeout(() => {
      log('WARNING', '⏰ Build timeout - terminating process');
      buildProcess.kill('SIGKILL');
      monitor.stop();
      resolve(-1);
    }, 600000);
  });
}

function analyzeBuildFailure(stdout, stderr) {
  logSection('BUILD FAILURE ANALYSIS');
  
  // Memory leak patterns
  const memoryPatterns = [
    { pattern: /heap.*out of memory/i, description: 'Heap memory exhaustion' },
    { pattern: /allocation failed/i, description: 'Memory allocation failure' },
    { pattern: /Mark-Compact.*near heap limit/i, description: 'GC unable to free memory' },
    { pattern: /FATAL ERROR.*memory/i, description: 'Fatal memory error' }
  ];
  
  for (const { pattern, description } of memoryPatterns) {
    if (pattern.test(stderr)) {
      log('ERROR', `🎯 Detected: ${description}`);
    }
  }
  
  // Compilation issues
  const compilationPatterns = [
    { pattern: /Module not found/i, description: 'Missing module' },
    { pattern: /Circular dependency/i, description: 'Circular dependency' },
    { pattern: /Type.*not assignable/i, description: 'TypeScript type error' },
    { pattern: /Cannot resolve module/i, description: 'Module resolution failure' }
  ];
  
  for (const { pattern, description } of compilationPatterns) {
    if (pattern.test(stdout) || pattern.test(stderr)) {
      log('WARNING', `⚠️  Detected: ${description}`);
    }
  }
  
  // Webpack issues
  if (stdout.includes('WEBPACK CONFIG PHASE')) {
    const phases = stdout.match(/phase: '([^']+)'/g) || [];
    log('INFO', 'Webpack phases completed:', phases);
    
    const lastPhase = phases[phases.length - 1];
    if (lastPhase && !lastPhase.includes('done')) {
      log('ERROR', `🚨 Build failed during phase: ${lastPhase}`);
    }
  }
  
  // File compilation analysis
  const compiledMatch = stdout.match(/COMPILED (\d+) FILES/g);
  if (compiledMatch) {
    const numbers = compiledMatch.map(m => parseInt(m.match(/\d+/)[0]));
    const lastCount = numbers[numbers.length - 1];
    log('INFO', `Last successful compilation: ${lastCount} files`);
    
    if (lastCount > 2000) {
      log('ERROR', '🚨 Excessive file compilation detected - possible infinite loop');
    }
  }
}

// Main execution function
async function runUltimateDebug() {
  logHeader('ULTIMATE BUILD DEBUGGER - MAKE IT GREAT AGAIN! 🚀');
  
  log('INFO', '🔥 Starting the most comprehensive build debug session ever created!');
  log('INFO', '💪 We WILL find this memory leak and CRUSH IT!');
  
  try {
    // Phase 1: System Analysis
    getSystemInfo();
    
    // Phase 2: Project Analysis
    analyzeProject();
    
    // Phase 3: Dependency Analysis
    await analyzeDependencies();
    
    // Phase 4: The Ultimate Build Test
    logHeader('ULTIMATE BUILD TEST');
    log('INFO', '🎯 Launching enhanced build with maximum logging...');
    log('INFO', '📊 Every byte of memory will be tracked!');
    log('INFO', '🔍 Every file compilation will be monitored!');
    log('INFO', '⚡ We WILL make this build great again!');
    
    const buildResult = await runEnhancedBuild();
    
    logHeader('MISSION COMPLETE');
    
    if (buildResult === 0) {
      log('SUCCESS', '🎉🎉🎉 VICTORY! BUILD SUCCEEDED! 🎉🎉🎉');
      log('SUCCESS', '🚀 Your app is now ready to DOMINATE the web!');
    } else {
      log('ERROR', '💥 Build failed, but we have ALL the data needed!');
      log('INFO', '🔧 Use the detailed logs above to identify the exact issue');
      log('INFO', '💡 Check the memory patterns and compilation phases');
    }
    
  } catch (error) {
    log('ERROR', '💥 Ultimate debugger encountered an error:', error.message);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  log('ERROR', '💥 UNCAUGHT EXCEPTION:', error.message);
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log('ERROR', '💥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

// Run the ultimate debugger
runUltimateDebug().catch(console.error);