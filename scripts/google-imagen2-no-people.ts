import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Gemini for prompt enhancement
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const PROJECT_ID = 'leila-platform';
const LOCATION = 'us-central1';

// Service images focusing on tools, equipment, and results (no people)
const IMAGEN2_SERVICES_NO_PEOPLE = [
  {
    category: 'electrical',
    subcategory: 'outlet-installation',
    prompt: 'Modern white USB-C electrical outlet freshly installed in luxury home wall, professional electrician tools arranged nearby including voltage tester and wire strippers, marble wall background, perfect installation with level mounting, commercial photography',
    aspectRatio: '4:3'
  },
  {
    category: 'electrical',
    subcategory: 'panel-upgrade',
    prompt: 'State-of-the-art 200-amp electrical panel with smart circuit breakers, LED indicators, organized wire management, professional labeling, modern garage setting, bright LED work lighting illuminating the installation, commercial quality',
    aspectRatio: '4:3'
  },
  {
    category: 'electrical',
    subcategory: 'lighting-installation',
    prompt: 'Designer recessed LED lights installed in luxury living room ceiling, warm ambient glow, modern furniture below, professional ladder and installation tools visible, perfect spacing and alignment, architectural photography',
    aspectRatio: '16:9'
  },
  {
    category: 'electrical',
    subcategory: 'smart-home',
    prompt: 'Elegant touchscreen smart home control panel mounted on wall, home automation interface displaying lighting and climate controls, subtle purple LED accent backlighting, modern interior, high-tech residential',
    aspectRatio: '4:3'
  },
  {
    category: 'plumbing',
    subcategory: 'faucet-repair',
    prompt: 'Premium chrome waterfall faucet in luxury marble bathroom, water flowing smoothly, professional plumbing tools including pipe wrench and Teflon tape arranged on counter, perfect installation visible, commercial photography',
    aspectRatio: '16:9'
  },
  {
    category: 'plumbing',
    subcategory: 'pipe-installation',
    prompt: 'Gleaming new copper pipes professionally installed under modern vanity, perfect solder joints, LED work light illuminating the installation, organized plumbing tools, clean and precise workmanship visible',
    aspectRatio: '4:3'
  },
  {
    category: 'plumbing',
    subcategory: 'drain-cleaning',
    prompt: 'Professional hydro-jetting equipment next to pristine bathroom drain, high-pressure hose coiled neatly, drain camera monitor showing clear pipes, modern bathroom setting, commercial equipment photography',
    aspectRatio: '16:9'
  },
  {
    category: 'plumbing',
    subcategory: 'water-heater',
    prompt: 'Premium tankless water heater mounted on wall, digital temperature display showing 120°F, copper pipe connections with shut-off valves, modern utility room, energy efficiency sticker visible, professional installation',
    aspectRatio: '4:3'
  },
  {
    category: 'hvac',
    subcategory: 'ac-installation',
    prompt: 'High-efficiency variable-speed air conditioner unit installed outside luxury home, digital gauges showing optimal pressure, refrigerant tanks and professional tools arranged nearby, manicured landscape, golden hour light',
    aspectRatio: '16:9'
  },
  {
    category: 'hvac',
    subcategory: 'furnace-repair',
    prompt: 'Modern high-efficiency furnace with access panel open revealing clean components, digital diagnostic tablet displaying system readings, multimeter and HVAC tools on nearby workbench, clean basement setting',
    aspectRatio: '16:9'
  },
  {
    category: 'hvac',
    subcategory: 'duct-cleaning',
    prompt: 'Professional duct cleaning equipment including HEPA filtration system and flexible cleaning brushes, before/after view of air duct showing dramatic improvement, modern home interior, commercial equipment display',
    aspectRatio: '16:9'
  },
  {
    category: 'cleaning',
    subcategory: 'house-cleaning',
    prompt: 'Sparkling clean luxury kitchen after professional cleaning, eco-friendly cleaning products arranged on marble counter, microfiber cloths and professional cleaning caddy, natural sunlight streaming through windows',
    aspectRatio: '16:9'
  },
  {
    category: 'cleaning',
    subcategory: 'deep-cleaning',
    prompt: 'Professional cleaning equipment including steam cleaner and HEPA vacuum in elegant living room, visible transformation from dusty to pristine, color-coded cleaning system, bright natural lighting',
    aspectRatio: '16:9'
  },
  {
    category: 'cleaning',
    subcategory: 'carpet-cleaning',
    prompt: 'Commercial-grade carpet extraction machine on luxury carpet showing clean path versus dirty area, professional cleaning solution bottles, modern living room, dramatic before and after visible',
    aspectRatio: '16:9'
  },
  {
    category: 'handyman',
    subcategory: 'general-repair',
    prompt: 'Professional tool belt with premium tools including hammer, screwdrivers, level, and measuring tape, cabinet hardware repair in progress, modern kitchen background, organized workspace',
    aspectRatio: '4:3'
  },
  {
    category: 'handyman',
    subcategory: 'furniture-assembly',
    prompt: 'Designer furniture partially assembled with professional tools, instruction manual, allen wrenches and electric screwdriver arranged systematically, modern bedroom setting, quality craftsmanship evident',
    aspectRatio: '16:9'
  },
  {
    category: 'handyman',
    subcategory: 'painting',
    prompt: 'Premium paint brush with designer paint creating perfect strokes on accent wall, paint can showing custom color, professional drop cloths protecting hardwood floor, modern interior, even coverage visible',
    aspectRatio: '16:9'
  },
  {
    category: 'landscaping',
    subcategory: 'lawn-care',
    prompt: 'Commercial zero-turn mower creating perfect stripes on luxury estate lawn, golden hour sunlight, manicured hedges in background, professional landscaping equipment, pristine grass patterns',
    aspectRatio: '16:9'
  },
  {
    category: 'landscaping',
    subcategory: 'garden-design',
    prompt: 'Professionally designed garden bed with colorful flowers, landscape design plans visible, premium plants and decorative mulch, garden tools and plant markers, beautiful composition and color variety',
    aspectRatio: '16:9'
  },
  {
    category: 'landscaping',
    subcategory: 'tree-service',
    prompt: 'Professional chainsaw and safety equipment including ropes and harness at base of well-maintained tree, fresh cut branches showing precise trimming, wood chips and sawdust, blue sky background',
    aspectRatio: '16:9'
  },
  {
    category: 'appliance',
    subcategory: 'refrigerator-repair',
    prompt: 'Modern smart refrigerator with door open showing internal components, diagnostic tablet displaying system data, professional appliance repair tools on mat, stainless steel finish, kitchen setting',
    aspectRatio: '4:3'
  },
  {
    category: 'appliance',
    subcategory: 'washer-repair',
    prompt: 'High-efficiency front-load washer with access panel open, diagnostic equipment connected showing readings, professional tools arranged on protective mat, modern laundry room, LED lighting',
    aspectRatio: '4:3'
  },
  {
    category: 'pest-control',
    subcategory: 'inspection',
    prompt: 'Professional pest inspection equipment including UV flashlight, digital moisture meter, and inspection camera, tablet showing inspection checklist, modern home interior, organized equipment layout',
    aspectRatio: '16:9'
  },
  {
    category: 'pest-control',
    subcategory: 'treatment',
    prompt: 'Eco-friendly pest control treatment equipment including precision applicator and safety gear, professional treatment products with green certification labels, modern home exterior, protective barriers visible',
    aspectRatio: '16:9'
  }
];

