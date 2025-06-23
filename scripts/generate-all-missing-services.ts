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

// All missing and incomplete services
const ALL_MISSING_SERVICES = [
  // Automotive (0/16 - EMPTY)
  { category: 'automotive', service: 'Oil Change & Filter' },
  { category: 'automotive', service: 'Car Wash & Detailing' },
  { category: 'automotive', service: 'Tire Services' },
  { category: 'automotive', service: 'Battery Replacement' },
  { category: 'automotive', service: 'Brake Services' },
  { category: 'automotive', service: 'AC Service' },
  { category: 'automotive', service: 'General Maintenance' },
  { category: 'automotive', service: 'Engine Diagnostics' },
  { category: 'automotive', service: 'Transmission Service' },
  { category: 'automotive', service: 'Exhaust System Repair' },
  { category: 'automotive', service: 'Windshield Repair' },
  { category: 'automotive', service: 'Interior Detailing' },
  { category: 'automotive', service: 'Paint Protection' },
  { category: 'automotive', service: 'Wheel Alignment' },
  { category: 'automotive', service: 'Emergency Roadside' },
  { category: 'automotive', service: 'Pre-Purchase Inspection' },

  // Moving (6/16 - needs 10 more)
  { category: 'moving', service: 'Local Moving' },
  { category: 'moving', service: 'Long Distance Moving' },
  { category: 'moving', service: 'Packing Services' },
  { category: 'moving', service: 'Storage Solutions' },
  { category: 'moving', service: 'Furniture Assembly' },
  { category: 'moving', service: 'Heavy Item Moving' },
  { category: 'moving', service: 'Office Relocation' },
  { category: 'moving', service: 'Piano Moving' },
  { category: 'moving', service: 'Loading/Unloading Help' },
  { category: 'moving', service: 'Moving Supplies' },

  // Plumbing (8/16 - needs 8 more)
  { category: 'plumbing', service: 'Drain Cleaning' },
  { category: 'plumbing', service: 'Leak Repair' },
  { category: 'plumbing', service: 'Toilet Repair' },
  { category: 'plumbing', service: 'Water Heater Service' },
  { category: 'plumbing', service: 'Pipe Installation' },
  { category: 'plumbing', service: 'Sewer Line Service' },
  { category: 'plumbing', service: 'Garbage Disposal Repair' },
  { category: 'plumbing', service: 'Water Filtration' },

  // HVAC (8/16 - needs 8 more)
  { category: 'hvac', service: 'AC Repair' },
  { category: 'hvac', service: 'Heating Repair' },
  { category: 'hvac', service: 'Duct Cleaning' },
  { category: 'hvac', service: 'System Installation' },
  { category: 'hvac', service: 'Thermostat Installation' },
  { category: 'hvac', service: 'Air Quality Testing' },
  { category: 'hvac', service: 'Refrigerant Recharge' },
  { category: 'hvac', service: 'Emergency HVAC Service' },

  // Cleaning (8/18 - needs 10 more)
  { category: 'cleaning', service: 'Deep Cleaning' },
  { category: 'cleaning', service: 'Move-In/Out Cleaning' },
  { category: 'cleaning', service: 'Post-Construction Cleaning' },
  { category: 'cleaning', service: 'Carpet Cleaning' },
  { category: 'cleaning', service: 'Window Cleaning' },
  { category: 'cleaning', service: 'Pressure Washing' },
  { category: 'cleaning', service: 'Gutter Cleaning' },
  { category: 'cleaning', service: 'Garage Cleaning' },
  { category: 'cleaning', service: 'Attic & Basement Cleaning' },
  { category: 'cleaning', service: 'Green Eco Cleaning' },

  // Handyman (8/18 - needs 10 more)
  { category: 'handyman', service: 'Furniture Assembly' },
  { category: 'handyman', service: 'TV Mounting' },
  { category: 'handyman', service: 'Picture Hanging' },
  { category: 'handyman', service: 'Drywall Repair' },
  { category: 'handyman', service: 'Caulking & Sealing' },
  { category: 'handyman', service: 'Door & Window Repair' },
  { category: 'handyman', service: 'Deck & Patio Repair' },
  { category: 'handyman', service: 'Shelving Installation' },
  { category: 'handyman', service: 'Ceiling Fan Installation' },
  { category: 'handyman', service: 'Home Maintenance' },

  // Landscaping (8/18 - needs 10 more)
  { category: 'landscaping', service: 'Lawn Mowing' },
  { category: 'landscaping', service: 'Tree Trimming' },
  { category: 'landscaping', service: 'Garden Design' },
  { category: 'landscaping', service: 'Sprinkler Repair' },
  { category: 'landscaping', service: 'Sod Installation' },
  { category: 'landscaping', service: 'Mulching' },
  { category: 'landscaping', service: 'Leaf Removal' },
  { category: 'landscaping', service: 'Fertilization' },
  { category: 'landscaping', service: 'Landscape Lighting' },
  { category: 'landscaping', service: 'Hardscaping' },

  // Pest Control (8/16 - needs 8 more)
  { category: 'pest-control', service: 'Ant Control' },
  { category: 'pest-control', service: 'Rodent Control' },
  { category: 'pest-control', service: 'Termite Inspection' },
  { category: 'pest-control', service: 'Bed Bug Treatment' },
  { category: 'pest-control', service: 'Mosquito Control' },
  { category: 'pest-control', service: 'Wildlife Removal' },
  { category: 'pest-control', service: 'Wasp & Bee Removal' },
  { category: 'pest-control', service: 'Preventive Treatment' },

  // Personal Care (12/16 - needs 4 more)
  { category: 'personal-care', service: 'Waxing Services' },
  { category: 'personal-care', service: 'Tanning Services' },
  { category: 'personal-care', service: 'Wellness Coaching' },
  { category: 'personal-care', service: 'Nutrition Consulting' },

  // Home Security (0/15 - NEW CATEGORY)
  { category: 'home-security', service: 'Security Camera Installation' },
  { category: 'home-security', service: 'Smart Lock Installation' },
  { category: 'home-security', service: 'Alarm System Setup' },
  { category: 'home-security', service: 'Video Doorbell Installation' },
  { category: 'home-security', service: 'Security Assessment' },
  { category: 'home-security', service: 'Motion Sensor Installation' },
  { category: 'home-security', service: 'Window Security' },
  { category: 'home-security', service: 'Safe Installation' },
  { category: 'home-security', service: 'Access Control Systems' },
  { category: 'home-security', service: 'Security Lighting' },
  { category: 'home-security', service: 'Smoke & CO Detectors' },
  { category: 'home-security', service: 'Home Automation' },
  { category: 'home-security', service: 'Security Monitoring' },
  { category: 'home-security', service: 'Emergency Response Setup' },
  { category: 'home-security', service: 'Security System Repair' },

  // Seasonal (0/15 - NEW CATEGORY)
  { category: 'seasonal', service: 'Holiday Light Installation' },
  { category: 'seasonal', service: 'Snow Removal' },
  { category: 'seasonal', service: 'Pool Opening/Closing' },
  { category: 'seasonal', service: 'Spring Cleanup' },
  { category: 'seasonal', service: 'Fall Cleanup' },
  { category: 'seasonal', service: 'Holiday Decoration' },
  { category: 'seasonal', service: 'Winterization Services' },
  { category: 'seasonal', service: 'Storm Preparation' },
  { category: 'seasonal', service: 'Outdoor Furniture Storage' },
  { category: 'seasonal', service: 'Grill Maintenance' },
  { category: 'seasonal', service: 'Ice Dam Removal' },
  { category: 'seasonal', service: 'Summer AC Prep' },
  { category: 'seasonal', service: 'Winter Heating Prep' },
  { category: 'seasonal', service: 'Seasonal Planting' },
  { category: 'seasonal', service: 'Storm Damage Cleanup' },

  // Organization (0/15 - NEW CATEGORY)
  { category: 'organization', service: 'Closet Organization' },
  { category: 'organization', service: 'Garage Organization' },
  { category: 'organization', service: 'Kitchen Organization' },
  { category: 'organization', service: 'Office Organization' },
  { category: 'organization', service: 'Digital Organization' },
  { category: 'organization', service: 'Pantry Organization' },
  { category: 'organization', service: 'Basement Organization' },
  { category: 'organization', service: 'Attic Organization' },
  { category: 'organization', service: 'Decluttering Services' },
  { category: 'organization', service: 'Moving Organization' },
  { category: 'organization', service: 'Paper & Document Organizing' },
  { category: 'organization', service: 'Photo Organization' },
  { category: 'organization', service: 'Storage Solutions' },
  { category: 'organization', service: 'Home Staging' },
  { category: 'organization', service: 'Estate Organization' },

  // Senior Care (0/15 - NEW CATEGORY)
  { category: 'senior-care', service: 'Companionship Services' },
  { category: 'senior-care', service: 'Medication Reminders' },
  { category: 'senior-care', service: 'Meal Preparation' },
  { category: 'senior-care', service: 'Transportation Services' },
  { category: 'senior-care', service: 'Light Housekeeping' },
  { category: 'senior-care', service: 'Grocery Shopping' },
  { category: 'senior-care', service: 'Personal Care Assistance' },
  { category: 'senior-care', service: 'Home Safety Assessment' },
  { category: 'senior-care', service: 'Exercise Assistance' },
  { category: 'senior-care', service: 'Technology Help' },
  { category: 'senior-care', service: 'Social Activities' },
  { category: 'senior-care', service: 'Appointment Scheduling' },
  { category: 'senior-care', service: 'Overnight Care' },
  { category: 'senior-care', service: 'Respite Care' },
  { category: 'senior-care', service: 'Memory Care Support' },

  // Tutoring (0/16 - NEW CATEGORY)
  { category: 'tutoring', service: 'Math Tutoring' },
  { category: 'tutoring', service: 'Science Tutoring' },
  { category: 'tutoring', service: 'Language Arts Tutoring' },
  { category: 'tutoring', service: 'Test Prep (SAT/ACT)' },
  { category: 'tutoring', service: 'College Prep' },
  { category: 'tutoring', service: 'Study Skills Coaching' },
  { category: 'tutoring', service: 'Foreign Language' },
  { category: 'tutoring', service: 'Music Lessons' },
  { category: 'tutoring', service: 'Art Lessons' },
  { category: 'tutoring', service: 'Computer Skills' },
  { category: 'tutoring', service: 'Adult Education' },
  { category: 'tutoring', service: 'Special Needs Support' },
  { category: 'tutoring', service: 'Homework Help' },
  { category: 'tutoring', service: 'Reading Support' },
  { category: 'tutoring', service: 'Writing Skills' },
  { category: 'tutoring', service: 'STEM Programs' },

  // Event Services (0/13 - NEW CATEGORY)
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

  // Miscellaneous (0/8 - NEW CATEGORY)
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
  'automotive': 'professional auto service center, modern equipment, clean garage environment, purple and blue branding elements, hyperrealistic photography',
  'moving': 'professional moving trucks and equipment, organized packing supplies, clean warehouse, purple and blue accents',
  'plumbing': 'professional plumbing tools and fixtures, clean modern bathroom/kitchen, purple and blue lighting accents',
  'hvac': 'modern HVAC systems and equipment, professional installation setup, purple and blue accent lighting',
  'cleaning': 'spotless clean spaces, professional cleaning equipment, bright environment, purple and blue cleaning supplies',
  'handyman': 'professional tools and workspace, organized tool display, modern home repair, purple and blue tool accents',
  'landscaping': 'beautiful outdoor spaces, professional landscaping equipment, lush gardens, purple and blue flower accents',
  'pest-control': 'professional pest control equipment, clean modern home protection, purple and blue safety gear',
  'personal-care': 'luxurious spa-like environment, professional beauty equipment, soft lighting, calming atmosphere with purple accents',
  'home-security': 'modern smart home security devices, professional installation, high-tech equipment, purple and blue accent lighting',
  'seasonal': 'seasonal home services, weather-appropriate equipment, festive decorations, purple and blue seasonal themes',
  'organization': 'perfectly organized spaces, modern storage solutions, clean minimalist design, purple and blue color accents',
  'senior-care': 'warm comfortable home environment, caring professional equipment, safety features, purple and blue comfort elements',
  'tutoring': 'modern learning environment, educational materials, bright study space, purple and blue educational accents',
  'event-services': 'beautiful event setups, professional party equipment, festive decorations, purple and blue event themes',
  'miscellaneous': 'various professional services, modern equipment, clean workspace, purple and blue service branding'
};

