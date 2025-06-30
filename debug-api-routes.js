#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Debugging API Routes\n');

// Test each API route individually
const apiRoutes = [
  'app.full-backup/api/booking',
  'app.full-backup/api/geocode', 
  'app.full-backup/api/auth'
];

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Source not found: ${src}`);
    return false;
  }
  
  fs.mkdirSync(dest, { recursive: true });
  
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

function testBuild() {
  try {
    console.log('Testing build...');
    const output = execSync('npm run build 2>&1', { encoding: 'utf8' });
    console.log('✅ Build successful!');
    return { success: true, output };
  } catch (error) {
    console.log('❌ Build failed!');
    console.log('Error output:', error.stdout || error.message);
    return { success: false, error: error.stdout || error.message };
  }
}

// Test each route individually
for (const route of apiRoutes) {
  console.log(`\nTesting ${path.basename(route)}...`);
  console.log('=' .repeat(40));
  
  const dest = route.replace('app.full-backup/', 'app/');
  
  // Copy the route
  copyDirectory(route, dest);
  
  // Test build
  const result = testBuild();
  
  if (result.success) {
    console.log(`✅ ${path.basename(route)} works!`);
  } else {
    console.log(`❌ ${path.basename(route)} breaks the build`);
    console.log('Error details:', result.error.slice(0, 500));
    
    // Check the route files
    if (fs.existsSync(dest)) {
      const files = fs.readdirSync(dest);
      console.log('Files in route:', files);
      
      // Check for common issues
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const content = fs.readFileSync(path.join(dest, file), 'utf8');
          
          // Check for missing imports
          if (content.includes('firebase-admin')) {
            console.log(`⚠️  ${file} uses firebase-admin (server-only)`);
          }
          if (content.includes('@/lib/api/')) {
            console.log(`⚠️  ${file} imports from @/lib/api/`);
          }
        }
      }
    }
  }
  
  // Clean up after test
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
}

console.log('\n✅ API route debugging complete!');