// Generate image using Google Imagen 2 (no people)
async function generateWithImagen2NoPeople(prompt: string, aspectRatio: string = '16:9'): Promise<Buffer | null> {
  try {
    // Get access token
    const { stdout: token } = await execAsync('gcloud auth print-access-token');
    const accessToken = token.trim();
    
    // Imagen 2 endpoint
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;
    
    const requestBody = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        addWatermark: false,
        safetySetting: 'block_some',
        personGeneration: 'dont_allow', // Key setting - no people
        seed: Math.floor(Math.random() * 1000000),
        negativePrompt: 'people, person, human, man, woman, worker, technician, cartoon, illustration, anime, drawing, sketch, blurry, low quality'
      }
    };
    
    console.log('🎨 Generating with Google Imagen 2...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Imagen 2 API error:', error);
      return null;
    }
    
    const result = await response.json();
    
    if (result.predictions && result.predictions[0] && result.predictions[0].bytesBase64Encoded) {
      console.log('✅ Imagen 2 generated successfully!');
      return Buffer.from(result.predictions[0].bytesBase64Encoded, 'base64');
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// Process and save all variants
async function generateAllVariants(
  imageBuffer: Buffer,
  category: string,
  subcategory: string
): Promise<void> {
  const sizes = {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  };
  
  const outputDir = path.join(__dirname, '../../shared-assets/images/services', category);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const [variant, dimensions] of Object.entries(sizes)) {
    const outputPath = path.join(outputDir, `${subcategory}-${variant}.jpg`);
    
    await sharp(imageBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'attention',
        withoutEnlargement: false
      })
      .jpeg({ 
        quality: 95,
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: '4:4:4'
      })
      .toFile(outputPath);
    
    console.log(`  ✅ ${variant} (${dimensions.width}x${dimensions.height})`);
  }
}

