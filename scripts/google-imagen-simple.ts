import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const PROJECT_ID = 'leila-platform';
const LOCATION = 'us-central1';

// Service prompts optimized for Imagen
const SERVICES_TO_GENERATE = [
  {
    category: 'electrical',
    subcategory: 'outlet-installation',
    prompt: 'Professional electrician in navy blue uniform installing white electrical outlet with USB ports in modern home, bright natural lighting, tools organized, photorealistic'
  },
  {
    category: 'plumbing',
    subcategory: 'faucet-repair',
    prompt: 'Professional plumber installing chrome kitchen faucet in luxury kitchen with marble countertops, natural window light, professional tools visible, photorealistic'
  },
  {
    category: 'hvac',
    subcategory: 'ac-installation',
    prompt: 'HVAC technician in professional uniform installing modern white air conditioning unit on house exterior, blue sky background, ladder and tools visible, photorealistic'
  },
  {
    category: 'cleaning',
    subcategory: 'house-cleaning',
    prompt: 'Professional house cleaner in uniform using eco-friendly products to clean modern living room, bright sunlight through windows, cleaning supplies visible, photorealistic'
  }
];

async function generateWithCurl(prompt: string, outputFile: string): Promise<boolean> {
  try {
    // Get access token
    const { stdout: token } = await execAsync('gcloud auth print-access-token');
    const accessToken = token.trim();
    
    // Prepare the request
    const requestBody = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        negativePrompt: 'cartoon, illustration, low quality, blurry'
      }
    };
    
    // Create temp file for request body
    const tempFile = path.join(__dirname, 'temp-request.json');
    fs.writeFileSync(tempFile, JSON.stringify(requestBody));
    
    // Vertex AI endpoint
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagegeneration@006:predict`;
    
    console.log('📤 Sending request to Vertex AI...');
    
    // Execute curl command
    const curlCommand = `curl -X POST \
      -H "Authorization: Bearer ${accessToken}" \
      -H "Content-Type: application/json" \
      -d @${tempFile} \
      "${endpoint}"`;
    
    const { stdout: response } = await execAsync(curlCommand);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    // Parse response
    const result = JSON.parse(response);
    
    if (result.predictions && result.predictions[0] && result.predictions[0].bytesBase64Encoded) {
      // Decode and save image
      const imageBuffer = Buffer.from(result.predictions[0].bytesBase64Encoded, 'base64');
      fs.writeFileSync(outputFile, imageBuffer);
      console.log('✅ Image generated successfully!');
      return true;
    } else if (result.error) {
      console.error('❌ API Error:', result.error.message);
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Generation error:', error);
    return false;
  }
}

async function checkVertexAIEnabled(): Promise<boolean> {
  try {
    console.log('\n🔍 Checking Vertex AI status...\n');
    
    // Check if API is enabled
    const { stdout } = await execAsync(`gcloud services list --enabled --filter="name:aiplatform.googleapis.com" --format="value(name)"`);
    
    if (stdout.trim() === 'aiplatform.googleapis.com') {
      console.log('✅ Vertex AI API is enabled');
      return true;
    } else {
      console.log('❌ Vertex AI API is not enabled');
      console.log('\nTo enable it, run:');
      console.log(`gcloud services enable aiplatform.googleapis.com --project=${PROJECT_ID}`);
      console.log('\nOr visit:');
      console.log('https://console.cloud.google.com/vertex-ai');
      return false;
    }
  } catch (error) {
    console.error('Error checking API status:', error);
    return false;
  }
}

async function generateAllImages(): Promise<void> {
  console.log('🎨 Google Vertex AI Image Generation (Simple)\n');
  
  // Check if Vertex AI is enabled
  const isEnabled = await checkVertexAIEnabled();
  if (!isEnabled) {
    console.log('\n💡 First, enable the Vertex AI API using the command above.');
    return;
  }
  
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  
  console.log('\n📸 Generating images...\n');
  
  for (const service of SERVICES_TO_GENERATE) {
    const categoryDir = path.join(baseDir, service.category);
    
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    console.log(`\n🔧 ${service.category}/${service.subcategory}`);
    
    // Generate hero image
    const outputFile = path.join(categoryDir, `${service.subcategory}-hero-ai.jpg`);
    const success = await generateWithCurl(service.prompt, outputFile);
    
    if (success) {
      // Create other sizes from the hero image
      const heroBuffer = fs.readFileSync(outputFile);
      
      // Thumbnail (800x800)
      await sharp(heroBuffer)
        .resize(800, 800, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toFile(path.join(categoryDir, `${service.subcategory}-thumbnail-ai.jpg`));
      
      // Card (400x300)
      await sharp(heroBuffer)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toFile(path.join(categoryDir, `${service.subcategory}-card-ai.jpg`));
      
      // Mobile (375x200)
      await sharp(heroBuffer)
        .resize(375, 200, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 85 })
        .toFile(path.join(categoryDir, `${service.subcategory}-mobile-ai.jpg`));
      
      console.log('✅ Generated all sizes');
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n✨ Generation complete!');
  console.log(`📁 Images saved with -ai suffix in: ${baseDir}`);
}

// Alternative: Use Google's ImageFX (free web tool)
function showImageFXInstructions(): void {
  console.log('\n🎨 Alternative: Use Google\'s ImageFX (Free)\n');
  console.log('1. Go to: https://aitestkitchen.withgoogle.com/tools/image-fx');
  console.log('2. Sign in with your Google account');
  console.log('3. Use these prompts:\n');
  
  SERVICES_TO_GENERATE.forEach(service => {
    console.log(`${service.category}/${service.subcategory}:`);
    console.log(`"${service.prompt}"`);
    console.log('');
  });
  
  console.log('4. Download the images and save to:');
  console.log('   shared-assets/images/services/[category]/[subcategory]-hero.jpg\n');
}

// Main execution
async function main() {
  const args = process.argv[2];
  
  if (args === 'imagefx') {
    showImageFXInstructions();
  } else {
    await generateAllImages();
  }
}

if (import.meta.url === `file://${__filename}`) {
  main().catch(console.error);
}