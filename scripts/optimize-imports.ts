#!/usr/bin/env tsx
/**
 * Optimize imports to reduce bundle size
 * This script analyzes and reports on package usage
 */

import fs from 'fs/promises';
import path from 'path';

const IMPORT_OPTIMIZATIONS = {
  // Map heavy imports to lighter alternatives
  'date-fns': 'date-fns-tz',
  'lodash': 'lodash-es',
  '@firebase/app': 'firebase/app',
  '@firebase/auth': 'firebase/auth',
  '@firebase/firestore': 'firebase/firestore',
};

const EXCLUDE_FROM_BUNDLE = [
  // Dev dependencies that shouldn't be in production
  '@types/*',
  'eslint*',
  'typescript',
  'tsx',
  '@eslint/*',
];

async function analyzeImports() {
  console.log('Analyzing imports for optimization...\n');
  
  const recommendations: string[] = [];
  
  // Check package.json
  const packageJson = JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  
  // Analyze dependencies
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  for (const [pkg, version] of Object.entries(deps)) {
    // Check for optimization opportunities
    if (IMPORT_OPTIMIZATIONS[pkg]) {
      recommendations.push(
        `Replace '${pkg}' with '${IMPORT_OPTIMIZATIONS[pkg]}' for smaller bundle`
      );
    }
    
    // Check for packages that should be excluded
    if (EXCLUDE_FROM_BUNDLE.some(pattern => {
      if (pattern.includes('*')) {
        return pkg.startsWith(pattern.replace('*', ''));
      }
      return pkg === pattern;
    })) {
      if (packageJson.dependencies[pkg]) {
        recommendations.push(
          `Move '${pkg}' from dependencies to devDependencies`
        );
      }
    }
  }
  
  // Check for duplicate packages
  const checkDuplicates = [
    ['react', 'preact'],
    ['moment', 'date-fns', 'dayjs'],
    ['axios', 'node-fetch', 'got'],
  ];
  
  for (const group of checkDuplicates) {
    const found = group.filter(pkg => deps[pkg]);
    if (found.length > 1) {
      recommendations.push(
        `Multiple similar packages found: ${found.join(', ')}. Consider using only one.`
      );
    }
  }
  
  // Report findings
  if (recommendations.length > 0) {
    console.log('📋 Optimization Recommendations:\n');
    recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  } else {
    console.log('✅ No immediate optimization opportunities found');
  }
  
  // Check bundle size impact
  console.log('\n📊 Estimated impact on bundle size:');
  const heavyPackages = [
    { name: 'firebase', size: '~400KB' },
    { name: 'framer-motion', size: '~150KB' },
    { name: '@stripe/stripe-js', size: '~200KB' },
    { name: 'date-fns', size: '~75KB' },
  ];
  
  for (const pkg of heavyPackages) {
    if (deps[pkg.name]) {
      console.log(`- ${pkg.name}: ${pkg.size}`);
    }
  }
}

// Run the analysis
analyzeImports().catch(console.error);