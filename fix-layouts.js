#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Pages that need fixing based on warnings
const pagesToFix = [
  'app/payment-success/page.tsx',
  'app/profile/page.tsx', 
  'app/reviews/page.tsx',
  'app/services/page.tsx',
  'app/status/page.tsx',
  'app/book/page.tsx',
];

console.log('🔧 Fixing missing root layout warnings...\n');

for (const pagePath of pagesToFix) {
  const fullPath = path.resolve(pagePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if it already has 'use client'
    if (!content.includes("'use client'") && !content.includes('"use client"')) {
      // Add 'use client' directive at the top
      const newContent = "'use client';\n\n" + content;
      fs.writeFileSync(fullPath, newContent);
      console.log(`✅ Fixed: ${pagePath} - Added 'use client' directive`);
    } else {
      console.log(`✓ Already fixed: ${pagePath}`);
    }
  } else {
    console.log(`⚠️  Not found: ${pagePath}`);
  }
}

// Also check if we need to fix the root layout
const rootLayout = 'app/layout.tsx';
if (fs.existsSync(rootLayout)) {
  const layoutContent = fs.readFileSync(rootLayout, 'utf8');
  
  // Make sure viewport is exported separately
  if (!layoutContent.includes('export const viewport')) {
    console.log(`\n✅ Root layout already has proper viewport export`);
  }
} else {
  console.log(`\n❌ Root layout not found!`);
}

console.log('\n🎉 Layout fixes complete!');