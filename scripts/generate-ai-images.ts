import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateServiceImage, checkAvailableServices } from './ai-image-generator.js';
import { SERVICE_TEMPLATES } from './gemini-image-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Service configurations with specific prompts
const SERVICE_CONFIGS = [
  // High priority services - most commonly used
  {
    category: 'plumbing',
    subcategory: 'faucet-repair',
    prompts: {
      hero: 'Professional plumber in clean navy uniform installing a gleaming chrome faucet in a modern luxury kitchen with marble countertops, purple and blue accent lighting reflecting off polished surfaces',
      thumbnail: 'Close-up of expert hands installing a premium chrome faucet with professional plumbing tools neatly arranged',
      card: 'Modern kitchen sink with newly installed designer faucet, professional tools visible',
      mobile: 'Plumber working on kitchen faucet installation, bright and clean'
    }
  },
  {
    category: 'electrical',
    subcategory: 'outlet-installation',
    prompts: {
      hero: 'Licensed electrician in safety gear installing modern USB outlets in a contemporary home office, purple LED accent lighting visible',
      thumbnail: 'Close-up of electrician installing white USB outlet with voltage tester',
      card: 'Modern electrical outlet installation with professional tools',
      mobile: 'Electrician working on outlet with safety equipment'
    }
  },
  {
    category: 'hvac',
    subcategory: 'ac-installation',
    prompts: {
      hero: 'HVAC technician installing sleek modern air conditioning unit on side of upscale home, blue sky background',
      thumbnail: 'HVAC professional with digital diagnostic tablet checking AC unit',
      card: 'Modern AC unit being professionally installed',
      mobile: 'AC technician at work with equipment'
    }
  },
  {
    category: 'cleaning',
    subcategory: 'house-cleaning',
    prompts: {
      hero: 'Professional cleaner in branded uniform using eco-friendly products in bright modern living room with purple accents',
      thumbnail: 'Cleaner detailing modern kitchen with professional equipment',
      card: 'Spotless modern home interior after professional cleaning',
      mobile: 'Professional house cleaning in progress'
    }
  }
];

// Progress tracking
interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  startTime: number;
}

const progress: GenerationProgress = {
  total: 0,
  completed: 0,
  failed: 0,
  startTime: Date.now()
};

// Generate images for a service
async function generateServiceImages(config: typeof SERVICE_CONFIGS[0]): Promise<void> {
  console.log(`\n📸 Processing ${config.category}/${config.subcategory}`);
  
  const variants: Array<'hero' | 'thumbnail' | 'card' | 'mobile'> = ['hero', 'thumbnail', 'card', 'mobile'];
  
  for (const variant of variants) {
    progress.total++;
    const prompt = config.prompts[variant];
    
    const success = await generateServiceImage(
      config.category,
      config.subcategory,
      variant,
      prompt
    );
    
    if (success) {
      progress.completed++;
      console.log(`✅ ${variant} generated successfully`);
    } else {
      progress.failed++;
      console.log(`❌ ${variant} generation failed`);
    }
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Display progress
function displayProgress(): void {
  const elapsed = Math.floor((Date.now() - progress.startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  console.log('\n📊 Generation Progress:');
  console.log(`⏱️  Time elapsed: ${minutes}m ${seconds}s`);
  console.log(`📈 Total images: ${progress.total}`);
  console.log(`✅ Completed: ${progress.completed}`);
  console.log(`❌ Failed: ${progress.failed}`);
  console.log(`📊 Success rate: ${Math.round((progress.completed / progress.total) * 100)}%`);
}

// Main generation function
async function generateAllImages(): Promise<void> {
  console.log('🚀 Starting AI Image Generation for Leila Services\n');
  
  // Check available services
  checkAvailableServices();
  
  // Ask for confirmation
  console.log('\n⚠️  This will generate real images using AI services (costs may apply)');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Create directories
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  SERVICE_CONFIGS.forEach(config => {
    const dir = path.join(baseDir, config.category);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Generate images
  for (const config of SERVICE_CONFIGS) {
    await generateServiceImages(config);
  }
  
  // Display final progress
  displayProgress();
  
  console.log('\n✨ Image generation complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Review generated images in shared-assets/images/services/');
  console.log('2. Run npm run images:optimize to optimize file sizes');
  console.log('3. Test images in the application');
  console.log('4. Generate remaining service images as needed');
}

// Generate specific service
async function generateSpecificService(category: string, subcategory: string): Promise<void> {
  const config = SERVICE_CONFIGS.find(c => 
    c.category === category && c.subcategory === subcategory
  );
  
  if (!config) {
    console.error(`❌ Service configuration not found for ${category}/${subcategory}`);
    return;
  }
  
  await generateServiceImages(config);
  displayProgress();
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await generateAllImages();
  } else if (args.length === 2) {
    await generateSpecificService(args[0], args[1]);
  } else {
    console.log('Usage:');
    console.log('  Generate all images: npm run ai:generate');
    console.log('  Generate specific: npm run ai:generate <category> <subcategory>');
    console.log('\nExample:');
    console.log('  npm run ai:generate electrical outlet-installation');
  }
}

if (import.meta.url === `file://${__filename}`) {
  main().catch(console.error);
}

export { generateAllImages, generateSpecificService };