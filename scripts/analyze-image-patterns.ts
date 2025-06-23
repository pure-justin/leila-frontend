#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { SERVICE_IMAGE_MAPPING } from '../lib/service-image-mapping';

const servicesPath = path.join(process.cwd(), 'public/shared-assets/images/services');

// Analyze image naming patterns
console.log('Analyzing image naming patterns...\n');

const patterns: Record<string, number> = {};
const mismatches: string[] = [];

// Check each category
const categories = fs.readdirSync(servicesPath).filter(f => 
  fs.statSync(path.join(servicesPath, f)).isDirectory()
);

for (const category of categories) {
  const categoryPath = path.join(servicesPath, category);
  const files = fs.readdirSync(categoryPath);
  
  console.log(`\n${category.toUpperCase()} (${files.length} files)`);
  console.log('=' .repeat(50));
  
  // Group files by base name
  const fileGroups: Record<string, string[]> = {};
  
  for (const file of files) {
    // Extract base name
    const match = file.match(/^([a-z-]+?)(?:-\d+|-thumbnail|-card|-hero|-mobile|-large)?(?:-thumb)?\.(jpg|png|webp)$/);
    if (match) {
      const baseName = match[1];
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file);
      
      // Track patterns
      if (file.includes('-1-thumb.')) patterns['-1-thumb'] = (patterns['-1-thumb'] || 0) + 1;
      if (file.includes('-thumbnail.')) patterns['-thumbnail'] = (patterns['-thumbnail'] || 0) + 1;
      if (file.includes('-card.')) patterns['-card'] = (patterns['-card'] || 0) + 1;
      if (file.includes('-hero.')) patterns['-hero'] = (patterns['-hero'] || 0) + 1;
      if (file.includes('-mobile.')) patterns['-mobile'] = (patterns['-mobile'] || 0) + 1;
    }
  }
  
  // Display groups
  Object.entries(fileGroups).forEach(([baseName, files]) => {
    console.log(`  ${baseName}: ${files.length} files`);
    if (files.length <= 4) {
      files.forEach(f => console.log(`    - ${f}`));
    }
  });
  
  // Check for mapping mismatches
  const mappingsForCategory = Object.entries(SERVICE_IMAGE_MAPPING)
    .filter(([_, mapping]) => mapping.category === category);
  
  for (const [serviceId, mapping] of mappingsForCategory) {
    if (!fileGroups[mapping.subcategory]) {
      // Check if it exists with 'general-' prefix
      if (fileGroups[`general-${mapping.subcategory}`]) {
        mismatches.push(`${serviceId}: uses '${mapping.subcategory}' but files use 'general-${mapping.subcategory}'`);
      } else {
        const availableNames = Object.keys(fileGroups).join(', ');
        mismatches.push(`${serviceId}: '${mapping.subcategory}' not found. Available: ${availableNames}`);
      }
    }
  }
}

console.log('\n\nPATTERN SUMMARY');
console.log('=' .repeat(50));
Object.entries(patterns)
  .sort((a, b) => b[1] - a[1])
  .forEach(([pattern, count]) => {
    console.log(`${pattern}: ${count} files`);
  });

if (mismatches.length > 0) {
  console.log('\n\nMAPPING MISMATCHES');
  console.log('=' .repeat(50));
  mismatches.forEach(m => console.log(`❌ ${m}`));
}