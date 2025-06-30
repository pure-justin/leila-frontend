#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analyzing build size...');

// Get build stats
const buildDir = '.next';
let totalSize = 0;
const bundles = [];

function getDirectorySize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      const stats = fs.statSync(filePath);
      size += stats.size;
      
      if (file.name.endsWith('.js') || file.name.endsWith('.css')) {
        bundles.push({
          name: filePath.replace(buildDir + '/', ''),
          size: stats.size,
        });
      }
    }
  }
  
  return size;
}

if (fs.existsSync(buildDir)) {
  totalSize = getDirectorySize(buildDir);
  
  // Sort bundles by size
  bundles.sort((a, b) => b.size - a.size);
  
  console.log('\n📊 BUILD SIZE REPORT:');
  console.log('====================');
  console.log(`Total Build Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);
  
  console.log('Top 10 Largest Files:');
  bundles.slice(0, 10).forEach((bundle, i) => {
    const sizeInKB = (bundle.size / 1024).toFixed(2);
    const bar = '█'.repeat(Math.round(bundle.size / bundles[0].size * 20));
    console.log(`${i + 1}. ${bundle.name}`);
    console.log(`   ${bar} ${sizeInKB} KB\n`);
  });
  
  // Recommendations
  console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
  
  if (totalSize > 5 * 1024 * 1024) {
    console.log('⚠️  Build size exceeds 5MB - consider:');
    console.log('   - Enable dynamic imports for large components');
    console.log('   - Remove unused dependencies');
    console.log('   - Use next/image for automatic image optimization');
  }
  
  const largeFiles = bundles.filter(b => b.size > 200 * 1024);
  if (largeFiles.length > 0) {
    console.log(`\n⚠️  Found ${largeFiles.length} files larger than 200KB`);
    console.log('   Consider splitting these into smaller chunks');
  }
} else {
  console.log('❌ No build found. Run "npm run build" first.');
}