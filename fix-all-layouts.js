#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all layout issues for Next.js 14...\n');

// Find all directories with page.tsx but no layout.tsx
function findDirectoriesNeedingLayout(dir, results = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  let hasPage = false;
  let hasLayout = false;
  
  for (const file of files) {
    if (file.isFile()) {
      if (file.name === 'page.tsx' || file.name === 'page.jsx') {
        hasPage = true;
      }
      if (file.name === 'layout.tsx' || file.name === 'layout.jsx') {
        hasLayout = true;
      }
    }
  }
  
  if (hasPage && !hasLayout && dir !== './app') {
    results.push(dir);
  }
  
  // Recurse into subdirectories
  for (const file of files) {
    if (file.isDirectory() && !['node_modules', '.next', '.git'].includes(file.name)) {
      const fullPath = path.join(dir, file.name);
      findDirectoriesNeedingLayout(fullPath, results);
    }
  }
  
  return results;
}

// Create a simple layout for directories that need one
const createLayout = (dirPath) => {
  const layoutContent = `export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
`;

  const layoutPath = path.join(dirPath, 'layout.tsx');
  fs.writeFileSync(layoutPath, layoutContent);
  console.log(`✅ Created layout: ${layoutPath}`);
};

// Find directories needing layouts
const dirsNeedingLayout = findDirectoriesNeedingLayout('./app');

if (dirsNeedingLayout.length > 0) {
  console.log(`Found ${dirsNeedingLayout.length} directories needing layouts:\n`);
  
  dirsNeedingLayout.forEach(dir => {
    console.log(`  - ${dir}`);
    createLayout(dir);
  });
} else {
  console.log('✅ All pages have proper layouts!');
}

// Also check if not-found.tsx exists without proper structure
const notFoundPath = './app/not-found.tsx';
if (fs.existsSync(notFoundPath)) {
  const content = fs.readFileSync(notFoundPath, 'utf8');
  if (!content.includes("'use client'")) {
    const newContent = "'use client';\n\n" + content;
    fs.writeFileSync(notFoundPath, newContent);
    console.log('\n✅ Updated not-found.tsx with client directive');
  }
}

// Check global-error.tsx too
const globalErrorPath = './app/global-error.tsx';
if (fs.existsSync(globalErrorPath)) {
  const content = fs.readFileSync(globalErrorPath, 'utf8');
  if (!content.includes("'use client'")) {
    const newContent = "'use client';\n\n" + content;
    fs.writeFileSync(globalErrorPath, newContent);
    console.log('✅ Updated global-error.tsx with client directive');
  }
}

console.log('\n🎉 Layout fixes complete!');