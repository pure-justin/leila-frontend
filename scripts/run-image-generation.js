#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create directories first
const baseDir = path.join(__dirname, '../../shared-assets/images/services');
const categories = ['plumbing', 'electrical', 'hvac', 'cleaning', 'landscaping', 'handyman', 'appliance', 'pest-control'];

console.log('📁 Creating directory structure...');
categories.forEach(category => {
  const categoryDir = path.join(baseDir, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
    console.log(`✅ Created: ${category}/`);
  }
});

// Create a simple placeholder generator
const sharp = require('sharp');

async function createPlaceholder(text, size, outputPath) {
  const [category, subcategory] = text.split('\n');
  
  const svg = `
    <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size.width}" height="${size.height}" fill="url(#grad)"/>
      <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="bold">
        ${category.toUpperCase()}
      </text>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="20" fill="white" text-anchor="middle">
        ${subcategory}
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .jpeg({ quality: 85 })
    .toFile(outputPath);
}

// Service templates
const services = [
  { category: 'plumbing', subcategory: 'faucet-repair' },
  { category: 'plumbing', subcategory: 'pipe-installation' },
  { category: 'plumbing', subcategory: 'drain-cleaning' },
  { category: 'plumbing', subcategory: 'water-heater' },
  { category: 'electrical', subcategory: 'outlet-installation' },
  { category: 'electrical', subcategory: 'panel-upgrade' },
  { category: 'electrical', subcategory: 'lighting-installation' },
  { category: 'electrical', subcategory: 'smart-home' },
  { category: 'hvac', subcategory: 'ac-installation' },
  { category: 'hvac', subcategory: 'furnace-repair' },
  { category: 'hvac', subcategory: 'duct-cleaning' },
  { category: 'cleaning', subcategory: 'house-cleaning' },
  { category: 'cleaning', subcategory: 'deep-cleaning' },
  { category: 'cleaning', subcategory: 'carpet-cleaning' },
  { category: 'landscaping', subcategory: 'lawn-care' },
  { category: 'landscaping', subcategory: 'garden-design' },
  { category: 'landscaping', subcategory: 'tree-service' },
  { category: 'handyman', subcategory: 'general-repair' },
  { category: 'handyman', subcategory: 'furniture-assembly' },
  { category: 'handyman', subcategory: 'painting' },
  { category: 'appliance', subcategory: 'washer-repair' },
  { category: 'appliance', subcategory: 'refrigerator-repair' },
  { category: 'pest-control', subcategory: 'inspection' },
  { category: 'pest-control', subcategory: 'treatment' }
];

const sizes = {
  hero: { width: 1920, height: 1080 },
  thumbnail: { width: 800, height: 800 },
  card: { width: 400, height: 300 },
  mobile: { width: 375, height: 200 }
};

async function generateAllImages() {
  console.log('\n🎨 Generating placeholder images...\n');
  
  for (const service of services) {
    console.log(`📸 Processing ${service.category}/${service.subcategory}`);
    
    for (const [sizeName, dimensions] of Object.entries(sizes)) {
      const outputPath = path.join(baseDir, service.category, `${service.subcategory}-${sizeName}.jpg`);
      await createPlaceholder(`${service.category}\n${service.subcategory}`, dimensions, outputPath);
    }
  }
  
  console.log('\n✨ Placeholder images generated successfully!');
  console.log(`📁 Images saved to: ${baseDir}`);
}

// Run the generation
generateAllImages().catch(console.error);