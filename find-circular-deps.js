#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const visited = new Set();
const inProgress = new Set();
const dependencies = new Map();

function findImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+(?:.*\s+from\s+)?['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../')) {
      imports.push(importPath);
    }
  }
  
  return imports;
}

function resolveImportPath(importPath, fromFile) {
  const dir = path.dirname(fromFile);
  
  if (importPath.startsWith('@/')) {
    return path.join(process.cwd(), importPath.replace('@/', ''));
  } else {
    return path.resolve(dir, importPath);
  }
}

function checkCircularDependency(filePath, chain = []) {
  if (inProgress.has(filePath)) {
    console.log(`\n🔴 CIRCULAR DEPENDENCY DETECTED!`);
    console.log(`Chain: ${[...chain, filePath].join(' -> ')}`);
    return true;
  }
  
  if (visited.has(filePath)) {
    return false;
  }
  
  inProgress.add(filePath);
  chain.push(filePath);
  
  try {
    if (!fs.existsSync(filePath)) {
      // Try common extensions
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const withExt = filePath + ext;
        if (fs.existsSync(withExt)) {
          filePath = withExt;
          break;
        }
      }
    }
    
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return false;
    }
    
    const imports = findImports(filePath);
    dependencies.set(filePath, imports);
    
    for (const imp of imports) {
      const resolvedPath = resolveImportPath(imp, filePath);
      checkCircularDependency(resolvedPath, [...chain]);
    }
  } catch (e) {
    // Skip files we can't read
  }
  
  inProgress.delete(filePath);
  visited.add(filePath);
  chain.pop();
  
  return false;
}

console.log('🔍 Searching for circular dependencies...\n');

// Check all TypeScript/JavaScript files
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !['node_modules', '.next', '.git'].includes(file.name)) {
      scanDirectory(fullPath);
    } else if (file.isFile() && /\.(tsx?|jsx?)$/.test(file.name)) {
      checkCircularDependency(fullPath);
    }
  }
}

scanDirectory('./app');
scanDirectory('./components');
scanDirectory('./lib');

console.log('\n✅ Circular dependency check complete!');

// Find large dependency chains
console.log('\n📊 Large dependency chains (>5 levels):');
let found = false;
for (const [file, deps] of dependencies) {
  if (deps.length > 5) {
    console.log(`${file}: ${deps.length} imports`);
    found = true;
  }
}
if (!found) {
  console.log('None found - good job!');
}