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

// Final two categories to generate
const FINAL_SERVICES = [
  // Event Services (new category)
  { category: 'event-services', service: 'Event Planning' },
  { category: 'event-services', service: 'Party Setup & Cleanup' },
  { category: 'event-services', service: 'Catering Services' },
  { category: 'event-services', service: 'DJ Services' },
  { category: 'event-services', service: 'Photography Services' },
  { category: 'event-services', service: 'Videography Services' },
  { category: 'event-services', service: 'Balloon Decoration' },
  { category: 'event-services', service: 'Tent & Equipment Rental' },
  { category: 'event-services', service: 'Bartending Services' },
  { category: 'event-services', service: 'Entertainment Booking' },
  { category: 'event-services', service: 'Wedding Coordination' },
  { category: 'event-services', service: 'Corporate Events' },
  { category: 'event-services', service: 'Birthday Party Services' },

  // Miscellaneous (new category)
  { category: 'miscellaneous', service: 'Notary Services' },
  { category: 'miscellaneous', service: 'Document Shredding' },
  { category: 'miscellaneous', service: 'Junk Removal' },
  { category: 'miscellaneous', service: 'Donation Pickup' },
  { category: 'miscellaneous', service: 'Mystery Shopping' },
  { category: 'miscellaneous', service: 'Personal Assistant' },
  { category: 'miscellaneous', service: 'Errand Running' },
  { category: 'miscellaneous', service: 'Gift Wrapping' }
];

// Style templates
const STYLE_TEMPLATES: Record<string, string> = {
  'event-services': 'beautiful event setups, professional party equipment, festive decorations, purple and blue event themes',
  'miscellaneous': 'various professional services, modern equipment, clean workspace, purple and blue service branding'
};

class FinalCategoriesGenerator {
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

      const responseData = response.data as any;
      if (responseData.predictions?.[0]?.bytesBase64Encoded) {
        return Buffer.from(responseData.predictions[0].bytesBase64Encoded, 'base64');
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
    
    console.log(`\n📸 Processing: ${service} (${category})`);
    
    let variantSuccess = 0;
    
    // Generate 4 variants
    for (let i = 0; i < 4; i++) {
      try {
        const prompt = this.buildPrompt(service, category, i);
        console.log(`🎨 Variant ${i + 1}/4...`);
        
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
          }
          
          variantSuccess++;
          console.log(`   ✅ Saved variant ${i + 1}`);
        } else {
          console.log(`   ❌ Failed to generate variant ${i + 1}`);
        }
        
      } catch (error: any) {
        console.log(`   ❌ Error variant ${i + 1}: ${error.message}`);
      }
      
      // Rate limiting delay
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (variantSuccess > 0) {
      this.successCount++;
      console.log(`✅ Completed: ${service} (${variantSuccess}/4 variants)`);
    } else {
      this.failedServices.push({ service, error: 'All variants failed' });
      console.log(`❌ Failed: ${service}`);
    }
  }

  async generate(): Promise<void> {
    console.log('🚀 Leila AI Final Categories Generator\n');
    console.log(`📊 Generating images for ${FINAL_SERVICES.length} services in 2 final categories`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('━'.repeat(50));
    
    // Process each service
    for (const { category, service } of FINAL_SERVICES) {
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
    console.log(`✅ Successfully processed: ${this.successCount}/${FINAL_SERVICES.length} services`);
    
    if (this.failedServices.length > 0) {
      console.log(`\n⚠️  Failed services (${this.failedServices.length}):`);
      this.failedServices.forEach(({ service, error }) => {
        console.log(`   - ${service}: ${error}`);
      });
    }
    
    console.log('\n🎉 Final categories generation complete!\n');
  }
}

// Run generator
async function main() {
  const generator = new FinalCategoriesGenerator();
  await generator.generate();
}

main().catch(console.error);