import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Gemini for prompt enhancement
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Image generation service options
interface ImageGenerationService {
  name: string;
  generateImage: (prompt: string) => Promise<Buffer | null>;
  available: boolean;
}

// Option 1: Replicate (Stable Diffusion)
async function generateWithReplicate(prompt: string): Promise<Buffer | null> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    console.log('⚠️  Replicate API token not found');
    return null;
  }

  try {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf', // Stable Diffusion v2.1
        input: {
          prompt: prompt + ', professional photography, 8k resolution, high quality',
          negative_prompt: 'cartoon, illustration, low quality, blurry, watermark',
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
        }
      })
    });

    const prediction = await response.json();
    
    // Poll for completion
    let output = null;
    while (!output) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      });
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        output = status.output[0];
      } else if (status.status === 'failed') {
        throw new Error('Image generation failed');
      }
    }

    // Download the image
    const imageResponse = await fetch(output);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;

  } catch (error) {
    console.error('Replicate error:', error);
    return null;
  }
}

// Option 2: OpenAI DALL-E 3
async function generateWithDallE(prompt: string): Promise<Buffer | null> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.log('⚠️  OpenAI API key not found');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      })
    });

    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].url) {
      const imageResponse = await fetch(data.data[0].url);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    }

    return null;
  } catch (error) {
    console.error('DALL-E error:', error);
    return null;
  }
}

// Option 3: Stability AI
async function generateWithStabilityAI(prompt: string): Promise<Buffer | null> {
  const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
  
  if (!STABILITY_API_KEY) {
    console.log('⚠️  Stability AI API key not found');
    return null;
  }

  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: 'blurry, bad quality, cartoon, illustration, watermark',
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 50,
      })
    });

    const data = await response.json();
    if (data.artifacts && data.artifacts[0]) {
      const imageData = data.artifacts[0].base64;
      return Buffer.from(imageData, 'base64');
    }

    return null;
  } catch (error) {
    console.error('Stability AI error:', error);
    return null;
  }
}

// Enhanced prompt using Gemini
async function enhancePrompt(basePrompt: string): Promise<string> {
  try {
    const enhancementPrompt = `
Enhance this image generation prompt for a professional home service platform.
Add specific details about lighting, composition, and professional quality.
Keep the Leila brand colors (purple #7C3AED and blue #3B82F6) in mind.
Make it photorealistic and professional.

Original prompt: ${basePrompt}

Enhanced prompt (keep under 200 words):`;

    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return basePrompt; // Return original if enhancement fails
  }
}

// Main generation function
export async function generateServiceImage(
  serviceCategory: string,
  serviceSubcategory: string,
  variant: 'hero' | 'thumbnail' | 'card' | 'mobile',
  basePrompt: string
): Promise<boolean> {
  console.log(`\n🎨 Generating ${variant} image for ${serviceCategory}/${serviceSubcategory}`);
  
  // Enhance the prompt
  const enhancedPrompt = await enhancePrompt(basePrompt);
  console.log('📝 Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');

  // Try each service in order
  const services: ImageGenerationService[] = [
    {
      name: 'Replicate (Stable Diffusion)',
      generateImage: generateWithReplicate,
      available: !!process.env.REPLICATE_API_TOKEN
    },
    {
      name: 'OpenAI DALL-E 3',
      generateImage: generateWithDallE,
      available: !!process.env.OPENAI_API_KEY
    },
    {
      name: 'Stability AI',
      generateImage: generateWithStabilityAI,
      available: !!process.env.STABILITY_API_KEY
    }
  ];

  let imageBuffer: Buffer | null = null;
  
  for (const service of services) {
    if (service.available) {
      console.log(`🔄 Trying ${service.name}...`);
      imageBuffer = await service.generateImage(enhancedPrompt);
      if (imageBuffer) {
        console.log(`✅ Successfully generated with ${service.name}`);
        break;
      }
    }
  }

  if (!imageBuffer) {
    console.log('❌ No image generation service available or all failed');
    return false;
  }

  // Define sizes for each variant
  const sizes = {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  };

  // Process and save the image
  const outputDir = path.join(__dirname, '../../shared-assets/images/services', serviceCategory);
  const outputPath = path.join(outputDir, `${serviceSubcategory}-${variant}.jpg`);

  try {
    await sharp(imageBuffer)
      .resize(sizes[variant].width, sizes[variant].height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);

    console.log(`💾 Saved to: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('Image processing error:', error);
    return false;
  }
}

// Check available services
export function checkAvailableServices(): void {
  console.log('\n🔍 Checking available image generation services:\n');
  
  const services = [
    { name: 'Replicate (Stable Diffusion)', key: 'REPLICATE_API_TOKEN' },
    { name: 'OpenAI DALL-E 3', key: 'OPENAI_API_KEY' },
    { name: 'Stability AI', key: 'STABILITY_API_KEY' },
  ];

  let hasService = false;
  
  services.forEach(service => {
    const available = !!process.env[service.key];
    console.log(`${available ? '✅' : '❌'} ${service.name}: ${available ? 'Available' : 'Not configured'}`);
    if (available) hasService = true;
  });

  if (!hasService) {
    console.log('\n⚠️  No image generation services configured!');
    console.log('\nTo configure a service, add one of these to your .env.local:');
    console.log('- REPLICATE_API_TOKEN (https://replicate.com)');
    console.log('- OPENAI_API_KEY (https://platform.openai.com)');
    console.log('- STABILITY_API_KEY (https://stability.ai)');
  }
}

// Export for use in generation script
export { enhancePrompt };