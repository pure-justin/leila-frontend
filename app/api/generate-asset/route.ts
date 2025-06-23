import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

// Constants
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'leila-428916';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagegeneration@006';
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

// Brand Guidelines
const BRAND_GUIDELINES = {
  colorPalette: '#7C3AED and #3B82F6',
  style: 'hyperrealistic professional photography, bright natural lighting with soft shadows, clean modern aesthetic',
};

// Asset configurations
const ASSET_CONFIGS: Record<string, { aspectRatio: string; template: string }> = {
  serviceCard: {
    aspectRatio: '1:1',
    template: 'Professional service image for {subject}, square format, {style}'
  },
  serviceHero: {
    aspectRatio: '16:9',
    template: 'Wide hero banner image for {subject}, cinematic composition, {style}'
  },
  serviceThumbnail: {
    aspectRatio: '4:3',
    template: 'Professional thumbnail for {subject}, clear focused subject, {style}'
  },
  categoryBanner: {
    aspectRatio: '16:9',
    template: 'Modern category banner for {subject} services, abstract professional design, {style}'
  },
  icon: {
    aspectRatio: '1:1',
    template: 'Minimalist icon representing {subject}, flat design with gradient, {style}'
  },
  illustration: {
    aspectRatio: '1:1',
    template: 'Modern vector illustration of {subject}, isometric style, {style}'
  }
};

// Style modifiers
const STYLE_MODIFIERS: Record<string, string> = {
  modern: 'ultra-modern contemporary style',
  classic: 'timeless classic professional style',
  minimal: 'minimalist clean design aesthetic',
  premium: 'luxury high-end premium feel',
  friendly: 'approachable warm friendly atmosphere',
  tech: 'high-tech futuristic design elements',
  eco: 'eco-friendly sustainable green design'
};

export async function POST(request: NextRequest) {
  try {
    const { subject, assetType, styleModifier } = await request.json();

    if (!subject || !assetType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const config = ASSET_CONFIGS[assetType];
    if (!config) {
      return NextResponse.json(
        { error: 'Invalid asset type' },
        { status: 400 }
      );
    }

    // Build prompt
    let prompt = config.template.replace('{subject}', subject);
    const style = styleModifier && STYLE_MODIFIERS[styleModifier]
      ? STYLE_MODIFIERS[styleModifier]
      : `${BRAND_GUIDELINES.style}, purple and blue color accents (${BRAND_GUIDELINES.colorPalette})`;
    prompt = prompt.replace('{style}', style);
    
    // Add restrictions
    prompt += ', no people or human figures, no text or typography, no logos or brand marks';

    // Initialize Google Auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Generate image
    const requestBody = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: config.aspectRatio,
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
        }
      }
    );

    if (response.data.predictions?.[0]?.bytesBase64Encoded) {
      const imageBase64 = response.data.predictions[0].bytesBase64Encoded;
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      
      // In production, you would upload this to your storage service
      // For now, return as data URL
      const dataUrl = `data:image/png;base64,${imageBase64}`;
      
      return NextResponse.json({ 
        url: dataUrl,
        prompt: prompt,
        assetType: assetType,
        subject: subject
      });
    }

    return NextResponse.json(
      { error: 'No image generated' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Error generating asset:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate asset' },
      { status: 500 }
    );
  }
}