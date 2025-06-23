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

// Remaining services to generate
const REMAINING_SERVICES = [
  // Tech Support (already have computer repair)
  { category: 'tech-support', service: 'Smart TV Setup' },
  { category: 'tech-support', service: 'WiFi Network Setup' },
  { category: 'tech-support', service: 'Printer Setup' },
  { category: 'tech-support', service: 'Phone & Tablet Repair' },
  { category: 'tech-support', service: 'Data Recovery' },
  { category: 'tech-support', service: 'Software Installation' },
  { category: 'tech-support', service: 'Home Network Security' },
  
  // Pet Care (already have dog walking) 
  { category: 'pet-care', service: 'Pet Sitting' },
  { category: 'pet-care', service: 'Pet Grooming' },
  { category: 'pet-care', service: 'Pet Training' },
  { category: 'pet-care', service: 'Pet Transportation' },
  { category: 'pet-care', service: 'Pet Waste Removal' },
  { category: 'pet-care', service: 'Pet Photography' },
  { category: 'pet-care', service: 'Overnight Pet Care' },
  
  // Personal Care
  { category: 'personal-care', service: 'Hair Styling & Cuts' },
  { category: 'personal-care', service: 'Makeup Services' },
  { category: 'personal-care', service: 'Massage Therapy' },
  { category: 'personal-care', service: 'Personal Training' },
  { category: 'personal-care', service: 'Nail Services' },
  { category: 'personal-care', service: 'Facial Treatments' },
  { category: 'personal-care', service: 'Barber Services' },
  { category: 'personal-care', service: 'Eyebrow & Lash Services' },
  
  // Automotive
  { category: 'automotive', service: 'Oil Change & Filter' },
  { category: 'automotive', service: 'Car Wash & Detailing' },
  { category: 'automotive', service: 'Tire Services' },
  { category: 'automotive', service: 'Battery Replacement' },
  { category: 'automotive', service: 'Brake Services' },
  { category: 'automotive', service: 'AC Service' },
  { category: 'automotive', service: 'General Maintenance' },
  
  // Home Security
  { category: 'home-security', service: 'Security Camera Installation' },
  { category: 'home-security', service: 'Smart Lock Installation' },
  { category: 'home-security', service: 'Alarm System Setup' },
  { category: 'home-security', service: 'Video Doorbell Installation' },
  { category: 'home-security', service: 'Security Assessment' },
  
  // Organization
  { category: 'organization', service: 'Closet Organization' },
  { category: 'organization', service: 'Garage Organization' },
  { category: 'organization', service: 'Kitchen Organization' },
  { category: 'organization', service: 'Office Organization' },
  { category: 'organization', service: 'Digital Organization' },
];

// Style templates
const STYLE_TEMPLATES: Record<string, string> = {
  'tech-support': 'modern technology workspace, professional equipment, clean setup, purple and blue LED lighting, hyperrealistic photography',
  'pet-care': 'friendly pet environment, professional pet care equipment, bright cheerful colors, safe and clean space',
  'personal-care': 'luxurious spa-like environment, professional beauty equipment, soft lighting, calming atmosphere with purple accents',
  'automotive': 'professional auto service center, modern equipment, clean garage, purple and blue branding elements',
  'home-security': 'modern smart home security devices, professional installation, high-tech equipment, purple and blue accent lighting',
  'organization': 'perfectly organized spaces, modern storage solutions, clean minimalist design, purple and blue color accents'
};

class RemainingServicesGenerator {
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
      `${service} results and outcomes, ${style}, professional quality, no people, no text`
    ];
    
    return variants[variant % variants.length];
  }

  async processService(service: string, category: string): Promise<void> {
    const serviceName = service.toLowerCase().replace(/[&\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
    const categoryDir = path.join(OUTPUT_DIR, category);
    
    // Create directory
    await fs.mkdir(categoryDir, { recursive: true });
    
    // Check if already exists
    const existingFiles = await fs.readdir(categoryDir).catch(() => []);
    const hasImages = existingFiles.some(file => file.startsWith(serviceName));
    
    if (hasImages) {
      console.log(`✓ ${service} - Already exists, skipping`);
      return;
    }
    
    console.log(`\n📸 Processing: ${service} (${category})`);
    console.log('━'.repeat(50));
    
    let variantSuccess = 0;
    
    // Generate 4 variants
    for (let i = 0; i < 4; i++) {
      try {
        const prompt = this.buildPrompt(service, category, i);
        console.log(`🎨 Variant ${i + 1}/4: ${prompt.substring(0, 60)}...`);
        
        const imageBuffer = await this.generateImage(prompt);
        
        if (imageBuffer) {
          // Save in two sizes
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
            
            console.log(`   ✅ Saved: ${filename}`);
          }
          
          variantSuccess++;
        } else {
          console.log('   ❌ Failed to generate');
        }
        
      } catch (error: any) {
        console.log('   ❌ Error:', error.message);
      }
      
      // Rate limiting delay
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (variantSuccess > 0) {
      this.successCount++;
    } else {
      this.failedServices.push({ service, error: 'All variants failed' });
    }
  }

  async generateRemainingServices(): Promise<void> {
    console.log('🚀 Leila AI Image Generator - Remaining Services\n');
    console.log(`📊 Generating images for ${REMAINING_SERVICES.length} remaining services`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('━'.repeat(50));
    
    // Process each service
    for (const { category, service } of REMAINING_SERVICES) {
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
    console.log(`✅ Successfully processed: ${this.successCount}/${REMAINING_SERVICES.length} services`);
    
    if (this.failedServices.length > 0) {
      console.log(`\n⚠️  Failed services (${this.failedServices.length}):`);
      this.failedServices.forEach(({ service, error }) => {
        console.log(`   - ${service}: ${error}`);
      });
    }
    
    console.log('\n🎉 Remaining services generation complete!\n');
  }
}

// Run generator
async function main() {
  const generator = new RemainingServicesGenerator();
  await generator.generateRemainingServices();
}

main().catch(console.error);