class MissingServicesGenerator {
  private auth: GoogleAuth;
  private successCount: number = 0;
  private failedServices: Array<{service: string, error: string}> = [];
  private processedCount: number = 0;

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
    
    // Check if already exists
    const existingFiles = await fs.readdir(categoryDir).catch(() => []);
    const hasImages = existingFiles.some(file => file.startsWith(serviceName));
    
    if (hasImages) {
      console.log(`✓ ${service} - Already exists, skipping`);
      return;
    }
    
    this.processedCount++;
    console.log(`\n📸 Processing [${this.processedCount}/${ALL_MISSING_SERVICES.length}]: ${service} (${category})`);
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

  async generateAllMissingServices(): Promise<void> {
    console.log('🚀 Leila AI Image Generator - All Missing Services\n');
    console.log(`📊 Generating images for ${ALL_MISSING_SERVICES.length} services`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log('━'.repeat(50));
    
    // Group by category for better progress tracking
    const categoryCounts = ALL_MISSING_SERVICES.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('\n📋 Services by category:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} services`);
    });
    console.log('━'.repeat(50));
    
    // Process each service
    for (const { category, service } of ALL_MISSING_SERVICES) {
      try {
        await this.processService(service, category);
      } catch (error) {
        console.error(`\n❌ Critical error processing ${service}:`, error);
        this.failedServices.push({ service, error: String(error) });
      }
      
      // Longer delay between services to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Final summary
    console.log('\n' + '═'.repeat(50));
    console.log('📊 GENERATION COMPLETE');
    console.log('═'.repeat(50));
    console.log(`✅ Successfully processed: ${this.successCount}/${ALL_MISSING_SERVICES.length} services`);
    
    if (this.failedServices.length > 0) {
      console.log(`\n⚠️  Failed services (${this.failedServices.length}):`);
      this.failedServices.forEach(({ service, error }) => {
        console.log(`   - ${service}: ${error}`);
      });
    }
    
    // Save status report
    const statusReport = {
      timestamp: new Date().toISOString(),
      totalServices: ALL_MISSING_SERVICES.length,
      successCount: this.successCount,
      failedCount: this.failedServices.length,
      failedServices: this.failedServices,
      categorySummary: categoryCounts
    };
    
    await fs.writeFile(
      path.join(__dirname, 'image-generation-status.json'),
      JSON.stringify(statusReport, null, 2)
    );
    
    console.log('\n📄 Status report saved to: scripts/image-generation-status.json');
    console.log('\n🎉 All missing services generation complete!\n');
  }
}

// Run generator
async function main() {
  const generator = new MissingServicesGenerator();
  await generator.generateAllMissingServices();
}

main().catch(console.error);