// Main generation function
export async function generateGoogleImagesNoPeople(): Promise<void> {
  console.log('🎨 Google Imagen 2 - Equipment & Environment Focus\n');
  console.log('Generating high-quality images without people\n');
  
  // Check gcloud auth
  try {
    const { stdout } = await execAsync('gcloud config get-value account');
    console.log(`✅ Authenticated as: ${stdout.trim()}`);
  } catch (error) {
    console.error('❌ Not authenticated. Run: gcloud auth application-default login');
    return;
  }
  
  const totalImages = IMAGEN2_SERVICES_NO_PEOPLE.length;
  console.log(`📊 Will generate: ${totalImages} services (${totalImages * 4} total images)`);
  
  console.log('\n⏳ Starting in 3 seconds...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  let success = 0;
  let failed = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < IMAGEN2_SERVICES_NO_PEOPLE.length; i++) {
    const service = IMAGEN2_SERVICES_NO_PEOPLE[i];
    console.log(`\n[${i + 1}/${totalImages}] 📸 ${service.category}/${service.subcategory}`);
    
    // Generate the image
    const imageBuffer = await generateWithImagen2NoPeople(service.prompt, service.aspectRatio);
    
    if (imageBuffer) {
      await generateAllVariants(imageBuffer, service.category, service.subcategory);
      success++;
    } else {
      console.log('  ❌ Generation failed');
      failed++;
    }
    
    // Rate limiting
    if (i < IMAGEN2_SERVICES_NO_PEOPLE.length - 1) {
      console.log('  ⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  console.log('\n✨ Generation Complete!\n');
  console.log(`⏱️  Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`✅ Success: ${success} services (${success * 4} images)`);
  console.log(`❌ Failed: ${failed} services`);
  console.log(`📁 Location: shared-assets/images/services/`);
}

// Generate specific service
export async function generateSpecificServiceNoPeople(category: string, subcategory: string): Promise<void> {
  const service = IMAGEN2_SERVICES_NO_PEOPLE.find(s => 
    s.category === category && s.subcategory === subcategory
  );
  
  if (!service) {
    console.error(`Service not found: ${category}/${subcategory}`);
    return;
  }
  
  console.log(`\n📸 Generating: ${category}/${subcategory}\n`);
  
  const imageBuffer = await generateWithImagen2NoPeople(service.prompt, service.aspectRatio);
  
  if (imageBuffer) {
    await generateAllVariants(imageBuffer, category, subcategory);
    console.log('\n✅ All variants generated successfully!');
  }
}