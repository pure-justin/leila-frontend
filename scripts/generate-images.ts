#!/usr/bin/env node

/**
 * Consolidated image generation script for Leila platform
 * Generates service images using Google Imagen 2
 * 
 * IMPORTANT: All images are saved to shared-assets folder
 */

import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import sharp from 'sharp';

// Load environment variables
config({ path: path.join(__dirname, '../.env.local') });

// Constants
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'leila-platform';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagegeneration@006';
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

// IMPORTANT: Use shared-assets folder
const OUTPUT_DIR = path.join(__dirname, '../../../shared-assets/images/services');

interface GenerationOptions {
  category?: string;
  service?: string;
  count?: number;
  style?: 'photorealistic' | 'professional' | 'modern';
}

async function ensureDirectoryExists(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  return tokenResponse.token || '';
}

async function generateImage(prompt: string, outputPath: string): Promise<void> {
  try {
    const accessToken = await getAccessToken();
    
    const requestBody = {
      instances: [{
        prompt,
        parameters: {
          sampleCount: 1,
          aspectRatio: '4:3',
          negativePrompt: 'blurry, low quality, distorted, amateur, watermark, text, logo',
        }
      }]
    };

    const response = await axios.post(ENDPOINT, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.data?.predictions?.[0]?.bytesBase64Encoded) {
      const imageBuffer = Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64');
      
      // Save original
      await fs.writeFile(outputPath, imageBuffer);
      
      // Create thumbnail
      const thumbPath = outputPath.replace('.png', '-thumb.png');
      await sharp(imageBuffer)
        .resize(400, 300, { fit: 'cover' })
        .toFile(thumbPath);
      
      // Create WebP versions
      await sharp(imageBuffer)
        .webp({ quality: 85 })
        .toFile(outputPath.replace('.png', '.webp'));
      
      await sharp(imageBuffer)
        .resize(400, 300, { fit: 'cover' })
        .webp({ quality: 85 })
        .toFile(thumbPath.replace('.png', '.webp'));
      
      console.log(`✅ Generated: ${outputPath}`);
    }
  } catch (error) {
    console.error(`❌ Failed to generate ${outputPath}:`, error);
  }
}

async function generateServiceImages(options: GenerationOptions = {}) {
  const { category, service, count = 4, style = 'photorealistic' } = options;
  
  // Load service catalog
  const catalogPath = path.join(__dirname, '../lib/comprehensive-services-catalog.ts');
  const catalogContent = await fs.readFile(catalogPath, 'utf-8');
  
  // Parse services (simplified - in production use proper parsing)
  const services = extractServicesFromCatalog(catalogContent);
  
  // Filter services based on options
  let targetServices = services;
  if (category) {
    targetServices = targetServices.filter(s => s.category === category);
  }
  if (service) {
    targetServices = targetServices.filter(s => s.id === service);
  }
  
  // Generate images
  for (const svc of targetServices) {
    const categoryDir = path.join(OUTPUT_DIR, svc.category);
    await ensureDirectoryExists(categoryDir);
    
    for (let i = 1; i <= count; i++) {
      const prompt = generatePrompt(svc, style, i);
      const outputPath = path.join(categoryDir, `${svc.id}-${i}.png`);
      
      // Skip if already exists
      try {
        await fs.access(outputPath);
        console.log(`⏩ Skipping existing: ${outputPath}`);
        continue;
      } catch {}
      
      await generateImage(prompt, outputPath);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

function generatePrompt(service: any, style: string, imageNum: number): string {
  const basePrompt = `${style} photo of professional ${service.name} service in action`;
  
  const variations = [
    'showing skilled technician at work',
    'featuring modern tools and equipment',
    'highlighting quality results',
    'demonstrating professional expertise'
  ];
  
  return `${basePrompt}, ${variations[imageNum - 1]}, high quality, well-lit, clean environment`;
}

function extractServicesFromCatalog(content: string): any[] {
  // Simplified extraction - in production use proper AST parsing
  const services: any[] = [];
  const categoryMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
  
  // This is a placeholder - implement proper parsing
  return services;
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      console.log('🎨 Generating all service images...');
      await generateServiceImages();
      break;
      
    case 'category':
      const category = args[1];
      if (!category) {
        console.error('❌ Please specify a category');
        process.exit(1);
      }
      console.log(`🎨 Generating images for category: ${category}`);
      await generateServiceImages({ category });
      break;
      
    case 'service':
      const service = args[1];
      if (!service) {
        console.error('❌ Please specify a service ID');
        process.exit(1);
      }
      console.log(`🎨 Generating images for service: ${service}`);
      await generateServiceImages({ service });
      break;
      
    default:
      console.log(`
Leila Image Generator
Usage:
  npm run generate:images all              - Generate all service images
  npm run generate:images category <name>  - Generate images for a category
  npm run generate:images service <id>     - Generate images for a service

Images are saved to: ${OUTPUT_DIR}
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}