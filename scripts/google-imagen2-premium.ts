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

// Premium service configurations for Imagen 2
const IMAGEN2_SERVICES = [
  {
    category: 'electrical',
    subcategory: 'outlet-installation',
    prompt: 'Professional electrician in crisp navy blue uniform installing modern white USB-C outlet in luxury home, tools perfectly organized on belt, natural sunlight streaming through window, marble wall background, commercial photography style, hyperrealistic detail',
    aspectRatio: '16:9'
  },
  {
    category: 'electrical',
    subcategory: 'panel-upgrade',
    prompt: 'Licensed master electrician working on state-of-the-art 200-amp electrical panel with smart circuit breakers, wearing safety glasses, professional garage workshop, LED work lights, tools laid out systematically, photorealistic commercial quality',
    aspectRatio: '16:9'
  },
  {
    category: 'electrical',
    subcategory: 'lighting-installation',
    prompt: 'Professional electrician on sturdy ladder installing designer recessed LED lights in high-end living room ceiling, modern furniture visible below, warm ambient lighting, precision work, commercial photography',
    aspectRatio: '16:9'
  },
  {
    category: 'electrical',
    subcategory: 'smart-home',
    prompt: 'Smart home technician in professional attire programming elegant touchscreen control panel, modern home automation interface visible, subtle purple LED accent lighting, tablet showing system diagnostics, ultra-realistic',
    aspectRatio: '4:3'
  },
  {
    category: 'plumbing',
    subcategory: 'faucet-repair',
    prompt: 'Expert plumber in clean uniform installing premium chrome waterfall faucet in luxury marble bathroom, professional pipe wrench and tools visible, natural window light creating reflections, water droplets on chrome, commercial quality photography',
    aspectRatio: '16:9'
  },
  {
    category: 'plumbing',
    subcategory: 'pipe-installation',
    prompt: 'Professional plumber installing gleaming copper pipes under modern vanity, LED headlamp illuminating work area, precision soldering, organized tool bag, clean installation, photorealistic detail',
    aspectRatio: '16:9'
  },
  {
    category: 'plumbing',
    subcategory: 'drain-cleaning',
    prompt: 'Licensed plumber using state-of-the-art hydro-jetting equipment in pristine modern bathroom, safety goggles, professional uniform with company logo, high-tech drain camera visible, commercial photography',
    aspectRatio: '16:9'
  },
  {
    category: 'plumbing',
    subcategory: 'water-heater',
    prompt: 'Certified technician installing premium tankless water heater on wall, digital temperature display glowing, copper pipe connections perfect, modern utility room, professional installation, hyperrealistic',
    aspectRatio: '4:3'
  },
  {
    category: 'hvac',
    subcategory: 'ac-installation',
    prompt: 'HVAC technician in professional uniform installing high-efficiency variable-speed air conditioner outside luxury home, digital gauges, refrigerant tanks, manicured landscape, golden hour lighting, commercial quality',
    aspectRatio: '16:9'
  },
  {
    category: 'hvac',
    subcategory: 'furnace-repair',
    prompt: 'HVAC specialist with digital diagnostic tablet analyzing modern high-efficiency furnace, clean basement setting, LED work lights, multimeter readings visible, professional tools, photorealistic',
    aspectRatio: '16:9'
  },
  {
    category: 'hvac',
    subcategory: 'duct-cleaning',
    prompt: 'Professional technician operating advanced duct cleaning system with HEPA filtration, visible clean air ducts, protective equipment, modern home interior, commercial photography quality',
    aspectRatio: '16:9'
  },
  {
    category: 'cleaning',
    subcategory: 'house-cleaning',
    prompt: 'Professional cleaner in branded uniform using eco-friendly products in luxury modern kitchen, microfiber cloths, organized cleaning caddy, sparkling clean surfaces, natural light, commercial photography',
    aspectRatio: '16:9'
  },
  {
    category: 'cleaning',
    subcategory: 'deep-cleaning',
    prompt: 'Professional cleaning team deep cleaning elegant living room, steam cleaners, HEPA vacuums, color-coded microfiber system, visible cleanliness transformation, bright natural light, hyperrealistic',
    aspectRatio: '16:9'
  },
  {
    category: 'cleaning',
    subcategory: 'carpet-cleaning',
    prompt: 'Carpet cleaning specialist using commercial-grade extraction machine on luxury carpet, visible clean path, professional technique, modern living room setting, dramatic before/after effect',
    aspectRatio: '16:9'
  },
  {
    category: 'handyman',
    subcategory: 'general-repair',
    prompt: 'Professional handyman with premium tool belt repairing cabinet hardware in modern kitchen, precision screwdriver work, organized tools, focused concentration, commercial photography lighting',
    aspectRatio: '4:3'
  },
  {
    category: 'handyman',
    subcategory: 'furniture-assembly',
    prompt: 'Skilled handyman assembling designer furniture with professional tools, instruction manual visible, modern bedroom, quality craftsmanship evident, perfect alignment, photorealistic detail',
    aspectRatio: '16:9'
  },
  {
    category: 'handyman',
    subcategory: 'painting',
    prompt: 'Professional painter with premium brush applying designer paint to accent wall, perfect brush strokes, paint can with custom color, drop cloths protecting floor, modern interior, commercial quality',
    aspectRatio: '16:9'
  },
  {
    category: 'landscaping',
    subcategory: 'lawn-care',
    prompt: 'Professional landscaper operating commercial zero-turn mower creating perfect stripes on luxury estate lawn, golden hour sunlight, manicured hedges in background, hyperrealistic photography',
    aspectRatio: '16:9'
  },
  {
    category: 'landscaping',
    subcategory: 'garden-design',
    prompt: 'Landscape designer planting colorful flowers in professionally designed garden bed, landscape plan visible, variety of premium plants, mulch and decorative stones, beautiful composition',
    aspectRatio: '16:9'
  },
  {
    category: 'landscaping',
    subcategory: 'tree-service',
    prompt: 'Certified arborist in full safety gear using professional chainsaw to precisely trim large tree, safety ropes visible, wood chips flying, blue sky background, action photography',
    aspectRatio: '16:9'
  },
  {
    category: 'appliance',
    subcategory: 'refrigerator-repair',
    prompt: 'Appliance technician with digital diagnostic tablet repairing modern smart refrigerator, internal components visible, LED lighting, stainless steel finish, professional tools, kitchen setting',
    aspectRatio: '4:3'
  },
  {
    category: 'appliance',
    subcategory: 'washer-repair',
    prompt: 'Professional technician servicing high-efficiency front-load washer, diagnostic equipment connected, modern laundry room, tools organized on mat, commercial photography lighting',
    aspectRatio: '4:3'
  },
  {
    category: 'pest-control',
    subcategory: 'inspection',
    prompt: 'Licensed pest control specialist with digital tablet conducting detailed inspection, UV flashlight, professional equipment vest, modern home interior, documenting findings, photorealistic',
    aspectRatio: '16:9'
  },
  {
    category: 'pest-control',
    subcategory: 'treatment',
    prompt: 'Pest control professional in protective gear applying eco-friendly treatment using precision equipment, safety protocols visible, modern home exterior, professional technique',
    aspectRatio: '16:9'
  }
];

