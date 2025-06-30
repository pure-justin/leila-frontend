#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color codes
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

function log(level, message) {
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
}

function logHeader(title) {
  console.log(`\n${colors.bgYellow}${colors.bright} ${title.toUpperCase()} ${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}`);
}

// Files that are definitely safe to remove (unused/obsolete)
const SAFE_TO_REMOVE = [
  // Unused voice studio page
  'app/voice-studio/page.tsx',
  
  // Unused admin pages that aren't connected
  'app/admin/migrate-images/page.tsx',
  'app/debug/page.tsx',
  'app/test-gradient/page.tsx',
  
  // Unused API routes that aren't being called
  'app/api/ai/route.ts',
  'app/api/keys/create/route.ts',
  'app/api/keys/rotate/route.ts',
  'app/api/push/send/route.ts',
  'app/api/push/subscribe/route.ts',
  'app/api/upload/image/route.ts',
  'app/api/voice/voices/route.ts',
  'app/api/voice/wake-word/route.ts',
  
  // Duplicate/unused components
  'components/ContractorTracker.tsx',
  'components/FeedbackFAB.tsx',
  'components/GoogleMapsLoader.tsx',
  'components/LanguageSelector/LanguageSelector.tsx',
  'components/MobileOptimizedLayout.tsx',
  'components/ServiceXBooking.tsx',
  'components/SmartAppBanner.tsx',
  'components/SolarPotentialOverlay.tsx',
  'components/pwa-install.tsx',
  'components/voice-button.tsx',
  
  // Old/unused complex components
  'components/ServiceMap3D.lazy.tsx',
  'components/ServiceMap3D.tsx', // 43KB monster!
  'components/DamageAssessment/VisionAnalyzer.tsx',
  'components/MultimodalAI/VoiceAssistant.tsx',
  'components/NaturalLanguageBooking/BookingAssistant.tsx',
  'components/voice/VoiceAssistant.tsx',
  
  // Backup service catalogs
  'lib/services-catalog.ts.backup',
  'lib/comprehensive-services-catalog.ts.backup'
];

// Files to check imports for before removing
const CHECK_IMPORTS = [
  'components/PersonalizedHomePage.tsx',
  'components/ServiceBrowser.tsx',
  'components/ReferralBanner.tsx',
  'components/ServiceRequestFlow.tsx',
  'app/how-it-works/page.tsx',
  'app/solar-analysis/page.tsx'
];

