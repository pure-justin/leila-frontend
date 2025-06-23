import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Gemini for prompt enhancement
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// API response interfaces
interface StabilityAIResponse {
  artifacts: Array<{
    base64: string;
  }>;
}

interface ReplicatePrediction {
  id: string;
}

interface ReplicateStatus {
  status: string;
  output?: string[];
}

// Premium service configurations
interface PremiumService {
  name: string;
  available: boolean;
  quality: number; // 1-10 rating
  cost: string;
  generate: (prompt: string, size?: string) => Promise<Buffer | null>;
}

// DALL-E 3 - Highest quality for professional services
async function generateWithDALLE3(prompt: string, size: string = '1024x1024'): Promise<Buffer | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    console.log('🎨 Generating with DALL-E 3 HD...');
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'hd',
        style: 'natural'
      })
    });

    const data = await response.json() as any;
    
    if (data.data && data.data[0] && data.data[0].url) {
      const imageResponse = await fetch(data.data[0].url);
      const buffer = await imageResponse.buffer();
      console.log('✅ DALL-E 3 HD image generated!');
      return buffer;
    }
    
    console.error('DALL-E 3 error:', data.error);
    return null;
  } catch (error) {
    console.error('DALL-E 3 error:', error);
    return null;
  }
}

// Stability AI SDXL - High quality photorealistic
async function generateWithStabilitySDXL(prompt: string): Promise<Buffer | null> {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) return null;

  try {
    console.log('🎨 Generating with Stability AI SDXL 1.0...');
    
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt + ', professional photography, 8k resolution, hyperrealistic, commercial quality',
            weight: 1
          },
          {
            text: 'cartoon, illustration, anime, drawing, sketch, blurry, low quality, amateur',
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 50,
        style_preset: 'photographic'
      })
    });

    const data = await response.json() as StabilityAIResponse;
    
    if (data.artifacts && data.artifacts[0]) {
      const imageData = data.artifacts[0].base64;
      console.log('✅ Stability SDXL image generated!');
      return Buffer.from(imageData, 'base64');
    }
    
    console.error('Stability AI error:', data);
    return null;
  } catch (error) {
    console.error('Stability AI error:', error);
    return null;
  }
}