// Generate image using Google Imagen 2
async function generateWithImagen2(prompt: string, aspectRatio: string = '16:9'): Promise<Buffer | null> {
  try {
    // Get access token
    const { stdout: token } = await execAsync('gcloud auth print-access-token');
    const accessToken = token.trim();
    
    // Imagen 2 endpoint (latest model)
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;
    
    const requestBody = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        // Imagen 2 specific parameters for highest quality
        addWatermark: false,
        safetySetting: 'block_some',
        personGeneration: 'dont_allow',
        includeSafetyAttributes: false,
        includeRaiReason: false,
        seed: Math.floor(Math.random() * 1000000),
        // Negative prompt for highest quality
        negativePrompt: 'cartoon, illustration, anime, drawing, sketch, painting, blurry, low quality, distorted, disfigured, amateur, watermark, logo, text, oversaturated'
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

// Enhance prompt specifically for Imagen 2
async function enhanceForImagen2(basePrompt: string): Promise<string> {
  const enhancementPrompt = `
You are optimizing a prompt for Google's Imagen 2, their highest quality image generation model.

Original prompt: ${basePrompt}

Enhance this prompt following Imagen 2's best practices:
- Be specific about lighting, composition, and camera settings
- Include "commercial photography" or "professional photography" 
- Specify materials, textures, and environmental details
- Add subtle brand colors: purple (#7C3AED) or blue (#3B82F6) as accent lighting or in uniforms
- Emphasize photorealistic quality
- Keep under 200 words

Enhanced prompt:`;

  try {
    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    return basePrompt + ', professional commercial photography, photorealistic, high quality, perfect lighting';
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
        position: 'attention', // Smart cropping
        withoutEnlargement: false
      })
      .jpeg({ 
        quality: 95, // Higher quality for premium
        progressive: true,
        mozjpeg: true,
        chromaSubsampling: '4:4:4' // Best color quality
      })
      .toFile(outputPath);
    
    console.log(`  ✅ ${variant} (${dimensions.width}x${dimensions.height})`);
  }
}

