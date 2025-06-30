#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Gradual App Restoration Script\n');

// Define restoration phases
const phases = [
  {
    name: 'Phase 1: Core Pages',
    files: [
      'app.full-backup/services',
      'app.full-backup/book',
      'app.full-backup/how-it-works'
    ]
  },
  {
    name: 'Phase 2: API Routes',
    files: [
      'app.full-backup/api/booking',
      'app.full-backup/api/geocode',
      'app.full-backup/api/auth'
    ]
  },
  {
    name: 'Phase 3: User Features',
    files: [
      'app.full-backup/bookings',
      'app.full-backup/profile',
      'app.full-backup/reviews'
    ]
  },
  {
    name: 'Phase 4: Advanced Features',
    files: [
      'app.full-backup/payment-success',
      'app.full-backup/status',
      'app.full-backup/wallet'
    ]
  }
];

function testBuild() {
  try {
    console.log('🏗️  Testing build...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Build successful!\n');
    return true;
  } catch (error) {
    console.log('❌ Build failed!\n');
    return false;
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source not found: ${src}`);
    return false;
  }
  
  // Create destination directory
  fs.mkdirSync(dest, { recursive: true });
  
  // Copy all files recursively
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  return true;
}

async function main() {
  // First ensure we have a working minimal build
  if (!testBuild()) {
    console.log('❌ Initial build failed! Aborting restoration.');
    return;
  }

  console.log('✅ Starting from working minimal build\n');

  let lastWorkingPhase = -1;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    console.log(`\n📦 ${phase.name}`);
    console.log('=' .repeat(50));

    // Copy files for this phase
    let allCopied = true;
    for (const file of phase.files) {
      const src = file;
      const dest = file.replace('app.full-backup/', 'app/');
      
      console.log(`Copying ${path.basename(src)}...`);
      if (!copyDirectory(src, dest)) {
        allCopied = false;
      }
    }

    if (!allCopied) {
      console.log('⚠️  Some files were missing, continuing...');
    }

    // Test build after this phase
    if (testBuild()) {
      lastWorkingPhase = i;
      console.log(`✅ ${phase.name} completed successfully!`);
      
      // Commit this working state
      try {
        execSync('git add -A', { stdio: 'pipe' });
        execSync(`git commit -m "feat: Restore ${phase.name} - build working"`, { stdio: 'pipe' });
        console.log('📝 Committed working state');
      } catch (e) {
        // Might fail if no changes
      }
    } else {
      console.log(`❌ ${phase.name} broke the build!`);
      
      // Revert changes
      console.log('🔙 Reverting changes...');
      for (const file of phase.files) {
        const dest = file.replace('app.full-backup/', 'app/');
        if (fs.existsSync(dest)) {
          fs.rmSync(dest, { recursive: true, force: true });
        }
      }
      
      console.log(`\n⚠️  Stopped at ${phase.name} due to build failure.`);
      console.log(`✅ Last working phase: ${lastWorkingPhase >= 0 ? phases[lastWorkingPhase].name : 'Minimal build'}`);
      break;
    }
  }

  console.log('\n📊 Restoration Summary:');
  console.log('=' .repeat(50));
  if (lastWorkingPhase === phases.length - 1) {
    console.log('✅ All phases restored successfully!');
  } else {
    console.log(`✅ Restored ${lastWorkingPhase + 1} of ${phases.length} phases`);
    if (lastWorkingPhase >= 0) {
      console.log(`✅ Last working: ${phases[lastWorkingPhase].name}`);
    }
  }

  // Final build and deploy
  if (lastWorkingPhase >= 0) {
    console.log('\n🚀 Deploying to Vercel...');
    try {
      execSync('git push', { stdio: 'inherit' });
      console.log('✅ Pushed to GitHub, Vercel deployment triggered!');
    } catch (e) {
      console.log('❌ Failed to push to GitHub');
    }
  }
}

main().catch(console.error);