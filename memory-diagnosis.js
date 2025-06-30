#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧠 MEMORY LEAK DIAGNOSIS TOOL\n');

// Helper to run TypeScript checker 
async function runTypeCheck() {
  console.log('🔍 Running TypeScript check...');
  
  return new Promise((resolve) => {
    const tsc = spawn('npx', ['tsc', '--noEmit', '--listFiles'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    tsc.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    tsc.on('close', (code) => {
      console.log(`TypeScript check completed with code: ${code}`);
      
      if (errorOutput) {
        console.log('❌ TypeScript Errors:');
        console.log(errorOutput);
      }
      
      // Count compiled files
      const lines = output.split('\n').filter(line => line.trim());
      console.log(`📁 Files being compiled: ${lines.length}`);
      
      // Look for suspicious patterns
      const largeFiles = lines.filter(line => 
        line.includes('comprehensive-services-catalog') ||
        line.includes('service-images') ||
        line.includes('node_modules')
      );
      
      if (largeFiles.length > 0) {
        console.log('\n🚨 Potentially problematic files:');
        largeFiles.slice(0, 10).forEach(file => console.log(`   ${file}`));
      }
      
      resolve(code);
    });
  });
}

// Helper to run build with memory profiling
async function runBuildWithProfiling() {
  console.log('\n🏗️  Running build with memory profiling...');
  
  return new Promise((resolve) => {
    // Use --inspect flag for memory profiling
    const build = spawn('node', [
      '--max-old-space-size=4096',
      '--expose-gc',
      '--trace-gc',
      '--trace-gc-verbose',
      'node_modules/.bin/next',
      'build'
    ], {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let memorySnapshots = [];
    
    // Monitor memory every 2 seconds
    const memoryMonitor = setInterval(() => {
      const mem = process.memoryUsage();
      memorySnapshots.push({
        timestamp: Date.now(),
        rss: Math.round(mem.rss / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024)
      });
      
      console.log(`🧠 Memory: RSS=${mem.rss / 1024 / 1024}MB, Heap=${mem.heapUsed / 1024 / 1024}MB`);
    }, 2000);
    
    let output = '';
    let errorOutput = '';
    
    build.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Look for memory-related messages
      if (text.includes('memory') || text.includes('heap') || text.includes('allocation')) {
        console.log('💾 Memory-related output:', text.trim());
      }
      
      // Look for compilation progress
      if (text.includes('Compiling') || text.includes('✓')) {
        console.log('⚙️ ', text.trim());
      }
    });
    
    build.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      
      // Real-time error monitoring
      if (text.includes('heap') || text.includes('memory') || text.includes('allocation')) {
        console.log('🚨 Memory Error:', text.trim());
      }
    });
    
    build.on('close', (code) => {
      clearInterval(memoryMonitor);
      
      console.log(`\nBuild completed with code: ${code}`);
      
      if (code !== 0) {
        console.log('\n❌ Build failed. Error output:');
        console.log(errorOutput);
        
        // Analyze memory snapshots
        if (memorySnapshots.length > 0) {
          console.log('\n📊 Memory usage progression:');
          memorySnapshots.forEach((snapshot, i) => {
            if (i === 0 || i === memorySnapshots.length - 1 || i % 5 === 0) {
              console.log(`   ${i}: RSS=${snapshot.rss}MB, Heap=${snapshot.heapUsed}MB/${snapshot.heapTotal}MB`);
            }
          });
          
          // Check for memory leaks
          const maxHeap = Math.max(...memorySnapshots.map(s => s.heapUsed));
          const avgHeap = memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / memorySnapshots.length;
          
          console.log(`\n🔍 Memory Analysis:`);
          console.log(`   Max heap usage: ${maxHeap}MB`);
          console.log(`   Average heap usage: ${Math.round(avgHeap)}MB`);
          
          if (maxHeap > 3500) {
            console.log('🚨 CRITICAL: Heap usage exceeded 3.5GB - likely memory leak!');
          }
        }
      }
      
      resolve(code);
    });
    
    // Kill process after 5 minutes to prevent hanging
    setTimeout(() => {
      console.log('⏰ Build timeout - killing process');
      build.kill('SIGKILL');
      clearInterval(memoryMonitor);
      resolve(-1);
    }, 300000);
  });
}

// Check for specific problematic patterns
function checkForProblematicPatterns() {
  console.log('\n🔍 CHECKING FOR PROBLEMATIC PATTERNS...');
  
  const problematicPatterns = [
    // Check for large object literals
    { pattern: /const\s+\w+\s*=\s*\{[\s\S]{5000,}\}/g, description: 'Large object literals' },
    
    // Check for massive arrays
    { pattern: /\[[\s\S]{10000,}\]/g, description: 'Large arrays' },
    
    // Check for potential circular references
    { pattern: /import.*from.*\.\.\/.*\.\.\/.*\.\.\//g, description: 'Deep relative imports' },
    
    // Check for heavy computations in module scope
    { pattern: /const\s+\w+\s*=.*\.map\(.*\.map\(/g, description: 'Nested array operations' }
  ];
  
  const filesToCheck = [
    'lib/comprehensive-services-catalog.ts',
    'lib/service-images.ts',
    'lib/services-catalog.ts'
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`📄 Checking ${file}...`);
      const content = fs.readFileSync(file, 'utf8');
      
      problematicPatterns.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches && matches.length > 0) {
          console.log(`  ⚠️  Found ${matches.length} instances of: ${description}`);
        }
      });
      
      // Check file size
      const sizeKB = Math.round(content.length / 1024);
      console.log(`  📏 File size: ${sizeKB}KB`);
      
      if (sizeKB > 500) {
        console.log(`  🚨 Large file detected! Consider splitting.`);
      }
    }
  });
}

// Main execution
async function runDiagnosis() {
  console.log('Starting comprehensive memory diagnosis...\n');
  
  // Step 1: Check for problematic patterns
  checkForProblematicPatterns();
  
  // Step 2: Run TypeScript compilation check
  await runTypeCheck();
  
  // Step 3: Run build with memory profiling
  const buildResult = await runBuildWithProfiling();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 DIAGNOSIS COMPLETE');
  console.log('='.repeat(60));
  
  if (buildResult !== 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Check for circular dependencies');
    console.log('2. Split large files into smaller modules');
    console.log('3. Use dynamic imports for heavy components');
    console.log('4. Consider lazy loading for large data structures');
    console.log('5. Check if webpack is processing unnecessary files');
  } else {
    console.log('\n✅ Build succeeded! Memory leak may be resolved.');
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 UNHANDLED REJECTION:', reason);
  process.exit(1);
});

// Run the diagnosis
runDiagnosis().catch(console.error);