// Main generation function
export async function generateGooglePremiumImages(): Promise<void> {
  console.log('🎨 Google Imagen 2 Premium Image Generation\n');
  console.log('Using Google\'s highest quality image generation model\n');
  
  // Check gcloud auth
  try {
    const { stdout } = await execAsync('gcloud config get-value account');
    console.log(`✅ Authenticated as: ${stdout.trim()}`);
  } catch (error) {
    console.error('❌ Not authenticated. Run: gcloud auth application-default login');
    return;
  }
  
  const totalImages = IMAGEN2_SERVICES.length;
  console.log(`📊 Will generate: ${totalImages} services (${totalImages * 4} total images)`);
  console.log('💰 Cost: Imagen 2 pricing applies (see Google Cloud Console)\n');
  
  console.log('⏳ Starting in 5 seconds... (Ctrl+C to cancel)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let success = 0;
  let failed = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < IMAGEN2_SERVICES.length; i++) {
    const service = IMAGEN2_SERVICES[i];
    console.log(`\n[${i + 1}/${totalImages}] 📸 ${service.category}/${service.subcategory}`);
    
    // Enhance the prompt
    const enhancedPrompt = await enhanceForImagen2(service.prompt);
    console.log('📝 Enhanced prompt:', enhancedPrompt.substring(0, 80) + '...');
    
    // Generate the image
    const imageBuffer = await generateWithImagen2(enhancedPrompt, service.aspectRatio);
    
    if (imageBuffer) {
      await generateAllVariants(imageBuffer, service.category, service.subcategory);
      success++;
    } else {
      console.log('  ❌ Generation failed');
      failed++;
    }
    
    // Rate limiting - Imagen 2 has quotas
    if (i < IMAGEN2_SERVICES.length - 1) {
      console.log('  ⏳ Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  
  console.log('\n✨ Generation Complete!\n');
  console.log(`⏱️  Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`✅ Success: ${success} services (${success * 4} images)`);
  console.log(`❌ Failed: ${failed} services`);
  console.log(`📁 Location: shared-assets/images/services/`);
  console.log(`\n🌟 Using Google Imagen 2 - Highest Quality Available`);
}

// Generate specific service
export async function generateSpecificImagen2(category: string, subcategory: string): Promise<void> {
  const service = IMAGEN2_SERVICES.find(s => 
    s.category === category && s.subcategory === subcategory
  );
  
  if (!service) {
    console.error(`Service not found: ${category}/${subcategory}`);
    return;
  }
  
  console.log(`\n📸 Generating with Imagen 2: ${category}/${subcategory}\n`);
  
  const enhancedPrompt = await enhanceForImagen2(service.prompt);
  const imageBuffer = await generateWithImagen2(enhancedPrompt, service.aspectRatio);
  
  if (imageBuffer) {
    await generateAllVariants(imageBuffer, category, subcategory);
    console.log('\n✅ All variants generated successfully!');
  }
}

// Check Imagen 2 availability
export async function checkImagen2Setup(): Promise<void> {
  console.log('🔍 Checking Google Imagen 2 Setup\n');
  
  try {
    // Check authentication
    const { stdout: account } = await execAsync('gcloud config get-value account');
    console.log(`✅ Authenticated as: ${account.trim()}`);
    
    // Check project
    const { stdout: project } = await execAsync('gcloud config get-value project');
    console.log(`✅ Project: ${project.trim()}`);
    
    // Check if Vertex AI is enabled
    const { stdout: apis } = await execAsync('gcloud services list --enabled --filter="aiplatform" --format="value(name)"');
    if (apis.includes('aiplatform')) {
      console.log('✅ Vertex AI API is enabled');
    } else {
      console.log('❌ Vertex AI API not enabled');
      console.log('\nEnable it with:');
      console.log(`gcloud services enable aiplatform.googleapis.com`);
    }
    
    console.log('\n📋 Imagen 2 Features:');
    console.log('- Highest quality photorealistic images');
    console.log('- Advanced understanding of complex prompts');
    console.log('- Multiple aspect ratios (16:9, 4:3, 1:1)');
    console.log('- No watermarks');
    console.log('- Commercial use allowed');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
    console.log('\nSetup instructions:');
    console.log('1. Install gcloud CLI');
    console.log('2. Run: gcloud init');
    console.log('3. Run: gcloud auth application-default login');
    console.log('4. Enable Vertex AI in Cloud Console');
  }
}