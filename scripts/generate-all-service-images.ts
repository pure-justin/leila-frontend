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
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'leila-platform';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagegeneration@006';
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../public/images/services');

// Service categories and their services
const SERVICE_CATEGORIES = {
  'electrical': [
    'Smart Home Installation',
    'Electrical Panel Upgrade',
    'Outlet Repair & Installation',
    'Ceiling Fan Installation',
    'Landscape Lighting',
    'Emergency Electrical',
    'Lighting Installation',
    'Electrical Inspection'
  ],
  'plumbing': [
    'Drain Cleaning',
    'Faucet Repair & Installation',
    'Water Heater Installation',
    'Toilet Repair & Installation',
    'Pipe Repair',
    'Sewer Line Service',
    'Water Pressure Fix',
    'Emergency Plumbing'
  ],
  'hvac': [
    'AC Installation & Repair',
    'Heating System Repair',
    'Duct Cleaning',
    'Thermostat Installation',
    'HVAC Maintenance'
  ],
  'cleaning': [
    'House Cleaning',
    'Deep Cleaning',
    'Move-In/Move-Out Cleaning',
    'Office Cleaning',
    'Post-Construction Cleaning',
    'Window Cleaning',
    'Carpet Cleaning',
    'Garage Cleaning',
    'Green Cleaning',
    'Sanitization Service'
  ],
  'personal-care': [
    'Hair Styling & Cuts',
    'Makeup Services',
    'Massage Therapy',
    'Personal Training',
    'Nail Services',
    'Facial Treatments',
    'Barber Services',
    'Eyebrow & Lash Services'
  ],
  'automotive': [
    'Oil Change & Filter',
    'Car Wash & Detailing',
    'Tire Services',
    'Battery Replacement',
    'Brake Services',
    'AC Service',
    'General Maintenance'
  ],
  'pet-care': [
    'Dog Walking',
    'Pet Sitting',
    'Pet Grooming',
    'Pet Training',
    'Pet Transportation',
    'Pet Waste Removal',
    'Pet Photography',
    'Overnight Pet Care'
  ],
  'handyman': [
    'TV Mounting',
    'Furniture Assembly',
    'Drywall Repair',
    'Interior Painting',
    'Picture Hanging',
    'Shelf Installation',
    'Door & Lock Repair',
    'Cabinet Installation',
    'General Repairs'
  ],
  'landscaping': [
    'Lawn Mowing & Trimming',
    'Garden Design & Planting',
    'Tree Trimming & Removal',
    'Sprinkler System Service',
    'Mulching & Bed Maintenance',
    'Leaf Removal',
    'Fertilization Service',
    'Landscape Design',
    'Snow Removal',
    'Gutter Cleaning',
    'Power Washing'
  ],
  'pest-control': [
    'General Inspection',
    'Termite Treatment',
    'Rodent Control',
    'Bed Bug Treatment',
    'Ant & Roach Control',
    'Wildlife Removal',
    'Mosquito Control'
  ],
  'moving': [
    'Local Moving',
    'Furniture Moving',
    'Packing Services',
    'Heavy Lifting',
    'Junk Removal',
    'Storage Solutions'
  ],
  'tech-support': [
    'Computer Repair',
    'Smart TV Setup',
    'WiFi Network Setup',
    'Printer Setup',
    'Phone & Tablet Repair',
    'Data Recovery',
    'Software Installation',
    'Home Network Security'
  ],
  'home-security': [
    'Security Camera Installation',
    'Smart Lock Installation',
    'Alarm System Setup',
    'Video Doorbell Installation',
    'Security Assessment'
  ],
  'seasonal': [
    'Holiday Decorating',
    'Spring Cleaning Special',
    'AC Tune-Up',
    'Gutter Guard Installation',
    'Christmas Light Installation'
  ],
  'organization': [
    'Closet Organization',
    'Garage Organization',
    'Kitchen Organization',
    'Office Organization',
    'Digital Organization'
  ],
  'senior-care': [
    'Companionship Services',
    'Grocery Shopping Assistance',
    'Medication Reminders',
    'Transportation Services',
    'Home Safety Assessment'
  ],
  'tutoring': [
    'Math Tutoring',
    'Science Tutoring',
    'Language Tutoring',
    'Test Prep Tutoring',
    'Music Lessons'
  ],
  'event-services': [
    'Party Planning',
    'Photography Services',
    'DJ Services',
    'Catering Services',
    'Event Decoration'
  ],
  'miscellaneous': [
    'Pool Maintenance',
    'Hot Tub Service',
    'Fence Repair',
    'Deck Maintenance',
    'Welding Services',
    'Locksmith Services',
    'Appliance Repair',
    'Solar Panel Cleaning'
  ]
};

// Style templates for different service types
const STYLE_TEMPLATES = {
  technical: 'professional technical equipment and tools, modern workspace, purple and blue accent lighting, hyperrealistic photography',
  home: 'beautiful modern home interior, bright natural lighting, clean and organized space, purple and blue decorative accents',
  outdoor: 'professional outdoor scene, golden hour lighting, well-maintained property, vibrant colors with purple and blue highlights',
  wellness: 'spa-like serene environment, soft diffused lighting, calming atmosphere, purple and blue color scheme',
  automotive: 'modern auto service center, professional equipment, clean workspace, purple and blue branding elements',
  pet: 'friendly pet-safe environment, bright cheerful atmosphere, professional pet care equipment, purple and blue accents'
};

