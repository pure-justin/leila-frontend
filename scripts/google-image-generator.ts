import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  // For local development, we'll use the default credentials
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

// Initialize Gemini for prompt generation
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Google Cloud project info
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'leila-platform';
const LOCATION = 'us-central1';

interface VertexAIImageRequest {
  instances: Array<{
    prompt: string;
  }>;
  parameters: {
    sampleCount: number;
    aspectRatio?: string;
    negativePrompt?: string;
    seed?: number;
  };
}

// Get access token using gcloud CLI
async function getAccessToken(): Promise<string | null> {
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout } = await execAsync('gcloud auth print-access-token');
    return stdout.trim();
  } catch (error) {
    console.error('❌ Failed to get access token. Make sure gcloud is installed and authenticated.');
    console.log('Run: gcloud auth application-default login');
    return null;
  }
}

// Generate image using Vertex AI Imagen 2
export async function generateWithVertexAI(
  prompt: string,
  aspectRatio: string = '1:1'
): Promise<Buffer | null> {
  try {
    console.log('🔄 Generating with Google Vertex AI Imagen 2...');
    
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return null;
    }

    // Vertex AI Imagen 2 endpoint
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;
    
    const requestBody: VertexAIImageRequest = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        negativePrompt: 'cartoon, illustration, anime, blurry, low quality, watermark, text, logo, amateur',
        seed: Math.floor(Math.random() * 1000000)
      }
    };

    console.log('📤 Sending request to Vertex AI...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vertex AI error:', errorText);
      
      if (response.status === 404) {
        console.log('\n⚠️  Imagen API might not be enabled. Please:');
        console.log('1. Go to https://console.cloud.google.com/vertex-ai');
        console.log('2. Enable the Vertex AI API');
        console.log('3. Enable Imagen (image generation) in your project');
      }
      
      return null;
    }

    const result = await response.json();
    
    if (result.predictions && result.predictions[0] && result.predictions[0].bytesBase64Encoded) {
      console.log('✅ Image generated successfully!');
      return Buffer.from(result.predictions[0].bytesBase64Encoded, 'base64');
    }

    console.error('❌ No image data in response');
    return null;

  } catch (error) {
    console.error('❌ Vertex AI error:', error);
    return null;
  }
}

// Enhance prompts using Gemini
export async function enhancePromptWithGemini(basePrompt: string): Promise<string> {
  try {
    const enhancementPrompt = `
You are a professional prompt engineer for Google's Imagen 2 AI image generator.
Enhance this prompt for a home service platform to create photorealistic, professional service images.

Requirements:
- Photorealistic, professional photography style
- Include specific details about lighting, composition, and environment
- Emphasize cleanliness, professionalism, and modern equipment
- Include subtle purple (#7C3AED) and blue (#3B82F6) brand color accents in the scene
- Focus on trustworthiness and high-quality service

Original prompt: ${basePrompt}

Enhanced prompt (keep under 150 words, be very specific):`;

    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    const enhancedPrompt = response.text().trim();
    
    console.log('✨ Enhanced prompt:', enhancedPrompt.substring(0, 100) + '...');
    return enhancedPrompt;
    
  } catch (error) {
    console.error('Prompt enhancement error:', error);
    return basePrompt;
  }
}

