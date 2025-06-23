#!/usr/bin/env node

import { config } from 'dotenv';
import * as path from 'path';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import * as fs from 'fs/promises';

// Load environment variables
config({ path: path.join(__dirname, '../.env.local') });

// Constants
const PROJECT_ID = 'leila-platform';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagegeneration@006';
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

async function testImageGeneration() {
  try {
    console.log('🧪 Testing Google Imagen 2 API...\n');
    console.log(`Project: ${PROJECT_ID}`);
    console.log(`Endpoint: ${ENDPOINT}\n`);

    // Initialize auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    console.log('✅ Authentication successful\n');

    // Simple test prompt
    const prompt = 'Professional house cleaning service, modern equipment, purple and blue accents, no people or text';
    console.log(`📝 Test prompt: "${prompt}"\n`);

    // Make request
    const requestBody = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '4:3',
        addWatermark: false,
        safetySetting: 'block_some',
        personGeneration: 'dont_allow'
      }
    };

    console.log('🚀 Sending request to Imagen 2...');
    const response = await axios.post(
      ENDPOINT,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.predictions?.[0]?.bytesBase64Encoded) {
      console.log('✅ Image generated successfully!\n');
      
      // Save test image
      const imageBuffer = Buffer.from(response.data.predictions[0].bytesBase64Encoded, 'base64');
      const outputPath = path.join(__dirname, 'test-image.png');
      await fs.writeFile(outputPath, imageBuffer);
      
      console.log(`💾 Test image saved to: ${outputPath}`);
      console.log(`📏 Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
      
      return true;
    } else {
      console.error('❌ No image data in response');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return false;
    }

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.log('\n⚠️  Permission denied. Please ensure:');
      console.log('1. Vertex AI API is enabled');
      console.log('2. Your account has the necessary permissions');
      console.log('3. Billing is enabled for the project');
    }
    return false;
  }
}

// Run test
testImageGeneration().then(success => {
  if (success) {
    console.log('\n🎉 Test successful! You can now generate images for all services.');
  } else {
    console.log('\n😞 Test failed. Please check the error messages above.');
  }
});