// Determine style based on category
function getStyleForCategory(category: string): string {
  const styleMap: Record<string, string> = {
    'electrical': 'technical',
    'plumbing': 'technical',
    'hvac': 'technical',
    'tech-support': 'technical',
    'home-security': 'technical',
    'cleaning': 'home',
    'organization': 'home',
    'handyman': 'home',
    'landscaping': 'outdoor',
    'pest-control': 'outdoor',
    'seasonal': 'outdoor',
    'personal-care': 'wellness',
    'senior-care': 'wellness',
    'tutoring': 'wellness',
    'automotive': 'automotive',
    'pet-care': 'pet',
    'moving': 'home',
    'event-services': 'home',
    'miscellaneous': 'technical'
  };
  
  return STYLE_TEMPLATES[styleMap[category] || 'home'];
}

class ServiceImageGenerator {
  private auth: GoogleAuth;
  private generatedCount: number = 0;
  private failedServices: string[] = [];

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  async generateImage(prompt: string, aspectRatio: string = '4:3'): Promise<Buffer | null> {
    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      const requestBody = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
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
          timeout: 60000 // 60 second timeout
        }
      );

      if ((response.data as any).predictions?.[0]?.bytesBase64Encoded) {
        return Buffer.from((response.data as any).predictions[0].bytesBase64Encoded, 'base64');
      }

      return null;
    } catch (error: any) {
      console.error(`Error generating image: ${error.message}`);
      return null;
    }
  }

  buildPrompt(service: string, category: string, variantIndex: number): string {
    const style = getStyleForCategory(category);
    const variants = [
      `Professional ${service} service in action, ${style}, no people or text`,
      `High-quality equipment and tools for ${service}, ${style}, no people or text`,
      `${service} service results showcase, before and after concept, ${style}, no people or text`,
      `Modern ${service} workspace and setup, ${style}, no people or text`
    ];
    
    return variants[variantIndex % variants.length];
  }

  async processService(service: string, category: string): Promise<void> {
    const serviceName = service.toLowerCase().replace(/[&\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
    const categoryDir = path.join(OUTPUT_DIR, category);
    
    // Create directory if it doesn't exist
    await fs.mkdir(categoryDir, { recursive: true });
    
    // Check if images already exist for this service
    const existingFiles = await fs.readdir(categoryDir).catch(() => []);
    const hasImages = existingFiles.some(file => file.startsWith(serviceName));
    
    if (hasImages) {
      console.log(`✓ ${service} - Images already exist`);
      return;
    }
    
    console.log(`\n🎨 Generating images for: ${service} (${category})`);
    
    // Generate 4 variants
    for (let i = 0; i < 4; i++) {
      const prompt = this.buildPrompt(service, category, i);
      console.log(`  Variant ${i + 1}: ${prompt.substring(0, 60)}...`);
      
      const imageBuffer = await this.generateImage(prompt);
      
      if (imageBuffer) {
        // Save multiple sizes
        const sizes = [
          { width: 800, height: 600, suffix: `${i + 1}` },
          { width: 400, height: 300, suffix: `${i + 1}-thumb` },
          { width: 1200, height: 900, suffix: `${i + 1}-large` }
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
          
          console.log(`  ✅ Saved: ${filename}`);
        }
        
        this.generatedCount++;
      } else {
        console.log(`  ❌ Failed to generate variant ${i + 1}`);
        if (i === 0) {
          this.failedServices.push(service);
        }
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  async generateAllImages(): Promise<void> {
    console.log('🚀 Starting batch image generation for all services...\n');
    
    // Create output directory
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    let totalServices = 0;
    Object.values(SERVICE_CATEGORIES).forEach(services => {
      totalServices += services.length;
    });
    
    console.log(`📊 Total services to process: ${totalServices}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);
    
    // Process each category
    for (const [category, services] of Object.entries(SERVICE_CATEGORIES)) {
      console.log(`\n📂 Processing ${category} (${services.length} services)`);
      
      for (const service of services) {
        try {
          await this.processService(service, category);
        } catch (error) {
          console.error(`❌ Error processing ${service}: ${error}`);
          this.failedServices.push(service);
        }
      }
    }
    
    // Summary
    console.log('\n\n📊 Generation Summary:');
    console.log(`✅ Successfully generated images for ${this.generatedCount} services`);
    console.log(`❌ Failed services: ${this.failedServices.length}`);
    
    if (this.failedServices.length > 0) {
      console.log('\nFailed services:');
      this.failedServices.forEach(service => console.log(`  - ${service}`));
      
      // Save failed services to file for retry
      await fs.writeFile(
        path.join(__dirname, 'failed-services.txt'),
        this.failedServices.join('\n')
      );
      console.log('\nFailed services saved to failed-services.txt for retry');
    }
    
    // Create image catalog JSON
    const catalog: Record<string, any> = {};
    
    for (const [category, services] of Object.entries(SERVICE_CATEGORIES)) {
      catalog[category] = {};
      
      for (const service of services) {
        const serviceName = service.toLowerCase().replace(/[&\s]+/g, '-').replace(/[^a-z0-9-]/g, '');
        const categoryDir = path.join(OUTPUT_DIR, category);
        
        try {
          const files = await fs.readdir(categoryDir);
          const serviceFiles = files.filter(f => f.startsWith(serviceName));
          
          if (serviceFiles.length > 0) {
            catalog[category][service] = {
              id: serviceName,
              images: serviceFiles.map(f => `/images/services/${category}/${f}`)
            };
          }
        } catch (error) {
          // Directory doesn't exist
        }
      }
    }
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'image-catalog.json'),
      JSON.stringify(catalog, null, 2)
    );
    
    console.log('\n✅ Image catalog saved to image-catalog.json');
    console.log('\n🎉 Batch generation complete!');
  }
}

// Run the generator
async function main() {
  const generator = new ServiceImageGenerator();
  await generator.generateAllImages();
}

main().catch(console.error);