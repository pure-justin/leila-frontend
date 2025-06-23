#!/usr/bin/env tsx

import { SERVICE_IMAGE_MAPPING } from '../lib/service-image-mapping';
import fs from 'fs';
import path from 'path';

const servicesPath = path.join(process.cwd(), 'public/shared-assets/images/services');

// Check for common mismatches
const mismatches: string[] = [];
const fixes: Record<string, string> = {};

Object.entries(SERVICE_IMAGE_MAPPING).forEach(([serviceId, mapping]) => {
  if (serviceId === 'default') return;
  
  const dir = path.join(servicesPath, mapping.category);
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  const hasMatch = files.some(f => f.startsWith(mapping.subcategory + '-'));
  
  if (!hasMatch) {
    // Check for general- prefix
    const hasGeneralMatch = files.some(f => f.startsWith('general-' + mapping.subcategory + '-'));
    if (hasGeneralMatch) {
      mismatches.push(`${serviceId}: needs 'general-' prefix for ${mapping.subcategory}`);
      fixes[serviceId] = `general-${mapping.subcategory}`;
    } else {
      // Check for variations
      const subcategoryParts = mapping.subcategory.split('-');
      let found = false;
      
      // Try different variations
      const variations = [
        mapping.subcategory.replace(/-/g, ''),
        subcategoryParts[0],
        subcategoryParts.join('')
      ];
      
      for (const variation of variations) {
        if (files.some(f => f.startsWith(variation + '-'))) {
          mismatches.push(`${serviceId}: '${mapping.subcategory}' -> found as '${variation}'`);
          fixes[serviceId] = variation;
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Find similar names
        const similar = files
          .filter(f => f.includes(subcategoryParts[0]))
          .map(f => f.split('-')[0])
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 3);
        
        mismatches.push(`${serviceId}: '${mapping.subcategory}' not found in ${mapping.category}`);
        if (similar.length > 0) {
          console.log(`  Suggestions: ${similar.join(', ')}`);
        }
      }
    }
  }
});

console.log(`\nFound ${mismatches.length} mismatches:\n`);
mismatches.forEach(m => console.log(`- ${m}`));

if (Object.keys(fixes).length > 0) {
  console.log('\n\nSuggested fixes for service-image-mapping.ts:');
  console.log('```typescript');
  Object.entries(fixes).forEach(([serviceId, correctSubcategory]) => {
    console.log(`  '${serviceId}': { category: '...', subcategory: '${correctSubcategory}' },`);
  });
  console.log('```');
}