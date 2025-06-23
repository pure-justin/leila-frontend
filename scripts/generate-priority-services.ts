#!/usr/bin/env node

import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

// Load environment variables
config({ path: path.join(__dirname, '../.env.local') });

// Constants
const PROJECT_ID = 'leila-platform';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagegeneration@006';
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../public/images/services');

// Priority services to generate first
const PRIORITY_SERVICES = [
  { category: 'cleaning', service: 'House Cleaning' },
  { category: 'plumbing', service: 'Drain Cleaning' },
  { category: 'electrical', service: 'Smart Home Installation' },
  { category: 'hvac', service: 'AC Installation & Repair' },
  { category: 'handyman', service: 'TV Mounting' },
  { category: 'landscaping', service: 'Lawn Mowing & Trimming' },
  { category: 'pest-control', service: 'General Inspection' },
  { category: 'moving', service: 'Local Moving' },
  { category: 'tech-support', service: 'Computer Repair' },
  { category: 'pet-care', service: 'Dog Walking' }
];

// Style templates
const STYLE_TEMPLATES = {
  cleaning: 'sparkling clean modern home interior, professional cleaning equipment, bright natural lighting, purple and blue accents, hyperrealistic photography',
  plumbing: 'professional plumbing tools and fixtures, modern bathroom or kitchen, clean workspace, purple and blue accent lighting',
  electrical: 'high-tech smart home devices, modern electrical panels, professional tools, purple and blue LED accents',
  hvac: 'modern HVAC system, professional installation, clean mechanical room, purple and blue technical lighting',
  handyman: 'professional tools and equipment, modern home interior, organized workspace, purple and blue branding',
  landscaping: 'beautiful manicured lawn and garden, professional landscaping equipment, golden hour lighting, vibrant colors',
  'pest-control': 'professional pest control equipment, clean and safe treatment setup, modern home exterior',
  moving: 'professional moving trucks and equipment, organized packing supplies, modern home setting',
  'tech-support': 'modern computer setup, professional repair tools, clean tech workspace, purple and blue ambient lighting',
  'pet-care': 'happy pets in safe environment, professional pet care equipment, bright cheerful setting'
};

class PriorityImageGenerator {
  private auth: GoogleAuth;
  private successCount: number = 0;
  private failedServices: Array<{service: string, error: string}> = [];

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  async generateImage(prompt: string): Promise<Buffer | null> {
    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      const requestBody = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '4:3',
          addWatermark: false,
          safetySetting: 'block_some',
          personGeneration: 'dont_allow',
          seed: Math.floor(Math.random() * 1000000)
        }
      };

      const response = await axios.post(
        ENDPOINT,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );

      if (response.data.predictions?.[0]?.bytesBase64Encoded) {
        return Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64');
      }

      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.message);
    }
  }

  buildPrompt(service: string, category: string, variant: number): string {
    const style = STYLE_TEMPLATES[category] || 'professional service, modern setting, purple and blue accents';
    const variants = [
      `${service} service showcase, ${style}, no people, no text, no logos`,
      `Professional ${service} equipment and tools display, ${style}, no people, no text`,
      `Modern ${service} workspace, ${style}, organized and clean, no people, no text`,
      `${service} before and after transformation, split view, ${style}, no people, no text`
    ];
    
    return variants[variant % variants.length];
  }

  async processService(service: string, category: string): Promise<void> {
    const serviceName = service.toLowerCase().replace(/[&\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
    const categoryDir = path.join(OUTPUT_DIR, category);
    
    // Create directory
    await fs.mkdir(categoryDir, { recursive: true });
    
    console.log(`\n📸 Processing: ${service} (${category})`);
    console.log('━'.repeat(50));
    
    let variantSuccess = 0;
    
    // Generate 4 variants
    for (let i = 0; i < 4; i++) {
      try {
        const prompt = this.buildPrompt(service, category, i);
        console.log(`\n🎨 Variant ${i + 1}/4:`);
        console.log(`   Prompt: "${prompt.substring(0, 80)}..."`);
        
        process.stdout.write('   Generating...');
        const startTime = Date.now();
        const imageBuffer = await this.generateImage(prompt);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        
        if (imageBuffer) {
          process.stdout.write(`\r   ✅ Generated in ${elapsed}s\n`);
          
          // Save in multiple sizes
          const sizes = [
            { width: 800, height: 600, suffix: `${i + 1}` },
            { width: 400, height: 300, suffix: `${i + 1}-thumb` }
          ];
          
          for (const size of sizes) {
            const filename = `${serviceName}-${size.suffix}.png`;
            const filepath = path.join(categoryDir, filename);
            
            await sharp(imageBuffer)
              .resize(size.width, size.height, {
                fit: 'cover',
                position: 'center'
              })
              .png({ quality: 90 })
              .toFile(filepath);
            
            console.log(`   💾 Saved: ${filename} (${size.width}x${size.height})`);
          }
          
          variantSuccess++;
        } else {
          process.stdout.write('\r   ❌ Failed to generate\n');
        }
        
      } catch (error: any) {
        process.stdout.write('\r   ❌ Error: ' + error.message + '\n');
      }
      
      // Rate limiting delay
      if (i < 3) {
        process.stdout.write('   ⏱️  Waiting 3s (rate limit)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        process.stdout.write('\r' + ' '.repeat(40) + '\r');
      }
    }
    
    if (variantSuccess > 0) {
      this.successCount++;
      console.log(`\n✅ Successfully generated ${variantSuccess}/4 variants`);
    } else {
      this.failedServices.push({ service, error: 'All variants failed' });
      console.log('\n❌ Failed to generate any variants');
    }
  }

  async generatePriorityImages(): Promise<void> {
    console.log('🚀 Leila AI Image Generator - Priority Services\n');
    console.log(`📊 Generating images for ${PRIORITY_SERVICES.length} priority services`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('━'.repeat(50));
    
    // Test authentication first
    try {
      const client = await this.auth.getClient();
      await client.getAccessToken();
      console.log('✅ Authentication successful\n');
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      return;
    }
    
    // Process each priority service
    for (const { category, service } of PRIORITY_SERVICES) {
      try {
        await this.processService(service, category);
      } catch (error) {
        console.error(`\n❌ Critical error processing ${service}:`, error);
        this.failedServices.push({ service, error: String(error) });
      }
    }
    
    // Final summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 GENERATION COMPLETE');
    console.log('═'.repeat(50));
    console.log(`✅ Successfully processed: ${this.successCount}/${PRIORITY_SERVICES.length} services`);
    console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
    
    if (this.failedServices.length > 0) {
      console.log(`\n⚠️  Failed services (${this.failedServices.length}):`);
      this.failedServices.forEach(({ service, error }) => {
        console.log(`   - ${service}: ${error}`);
      });
    }
    
    // Calculate total images generated
    const totalImages = this.successCount * 4 * 2; // 4 variants × 2 sizes
    console.log(`\n🎨 Total images generated: ~${totalImages}`);
    console.log('🎉 Priority services complete!\n');
  }
}

// Run generator
async function main() {
  const generator = new PriorityImageGenerator();
  await generator.generatePriorityImages();
}

main().catch(console.error);