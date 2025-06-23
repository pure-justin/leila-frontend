#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Service configurations with better visuals
const SERVICES = [
  // Electrical
  { category: 'electrical', subcategory: 'outlet-installation', icon: '⚡', color1: '#7C3AED', color2: '#6D28D9' },
  { category: 'electrical', subcategory: 'panel-upgrade', icon: '🔌', color1: '#6D28D9', color2: '#5B21B6' },
  { category: 'electrical', subcategory: 'lighting-installation', icon: '💡', color1: '#5B21B6', color2: '#4C1D95' },
  { category: 'electrical', subcategory: 'smart-home', icon: '🏠', color1: '#4C1D95', color2: '#7C3AED' },
  
  // Plumbing
  { category: 'plumbing', subcategory: 'faucet-repair', icon: '🚿', color1: '#3B82F6', color2: '#2563EB' },
  { category: 'plumbing', subcategory: 'pipe-installation', icon: '🔧', color1: '#2563EB', color2: '#1D4ED8' },
  { category: 'plumbing', subcategory: 'drain-cleaning', icon: '🚰', color1: '#1D4ED8', color2: '#1E40AF' },
  { category: 'plumbing', subcategory: 'water-heater', icon: '♨️', color1: '#1E40AF', color2: '#3B82F6' },
  
  // HVAC
  { category: 'hvac', subcategory: 'ac-installation', icon: '❄️', color1: '#06B6D4', color2: '#0891B2' },
  { category: 'hvac', subcategory: 'furnace-repair', icon: '🔥', color1: '#F59E0B', color2: '#D97706' },
  { category: 'hvac', subcategory: 'duct-cleaning', icon: '💨', color1: '#0891B2', color2: '#0E7490' },
  
  // Cleaning
  { category: 'cleaning', subcategory: 'house-cleaning', icon: '🧹', color1: '#10B981', color2: '#059669' },
  { category: 'cleaning', subcategory: 'deep-cleaning', icon: '✨', color1: '#059669', color2: '#047857' },
  { category: 'cleaning', subcategory: 'carpet-cleaning', icon: '🧽', color1: '#047857', color2: '#10B981' },
  
  // Handyman
  { category: 'handyman', subcategory: 'general-repair', icon: '🔨', color1: '#F97316', color2: '#EA580C' },
  { category: 'handyman', subcategory: 'furniture-assembly', icon: '🪑', color1: '#EA580C', color2: '#DC2626' },
  { category: 'handyman', subcategory: 'painting', icon: '🎨', color1: '#DC2626', color2: '#F97316' },
  
  // Landscaping
  { category: 'landscaping', subcategory: 'lawn-care', icon: '🌱', color1: '#84CC16', color2: '#65A30D' },
  { category: 'landscaping', subcategory: 'garden-design', icon: '🌺', color1: '#65A30D', color2: '#4D7C0F' },
  { category: 'landscaping', subcategory: 'tree-service', icon: '🌳', color1: '#4D7C0F', color2: '#84CC16' },
  
  // Appliance
  { category: 'appliance', subcategory: 'refrigerator-repair', icon: '🧊', color1: '#8B5CF6', color2: '#7C3AED' },
  { category: 'appliance', subcategory: 'washer-repair', icon: '🌊', color1: '#6366F1', color2: '#4F46E5' },
  
  // Pest Control
  { category: 'pest-control', subcategory: 'inspection', icon: '🔍', color1: '#EF4444', color2: '#DC2626' },
  { category: 'pest-control', subcategory: 'treatment', icon: '🛡️', color1: '#DC2626', color2: '#B91C1C' }
];

const SIZES = {
  hero: { width: 1920, height: 1080 },
  thumbnail: { width: 800, height: 800 },
  card: { width: 400, height: 300 },
  mobile: { width: 375, height: 200 }
};

async function createEnhancedPlaceholder(service, size, sizeName) {
  const { width, height } = size;
  const isHero = sizeName === 'hero';
  const fontSize = isHero ? 64 : (width > 400 ? 48 : 32);
  const iconSize = isHero ? 120 : (width > 400 ? 80 : 60);
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient -->
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${service.color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${service.color2};stop-opacity:1" />
        </linearGradient>
        
        <!-- Pattern -->
        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/>
        </pattern>
        
        <!-- Glow effect -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#grad)"/>
      <rect width="${width}" height="${height}" fill="url(#dots)"/>
      
      <!-- Center circle -->
      <circle cx="${width/2}" cy="${height/2 - 20}" r="${iconSize}" fill="white" opacity="0.15" filter="url(#glow)"/>
      
      <!-- Icon -->
      <text x="${width/2}" y="${height/2 - 10}" font-size="${iconSize}" text-anchor="middle" filter="url(#glow)">${service.icon}</text>
      
      <!-- Service name -->
      <text x="${width/2}" y="${height/2 + 50}" font-family="system-ui, sans-serif" font-size="${fontSize/2}" fill="white" text-anchor="middle" font-weight="600" opacity="0.95">
        ${service.category.toUpperCase()}
      </text>
      <text x="${width/2}" y="${height/2 + 80}" font-family="system-ui, sans-serif" font-size="${fontSize/3}" fill="white" text-anchor="middle" font-weight="400" opacity="0.8">
        ${service.subcategory.replace(/-/g, ' ')}
      </text>
      
      <!-- Leila branding -->
      <text x="${width - 20}" y="${height - 10}" font-family="system-ui, sans-serif" font-size="12" fill="white" text-anchor="end" opacity="0.4">
        Leila Services
      </text>
    </svg>
  `;
  
  return svg;
}

async function generateAllImages() {
  console.log('🎨 Generating Enhanced Service Images\n');
  
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  let generated = 0;
  let skipped = 0;
  
  for (const service of SERVICES) {
    const categoryDir = path.join(baseDir, service.category);
    
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    console.log(`📸 Processing ${service.category}/${service.subcategory}`);
    
    for (const [sizeName, size] of Object.entries(SIZES)) {
      const outputPath = path.join(categoryDir, `${service.subcategory}-${sizeName}.jpg`);
      
      // Skip if exists and is not tiny
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        if (stats.size > 5000) {
          skipped++;
          continue;
        }
      }
      
      try {
        const svg = await createEnhancedPlaceholder(service, size, sizeName);
        
        await sharp(Buffer.from(svg))
          .jpeg({ quality: 90, progressive: true })
          .toFile(outputPath);
        
        generated++;
      } catch (error) {
        console.error(`❌ Failed to generate ${sizeName}:`, error.message);
      }
    }
  }
  
  console.log(`\n✨ Generation complete!`);
  console.log(`📸 Generated: ${generated} images`);
  console.log(`⏭️  Skipped: ${skipped} existing images`);
  console.log(`📁 Location: ${baseDir}`);
}

// Run the generation
generateAllImages().catch(console.error);