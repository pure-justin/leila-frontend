#!/usr/bin/env tsx

import { getServiceImage } from '../lib/service-image-mapping';
import { getServiceImage as getImageUrl } from '../lib/service-images-local';
import fs from 'fs';
import path from 'path';

// Test services from different categories
const testServices = [
  'electrical-repair',
  'pipe-repair', 
  'ac-repair',
  'house-cleaning',
  'lawn-mowing',
  'general-repair',
  'refrigerator-repair',
  'pest-inspection',
  'invalid-service' // Test fallback
];

console.log('Testing image loading configuration...\n');

for (const serviceId of testServices) {
  console.log(`\nTesting service: ${serviceId}`);
  console.log('=' .repeat(50));
  
  // Get mapping
  const mapping = getServiceImage(serviceId);
  console.log(`Mapping: ${mapping.category}/${mapping.subcategory}`);
  
  // Get image URL
  const imageInfo = getImageUrl(serviceId);
  console.log(`Image URL: ${imageInfo.url}`);
  
  // Check if file exists
  const imagePath = path.join(
    process.cwd(),
    'public',
    imageInfo.url
  );
  
  // Check multiple formats
  const formats = ['.webp', '.png', '.jpg'];
  let found = false;
  
  for (const format of formats) {
    const testPath = imagePath.replace(/\.[^.]+$/, format);
    if (fs.existsSync(testPath)) {
      console.log(`✅ Found: ${path.basename(testPath)}`);
      found = true;
    }
  }
  
  if (!found) {
    console.log(`❌ Image not found at any format`);
    
    // Check if directory exists
    const dir = path.dirname(imagePath);
    if (fs.existsSync(dir)) {
      console.log(`📁 Directory exists: ${path.relative(process.cwd(), dir)}`);
      
      // List available files
      const files = fs.readdirSync(dir)
        .filter(f => f.includes(mapping.subcategory))
        .slice(0, 5);
      
      if (files.length > 0) {
        console.log(`Available files: ${files.join(', ')}`);
      }
    } else {
      console.log(`❌ Directory does not exist: ${path.relative(process.cwd(), dir)}`);
    }
  }
}

// Check placeholder files
console.log('\n\nChecking placeholder files...');
console.log('=' .repeat(50));

const placeholders = [
  '/shared-assets/images/services/placeholder.svg',
  '/shared-assets/images/services/placeholder.jpg'
];

for (const placeholder of placeholders) {
  const placeholderPath = path.join(process.cwd(), 'public', placeholder);
  if (fs.existsSync(placeholderPath)) {
    const stats = fs.statSync(placeholderPath);
    console.log(`✅ ${placeholder} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${placeholder} not found`);
  }
}