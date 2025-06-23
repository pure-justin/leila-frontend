import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Google Cloud configuration
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'leila-platform';
const LOCATION = 'us-central1';

// Initialize Google Auth
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

interface ImageGenerationRequest {
  instances: Array<{
    prompt: string;
  }>;
  parameters: {
    sampleCount: number;
    aspectRatio?: string;
    negativePrompt?: string;
  };
}

// Generate image using Vertex AI Imagen
export async function generateWithVertexAI(prompt: string, aspectRatio: string = '1:1'): Promise<Buffer | null> {
  try {
    console.log('🔄 Attempting to use Vertex AI Imagen...');
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      console.error('❌ Failed to get access token');
      return null;
    }

    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration:predict`;
    
    const requestBody: ImageGenerationRequest = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        negativePrompt: 'cartoon, illustration, low quality, blurry, watermark, text, logo'
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Vertex AI error:', error);
      return null;
    }

    const result = await response.json();
    
    if (result.predictions && result.predictions[0] && result.predictions[0].bytesBase64Encoded) {
      console.log('✅ Image generated successfully with Vertex AI');
      return Buffer.from(result.predictions[0].bytesBase64Encoded, 'base64');
    }

    return null;
  } catch (error) {
    console.error('❌ Vertex AI error:', error);
    return null;
  }
}

// Alternative: Use free image generation service (Hugging Face)
export async function generateWithHuggingFace(prompt: string): Promise<Buffer | null> {
  const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
  
  if (!HF_TOKEN) {
    console.log('⚠️  Hugging Face token not found');
    return null;
  }

  try {
    console.log('🔄 Using Hugging Face Stable Diffusion...');
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt + ", professional photography, high quality, 8k resolution",
          parameters: {
            negative_prompt: "cartoon, illustration, low quality, blurry",
            guidance_scale: 7.5,
            num_inference_steps: 50
          }
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Hugging Face error:', error);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('✅ Image generated successfully with Hugging Face');
    return buffer;

  } catch (error) {
    console.error('❌ Hugging Face error:', error);
    return null;
  }
}

// Free option: Generate using local patterns (creates professional looking gradients)
export async function generateProfessionalPlaceholder(
  category: string,
  subcategory: string,
  variant: 'hero' | 'thumbnail' | 'card' | 'mobile'
): Promise<Buffer> {
  const sizes = {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  };

  const size = sizes[variant];
  
  // Create a more sophisticated SVG with patterns and effects
  const svg = `
    <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Main gradient -->
        <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#5B21B6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
        
        <!-- Overlay pattern -->
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/>
        </pattern>
        
        <!-- Noise texture -->
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" seed="5" />
          <feColorMatrix type="saturate" values="0"/>
          <feBlend mode="multiply" />
        </filter>
        
        <!-- Drop shadow -->
        <filter id="shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="20" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="${size.width}" height="${size.height}" fill="url(#mainGrad)"/>
      <rect width="${size.width}" height="${size.height}" fill="url(#grid)"/>
      <rect width="${size.width}" height="${size.height}" fill="white" opacity="0.02" style="filter:url(#noise)"/>
      
      <!-- Service icon area -->
      <circle cx="${size.width/2}" cy="${size.height/2 - 20}" r="80" fill="white" opacity="0.1" style="filter:url(#shadow)"/>
      
      <!-- Text -->
      <text x="50%" y="45%" font-family="system-ui, -apple-system, sans-serif" font-size="${size.width > 800 ? 48 : 32}" fill="white" text-anchor="middle" font-weight="700" style="filter:url(#shadow)">
        ${category.toUpperCase()}
      </text>
      <text x="50%" y="55%" font-family="system-ui, -apple-system, sans-serif" font-size="${size.width > 800 ? 24 : 18}" fill="white" text-anchor="middle" font-weight="400" opacity="0.9">
        ${subcategory.replace(/-/g, ' ')}
      </text>
      
      <!-- Leila branding -->
      <text x="${size.width - 20}" y="${size.height - 20}" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="white" text-anchor="end" opacity="0.5">
        Leila Pro
      </text>
    </svg>
  `;

  return await sharp(Buffer.from(svg))
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();
}

// Main generation function with fallbacks
export async function generateServiceImageWithFallbacks(
  category: string,
  subcategory: string,
  variant: 'hero' | 'thumbnail' | 'card' | 'mobile',
  prompt: string
): Promise<Buffer> {
  // Try Vertex AI first (if Firebase project has it enabled)
  let buffer = await generateWithVertexAI(prompt, variant === 'hero' ? '16:9' : '1:1');
  
  // Try Hugging Face as fallback
  if (!buffer) {
    buffer = await generateWithHuggingFace(prompt);
  }
  
  // Use professional placeholder as final fallback
  if (!buffer) {
    console.log('⚠️  Using professional placeholder (no API available)');
    buffer = await generateProfessionalPlaceholder(category, subcategory, variant);
  }
  
  return buffer;
}

// Check available services
export function checkVertexAIAvailability(): void {
  console.log('\n🔍 Checking Vertex AI and free alternatives:\n');
  
  console.log(`${PROJECT_ID ? '✅' : '❌'} Firebase Project ID: ${PROJECT_ID || 'Not found'}`);
  console.log(`${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅' : '⚠️'} Google Application Credentials: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Set' : 'Using default'}`);
  console.log(`${process.env.HUGGINGFACE_TOKEN ? '✅' : '❌'} Hugging Face Token: ${process.env.HUGGINGFACE_TOKEN ? 'Available' : 'Not configured'}`);
  
  console.log('\n📋 Options:');
  console.log('1. Enable Vertex AI in your Google Cloud project');
  console.log('2. Get a free Hugging Face token at https://huggingface.co/settings/tokens');
  console.log('3. Use professional placeholders (no API needed)');
}