// Upload image to Firebase Storage
export async function uploadToFirebaseStorage(
  buffer: Buffer,
  category: string,
  subcategory: string,
  variant: string
): Promise<string> {
  try {
    const bucket = getStorage().bucket();
    const fileName = `services/${category}/${subcategory}-${variant}.jpg`;
    const file = bucket.file(fileName);
    
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000',
      }
    });
    
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log('☁️  Uploaded to:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Service configurations
const GOOGLE_OPTIMIZED_PROMPTS = [
  {
    category: 'electrical',
    subcategory: 'outlet-installation',
    prompts: {
      hero: 'Professional electrician in clean uniform installing modern white USB outlet in luxury home, bright natural lighting, tools neatly arranged, shallow depth of field',
      thumbnail: 'Close-up of electrician hands installing USB outlet with voltage tester, professional tools, bright lighting',
      card: 'Modern electrical outlet with USB ports freshly installed in wall, professional quality',
      mobile: 'Electrician working on outlet installation, clean and professional'
    }
  },
  {
    category: 'plumbing',
    subcategory: 'faucet-repair',
    prompts: {
      hero: 'Professional plumber installing chrome faucet in modern kitchen with marble countertops, natural window light, high-end tools visible',
      thumbnail: 'Plumber hands working on luxury faucet with professional wrench, water droplets visible',
      card: 'Shiny new kitchen faucet professionally installed, modern design',
      mobile: 'Plumber fixing faucet in bright kitchen'
    }
  },
  {
    category: 'hvac',
    subcategory: 'ac-installation',
    prompts: {
      hero: 'HVAC technician installing modern air conditioning unit outside suburban home, blue sky, professional equipment',
      thumbnail: 'HVAC professional with digital tablet checking new AC unit diagnostics',
      card: 'New energy-efficient AC unit professionally mounted on house',
      mobile: 'AC technician at work with modern equipment'
    }
  },
  {
    category: 'cleaning',
    subcategory: 'house-cleaning',
    prompts: {
      hero: 'Professional cleaner in branded uniform cleaning modern living room, eco-friendly products, bright sunlight through windows',
      thumbnail: 'Cleaner detailing kitchen counter with microfiber cloth and green cleaning products',
      card: 'Spotlessly clean modern home interior, professional cleaning visible',
      mobile: 'Professional house cleaner at work'
    }
  }
];

// Generate a single image
export async function generateServiceImage(
  category: string,
  subcategory: string,
  variant: 'hero' | 'thumbnail' | 'card' | 'mobile',
  basePrompt: string
): Promise<boolean> {
  console.log(`\n🎨 Generating ${variant} for ${category}/${subcategory}`);
  
  // Enhance the prompt
  const enhancedPrompt = await enhancePromptWithGemini(basePrompt);
  
  // Set aspect ratio based on variant
  const aspectRatios = {
    hero: '16:9',
    thumbnail: '1:1',
    card: '4:3',
    mobile: '16:9'
  };
  
  // Generate image
  const imageBuffer = await generateWithVertexAI(enhancedPrompt, aspectRatios[variant]);
  
  if (!imageBuffer) {
    console.log('❌ Failed to generate image');
    return false;
  }
  
  // Define sizes
  const sizes = {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  };
  
  // Process and save locally
  const outputDir = path.join(__dirname, '../../shared-assets/images/services', category);
  const outputPath = path.join(outputDir, `${subcategory}-${variant}.jpg`);
  
  try {
    const processedBuffer = await sharp(imageBuffer)
      .resize(sizes[variant].width, sizes[variant].height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    
    // Save locally
    await sharp(processedBuffer).toFile(outputPath);
    console.log('💾 Saved locally:', outputPath);
    
    // Upload to Firebase Storage
    await uploadToFirebaseStorage(processedBuffer, category, subcategory, variant);
    
    return true;
  } catch (error) {
    console.error('Processing error:', error);
    return false;
  }
}

// Check Google Cloud setup
export async function checkGoogleSetup(): Promise<boolean> {
  console.log('\n🔍 Checking Google Cloud setup:\n');
  
  console.log(`Project ID: ${PROJECT_ID}`);
  console.log(`Location: ${LOCATION}`);
  
  // Check gcloud CLI
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    const { stdout: account } = await execAsync('gcloud config get-value account');
    console.log(`✅ Authenticated as: ${account.trim()}`);
    
    const { stdout: project } = await execAsync('gcloud config get-value project');
    console.log(`✅ Current project: ${project.trim()}`);
    
    if (project.trim() !== PROJECT_ID) {
      console.log(`\n⚠️  Project mismatch! Set correct project:`);
      console.log(`   gcloud config set project ${PROJECT_ID}`);
    }
    
    return true;
  } catch (error) {
    console.log('\n❌ Google Cloud CLI not configured!');
    console.log('\n📋 Setup instructions:');
    console.log('1. Install gcloud CLI: https://cloud.google.com/sdk/install');
    console.log('2. Run: gcloud init');
    console.log('3. Run: gcloud auth application-default login');
    console.log(`4. Run: gcloud config set project ${PROJECT_ID}`);
    console.log('5. Enable Vertex AI API: https://console.cloud.google.com/vertex-ai');
    
    return false;
  }
}

// Main generation function
export async function generateAllGoogleImages(): Promise<void> {
  console.log('🚀 Google Vertex AI Image Generation\n');
  
  const isSetup = await checkGoogleSetup();
  if (!isSetup) {
    return;
  }
  
  console.log('\n⏳ Starting generation in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let success = 0;
  let failed = 0;
  
  for (const config of GOOGLE_OPTIMIZED_PROMPTS) {
    for (const [variant, prompt] of Object.entries(config.prompts)) {
      const result = await generateServiceImage(
        config.category,
        config.subcategory,
        variant as any,
        prompt
      );
      
      if (result) {
        success++;
      } else {
        failed++;
      }
      
      // Rate limiting - Vertex AI has quotas
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n✨ Generation complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}