// Replicate - Access to multiple premium models
async function generateWithReplicate(prompt: string): Promise<Buffer | null> {
  const apiKey = process.env.REPLICATE_API_TOKEN;
  if (!apiKey) return null;

  try {
    console.log('🎨 Generating with Replicate (SDXL)...');
    
    // Using SDXL for highest quality
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', // SDXL v1.0
        input: {
          prompt: prompt + ', professional photography, commercial quality, high resolution, photorealistic',
          negative_prompt: 'cartoon, illustration, low quality, blurry, amateur, watermark',
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          scheduler: 'K_EULER',
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8
        }
      })
    });

    const prediction = await response.json() as ReplicatePrediction;
    
    // Poll for completion
    let result = null;
    for (let i = 0; i < 60; i++) { // Wait up to 60 seconds
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${apiKey}` }
      });
      
      const status = await statusResponse.json() as ReplicateStatus;
      
      if (status.status === 'succeeded' && status.output) {
        result = status.output[0];
        break;
      } else if (status.status === 'failed') {
        throw new Error('Generation failed');
      }
    }
    
    if (result) {
      const imageResponse = await fetch(result);
      const buffer = await imageResponse.buffer();
      console.log('✅ Replicate SDXL image generated!');
      return buffer;
    }
    
    return null;
  } catch (error) {
    console.error('Replicate error:', error);
    return null;
  }
}

// Premium prompts optimized for each service
const PREMIUM_SERVICE_PROMPTS = [
  {
    category: 'electrical',
    subcategory: 'outlet-installation',
    basePrompt: 'Professional electrician in crisp navy uniform installing modern white USB-C outlet in upscale home',
    style: 'bright natural lighting, shallow depth of field, professional tools visible, marble wall background'
  },
  {
    category: 'electrical',
    subcategory: 'panel-upgrade',
    basePrompt: 'Licensed master electrician working on modern 200-amp electrical panel with digital circuit breakers',
    style: 'professional garage lighting, safety equipment visible, organized workspace, high-end residential'
  },
  {
    category: 'electrical',
    subcategory: 'lighting-installation',
    basePrompt: 'Electrician on professional ladder installing designer recessed LED lights in luxury living room',
    style: 'warm ambient lighting, modern furniture visible, high ceiling, professional equipment'
  },
  {
    category: 'electrical',
    subcategory: 'smart-home',
    basePrompt: 'Smart home technician programming touchscreen control panel showing home automation interface',
    style: 'modern home interior, subtle purple accent lighting, tablet and tools visible'
  },
  {
    category: 'plumbing',
    subcategory: 'faucet-repair',
    basePrompt: 'Expert plumber installing premium chrome waterfall faucet in marble bathroom',
    style: 'natural window light, luxury fixtures, professional plumbing tools, clean workspace'
  },
  {
    category: 'plumbing',
    subcategory: 'pipe-installation',
    basePrompt: 'Professional plumber installing copper pipes under modern vanity with LED work light',
    style: 'bright work lighting, organized tools, clean installation, visible craftsmanship'
  },
  {
    category: 'plumbing',
    subcategory: 'drain-cleaning',
    basePrompt: 'Plumber using professional hydro-jetting equipment in modern bathroom',
    style: 'clean environment, high-tech equipment, safety gear, professional uniform'
  },
  {
    category: 'plumbing',
    subcategory: 'water-heater',
    basePrompt: 'Technician installing high-efficiency tankless water heater in modern utility room',
    style: 'bright LED lighting, digital display visible, copper connections, professional installation'
  },
  {
    category: 'hvac',
    subcategory: 'ac-installation',
    basePrompt: 'HVAC technician installing premium variable-speed AC unit beside upscale home',
    style: 'golden hour lighting, manicured landscape, professional uniform, modern equipment'
  },
  {
    category: 'hvac',
    subcategory: 'furnace-repair',
    basePrompt: 'HVAC specialist diagnosing high-efficiency furnace with digital multimeter',
    style: 'clean basement, professional lighting, diagnostic tools, modern furnace system'
  },
  {
    category: 'hvac',
    subcategory: 'duct-cleaning',
    basePrompt: 'Professional using advanced duct cleaning system with HEPA filtration',
    style: 'visible clean ducts, professional equipment, protective gear, modern home'
  },
  {
    category: 'cleaning',
    subcategory: 'house-cleaning',
    basePrompt: 'Professional cleaner in branded uniform using eco-friendly products in luxury kitchen',
    style: 'bright natural light, sparkling surfaces, organized cleaning supplies, modern appliances'
  },
  {
    category: 'cleaning',
    subcategory: 'deep-cleaning',
    basePrompt: 'Cleaning team deep cleaning modern living room with professional equipment',
    style: 'bright daylight, visible cleanliness, steam cleaners, organized team'
  },
  {
    category: 'cleaning',
    subcategory: 'carpet-cleaning',
    basePrompt: 'Professional using commercial carpet cleaning machine on luxury wool carpet',
    style: 'visible cleaning results, modern living room, professional equipment'
  },
  {
    category: 'handyman',
    subcategory: 'general-repair',
    basePrompt: 'Professional handyman with organized tool belt fixing cabinet in modern kitchen',
    style: 'natural lighting, quality tools visible, clean workspace, attention to detail'
  },
  {
    category: 'handyman',
    subcategory: 'furniture-assembly',
    basePrompt: 'Handyman assembling designer furniture with precision tools in modern bedroom',
    style: 'bright room, professional tools, instruction manual, quality furniture'
  },
  {
    category: 'handyman',
    subcategory: 'painting',
    basePrompt: 'Professional painter using premium brush on accent wall in modern living room',
    style: 'perfect brush strokes, drop cloths, professional supplies, designer colors'
  },
  {
    category: 'landscaping',
    subcategory: 'lawn-care',
    basePrompt: 'Landscaping professional with commercial mower creating perfect stripes on luxury lawn',
    style: 'golden hour light, manicured grass, professional equipment, upscale property'
  },
  {
    category: 'landscaping',
    subcategory: 'garden-design',
    basePrompt: 'Landscape designer planting premium flowers in professionally designed garden bed',
    style: 'beautiful garden, variety of plants, design plans visible, professional tools'
  },
  {
    category: 'landscaping',
    subcategory: 'tree-service',
    basePrompt: 'Certified arborist in safety gear professionally trimming tree with precision',
    style: 'clear blue sky, safety equipment, professional tools, healthy tree'
  },
  {
    category: 'appliance',
    subcategory: 'refrigerator-repair',
    basePrompt: 'Appliance technician repairing modern smart refrigerator with diagnostic tablet',
    style: 'modern kitchen, digital diagnostics, professional tools, stainless steel appliance'
  },
  {
    category: 'appliance',
    subcategory: 'washer-repair',
    basePrompt: 'Technician servicing high-efficiency front-load washer in modern laundry room',
    style: 'bright lighting, clean environment, diagnostic equipment, professional repair'
  },
  {
    category: 'pest-control',
    subcategory: 'inspection',
    basePrompt: 'Licensed pest control specialist conducting thorough inspection with digital tablet',
    style: 'professional equipment, protective gear, modern home, detailed inspection'
  },
  {
    category: 'pest-control',
    subcategory: 'treatment',
    basePrompt: 'Pest control professional applying eco-friendly treatment in modern home',
    style: 'safety equipment, professional application, clean environment, modern techniques'
  }
];

// Enhance prompt for maximum quality
async function enhancePremiumPrompt(service: typeof PREMIUM_SERVICE_PROMPTS[0]): Promise<string> {
  const enhancementPrompt = `
Create a premium image generation prompt for a high-end home service platform.
This will be used with DALL-E 3 or SDXL for photorealistic results.

Service: ${service.category} - ${service.subcategory}
Base concept: ${service.basePrompt}
Style elements: ${service.style}

Create a detailed, specific prompt that emphasizes:
- Photorealistic quality
- Professional appearance
- High-end residential or commercial setting
- Clean, modern aesthetic
- Subtle incorporation of purple (#7C3AED) or blue (#3B82F6) accents
- Commercial photography quality

Enhanced prompt (150 words max):`;

  try {
    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    // Fallback to constructed prompt
    return `${service.basePrompt}, ${service.style}, hyperrealistic professional photography, commercial quality, 8k resolution, perfect lighting, high-end service photography`;
  }
}

// Generate with best available service
async function generatePremiumImage(
  service: typeof PREMIUM_SERVICE_PROMPTS[0],
  variant: 'hero' | 'thumbnail' | 'card' | 'mobile'
): Promise<Buffer | null> {
  // Enhance the prompt
  const enhancedPrompt = await enhancePremiumPrompt(service);
  console.log('📝 Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
  
  // Try services in order of quality
  const services: PremiumService[] = [
    {
      name: 'DALL-E 3 HD',
      available: !!process.env.OPENAI_API_KEY,
      quality: 10,
      cost: '$0.08/image',
      generate: (p) => generateWithDALLE3(p, variant === 'hero' ? '1792x1024' : '1024x1024')
    },
    {
      name: 'Stability SDXL',
      available: !!process.env.STABILITY_API_KEY,
      quality: 9,
      cost: '$0.04/image',
      generate: generateWithStabilitySDXL
    },
    {
      name: 'Replicate SDXL',
      available: !!process.env.REPLICATE_API_TOKEN,
      quality: 9,
      cost: '$0.02/image',
      generate: generateWithReplicate
    }
  ];
  
  for (const service of services.filter(s => s.available)) {
    console.log(`\n🔄 Trying ${service.name} (Quality: ${service.quality}/10, Cost: ${service.cost})`);
    const buffer = await service.generate(enhancedPrompt);
    if (buffer) return buffer;
  }
  
  return null;
}

// Process and save image
async function processAndSaveImage(
  buffer: Buffer,
  category: string,
  subcategory: string,
  variant: 'hero' | 'thumbnail' | 'card' | 'mobile'
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
  
  const outputPath = path.join(outputDir, `${subcategory}-${variant}.jpg`);
  
  await sharp(buffer)
    .resize(sizes[variant].width, sizes[variant].height, {
      fit: 'cover',
      position: 'center',
      withoutEnlargement: false
    })
    .jpeg({ 
      quality: 90, 
      progressive: true,
      mozjpeg: true 
    })
    .toFile(outputPath);
  
  console.log(`💾 Saved: ${outputPath}`);
}

// Check available premium services
export function checkPremiumServices(): void {
  console.log('\n🎨 Premium Image Generation Services\n');
  
  const services = [
    { 
      name: 'OpenAI DALL-E 3', 
      key: 'OPENAI_API_KEY', 
      url: 'https://platform.openai.com/api-keys',
      pricing: '$0.04-0.08 per image',
      quality: '⭐⭐⭐⭐⭐'
    },
    { 
      name: 'Stability AI SDXL', 
      key: 'STABILITY_API_KEY', 
      url: 'https://platform.stability.ai/account/keys',
      pricing: '$0.04 per image',
      quality: '⭐⭐⭐⭐⭐'
    },
    { 
      name: 'Replicate', 
      key: 'REPLICATE_API_TOKEN', 
      url: 'https://replicate.com/account/api-tokens',
      pricing: '$0.02 per image',
      quality: '⭐⭐⭐⭐'
    }
  ];
  
  console.log('Service Status:\n');
  
  let hasService = false;
  services.forEach(service => {
    const configured = !!process.env[service.key];
    console.log(`${configured ? '✅' : '❌'} ${service.name}`);
    console.log(`   Quality: ${service.quality}`);
    console.log(`   Pricing: ${service.pricing}`);
    if (!configured) {
      console.log(`   Get key: ${service.url}`);
    }
    console.log('');
    if (configured) hasService = true;
  });
  
  if (!hasService) {
    console.log('📋 Quick Setup:');
    console.log('1. Choose a service above');
    console.log('2. Sign up and get an API key');
    console.log('3. Add to .env.local');
    console.log('4. Run: npm run premium:generate');
  }
}

// Main generation function
export async function generateAllPremiumImages(): Promise<void> {
  console.log('🚀 Premium AI Image Generation\n');
  
  checkPremiumServices();
  
  const hasService = process.env.OPENAI_API_KEY || process.env.STABILITY_API_KEY || process.env.REPLICATE_API_TOKEN;
  if (!hasService) {
    console.log('\n❌ No premium service configured!');
    return;
  }
  
  console.log('\n💰 Estimated cost:');
  console.log(`   ${PREMIUM_SERVICE_PROMPTS.length} services × 4 variants = ${PREMIUM_SERVICE_PROMPTS.length * 4} images`);
  console.log(`   Total cost: ~$${(PREMIUM_SERVICE_PROMPTS.length * 4 * 0.04).toFixed(2)} (at $0.04/image avg)\n`);
  
  console.log('⏳ Starting in 5 seconds... (Ctrl+C to cancel)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let success = 0;
  let failed = 0;
  const startTime = Date.now();
  
  for (const service of PREMIUM_SERVICE_PROMPTS) {
    console.log(`\n📸 ${service.category}/${service.subcategory}`);
    
    const variants: Array<'hero' | 'thumbnail' | 'card' | 'mobile'> = ['hero', 'thumbnail', 'card', 'mobile'];
    
    for (const variant of variants) {
      console.log(`\n  Generating ${variant}...`);
      
      const buffer = await generatePremiumImage(service, variant);
      
      if (buffer) {
        await processAndSaveImage(buffer, service.category, service.subcategory, variant);
        success++;
      } else {
        console.log(`  ❌ Failed to generate ${variant}`);
        failed++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  console.log('\n✨ Generation Complete!\n');
  console.log(`⏱️  Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`✅ Success: ${success} images`);
  console.log(`❌ Failed: ${failed} images`);
  console.log(`💰 Estimated cost: $${(success * 0.04).toFixed(2)}`);
  console.log(`📁 Location: shared-assets/images/services/`);
}

// Generate specific service
export async function generateSpecificService(category: string, subcategory: string): Promise<void> {
  const service = PREMIUM_SERVICE_PROMPTS.find(s => 
    s.category === category && s.subcategory === subcategory
  );
  
  if (!service) {
    console.error(`Service not found: ${category}/${subcategory}`);
    return;
  }
  
  console.log(`\n📸 Generating premium images for ${category}/${subcategory}\n`);
  
  const variants: Array<'hero' | 'thumbnail' | 'card' | 'mobile'> = ['hero', 'thumbnail', 'card', 'mobile'];
  
  for (const variant of variants) {
    console.log(`Generating ${variant}...`);
    const buffer = await generatePremiumImage(service, variant);
    
    if (buffer) {
      await processAndSaveImage(buffer, service.category, service.subcategory, variant);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// Export functions
export { enhancePremiumPrompt };