async function aggressiveCleanup() {
  logHeader('🔥 AGGRESSIVE CLEANUP - REMOVE THE BLOAT!');
  
  const backupDir = `./cleanup-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  
  log('INFO', '📦 Creating backup directory...');
  fs.mkdirSync(backupDir, { recursive: true });
  
  let totalRemoved = 0;
  let totalSavings = 0;
  
  // Phase 1: Remove definitely safe files
  log('CLEANUP', '🗑️  Phase 1: Removing definitely unused files...');
  
  for (const filePath of SAFE_TO_REMOVE) {
    const fullPath = path.resolve(filePath);
    
    if (fs.existsSync(fullPath)) {
      try {
        const stats = fs.statSync(fullPath);
        const sizeKB = Math.round(stats.size / 1024);
        
        // Backup first
        const backupPath = path.join(backupDir, path.basename(filePath));
        fs.copyFileSync(fullPath, backupPath);
        
        // Remove the file
        fs.unlinkSync(fullPath);
        
        totalRemoved++;
        totalSavings += sizeKB;
        
        log('SUCCESS', `✅ Removed: ${filePath} (${sizeKB}KB)`);
      } catch (error) {
        log('ERROR', `❌ Failed to remove ${filePath}: ${error.message}`);
      }
    } else {
      log('WARNING', `⚠️  File not found: ${filePath}`);
    }
  }
  
  // Phase 2: Check imports for conditionally safe files
  log('CLEANUP', '🔍 Phase 2: Checking imports for additional files...');
  
  const importUsage = new Map();
  
  // Scan remaining files for imports
  function scanForImports(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && file.name !== 'node_modules' && file.name !== '.git') {
        scanForImports(fullPath);
      } else if (file.isFile() && /\.(tsx?|jsx?)$/.test(file.name)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check what this file imports
          for (const checkFile of CHECK_IMPORTS) {
            const fileName = path.basename(checkFile, path.extname(checkFile));
            if (content.includes(fileName) || content.includes(checkFile)) {
              if (!importUsage.has(checkFile)) {
                importUsage.set(checkFile, []);
              }
              importUsage.get(checkFile).push(fullPath);
            }
          }
        } catch (e) {
          // Skip files we can't read
        }
      }
    }
  }
  
  scanForImports('./app');
  scanForImports('./components');
  
  // Remove files that aren't imported
  for (const filePath of CHECK_IMPORTS) {
    if (!importUsage.has(filePath) && fs.existsSync(filePath)) {
      try {
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        
        // Backup first
        const backupPath = path.join(backupDir, path.basename(filePath));
        fs.copyFileSync(filePath, backupPath);
        
        // Remove the file
        fs.unlinkSync(filePath);
        
        totalRemoved++;
        totalSavings += sizeKB;
        
        log('SUCCESS', `✅ Removed unused: ${filePath} (${sizeKB}KB)`);
      } catch (error) {
        log('ERROR', `❌ Failed to remove ${filePath}: ${error.message}`);
      }
    } else if (importUsage.has(filePath)) {
      log('INFO', `📌 Keeping ${filePath} (imported by ${importUsage.get(filePath).length} files)`);
    }
  }
  
  // Phase 3: Remove empty directories
  log('CLEANUP', '📁 Phase 3: Removing empty directories...');
  
  function removeEmptyDirs(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    if (files.length === 0) {
      fs.rmdirSync(dir);
      log('SUCCESS', `✅ Removed empty directory: ${dir}`);
      return;
    }
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirs(fullPath);
      }
    }
    
    // Check again after recursive cleanup
    const remainingFiles = fs.readdirSync(dir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(dir);
      log('SUCCESS', `✅ Removed empty directory: ${dir}`);
    }
  }
  
  removeEmptyDirs('./components');
  removeEmptyDirs('./app');
  
  logHeader('🎉 CLEANUP COMPLETE!');
  
  log('SUCCESS', `🗑️  Files removed: ${totalRemoved}`);
  log('SUCCESS', `💾 Space saved: ${totalSavings}KB`);
  log('SUCCESS', `📦 Backup created: ${backupDir}`);
  
  log('INFO', '🚀 Now let\'s test the build!');
  
  return { totalRemoved, totalSavings };
}

async function testBuild() {
  logHeader('🏗️  TESTING BUILD AFTER CLEANUP');
  
  const { spawn } = require('child_process');
  
  return new Promise((resolve) => {
    log('INFO', '🚀 Starting build test...');
    
    const startTime = Date.now();
    const build = spawn('npm', ['run', 'build'], {
      stdio: ['inherit', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    build.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });
    
    build.stderr.on('data', (data) => {
      const text = data.toString();
      error += text;
      process.stderr.write(text);
    });
    
    build.on('close', (code) => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      if (code === 0) {
        log('SUCCESS', `🎉 BUILD SUCCEEDED in ${duration}s!`);
        log('SUCCESS', '🚀 Memory issue has been CRUSHED!');
      } else {
        log('ERROR', `💥 Build failed with code ${code} after ${duration}s`);
        if (error.includes('memory') || error.includes('heap')) {
          log('WARNING', '🧠 Still memory-related - may need more cleanup');
        }
      }
      
      resolve(code);
    });
    
    // Timeout after 5 minutes
    setTimeout(() => {
      log('WARNING', '⏰ Build timeout - killing process');
      build.kill('SIGKILL');
      resolve(-1);
    }, 300000);
  });
}

async function main() {
  try {
    const result = await aggressiveCleanup();
    
    if (result.totalRemoved > 0) {
      log('INFO', '⏳ Waiting 3 seconds before build test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await testBuild();
    } else {
      log('WARNING', '🤔 No files were removed - manual review needed');
    }
    
  } catch (error) {
    log('ERROR', `💥 Cleanup failed: ${error.message}`);
  }
}

main().catch(console.error);