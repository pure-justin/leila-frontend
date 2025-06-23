#!/usr/bin/env node

import { config } from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { program } from 'commander';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import * as readline from 'readline';

// Load environment variables
config({ path: path.join(__dirname, '../.env.local') });

// Constants
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'leila-428916';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagegeneration@006';
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

// Brand Guidelines
const BRAND_GUIDELINES = {
  colorPalette: {
    primary: '#7C3AED', // Purple
    secondary: '#3B82F6', // Blue
    accent: '#10B981', // Green
    neutral: '#6B7280', // Gray
    background: '#F9FAFB', // Light gray
    white: '#FFFFFF'
  },
  style: {
    general: 'hyperrealistic professional photography',
    lighting: 'bright natural lighting with soft shadows',
    composition: 'clean modern aesthetic with purple and blue accents',
    perspective: 'eye-level view with professional framing'
  },
  restrictions: {
    avoidPeople: true,
    avoidText: true,
    avoidLogos: true
  }
};

// Asset Types Configuration
const ASSET_TYPES = {
  serviceCard: {
    name: 'Service Card Image',
    aspectRatio: '1:1',
    sizes: [{ width: 400, height: 400, suffix: 'card' }],
    promptTemplate: 'Professional service image for {service}, square format, {style}'
  },
  serviceHero: {
    name: 'Service Hero Image',
    aspectRatio: '16:9',
    sizes: [{ width: 1920, height: 1080, suffix: 'hero' }],
    promptTemplate: 'Wide hero banner image for {service}, cinematic composition, {style}'
  },
  serviceThumbnail: {
    name: 'Service Thumbnail',
    aspectRatio: '4:3',
    sizes: [{ width: 800, height: 600, suffix: 'thumb' }],
    promptTemplate: 'Professional thumbnail for {service}, clear focused subject, {style}'
  },
  categoryBanner: {
    name: 'Category Banner',
    aspectRatio: '16:9',
    sizes: [{ width: 1920, height: 600, suffix: 'banner' }],
    promptTemplate: 'Modern category banner for {category} services, abstract professional design, {style}'
  },
  icon: {
    name: 'Service Icon',
    aspectRatio: '1:1',
    sizes: [
      { width: 192, height: 192, suffix: 'icon-lg' },
      { width: 96, height: 96, suffix: 'icon-md' },
      { width: 48, height: 48, suffix: 'icon-sm' }
    ],
    promptTemplate: 'Minimalist icon representing {service}, flat design with gradient, {style}'
  },
  illustration: {
    name: 'Service Illustration',
    aspectRatio: '1:1',
    sizes: [{ width: 800, height: 800, suffix: 'illustration' }],
    promptTemplate: 'Modern vector illustration of {service}, isometric style, {style}'
  },
  pattern: {
    name: 'Background Pattern',
    aspectRatio: '1:1',
    sizes: [{ width: 400, height: 400, suffix: 'pattern' }],
    promptTemplate: 'Seamless geometric pattern inspired by {service}, subtle purple accents, {style}'
  },
  texture: {
    name: 'Background Texture',
    aspectRatio: '16:9',
    sizes: [{ width: 1920, height: 1080, suffix: 'texture' }],
    promptTemplate: 'Subtle background texture for {service} page, gradient mesh, {style}'
  }
};

// Prompt Templates for Different Use Cases
const PROMPT_TEMPLATES = {
  marketing: {
    billboard: 'Billboard advertisement design for {service}, eye-catching visuals, {style}',
    socialMedia: 'Social media post image for {service}, engaging and modern, {style}',
    emailHeader: 'Email header image for {service} promotion, professional and clean, {style}',
    adBanner: 'Digital ad banner for {service}, compelling call-to-action design, {style}'
  },
  ui: {
    placeholder: 'Loading placeholder image for {service}, minimal geometric design, {style}',
    emptyState: 'Empty state illustration for {service} section, friendly and helpful, {style}',
    errorState: 'Error state illustration for {service} page, reassuring design, {style}',
    successState: 'Success state illustration for {service} booking, celebratory design, {style}'
  },
  seasonal: {
    spring: '{service} in spring setting, fresh green accents, blooming flowers, {style}',
    summer: '{service} in summer setting, bright sunny atmosphere, {style}',
    fall: '{service} in autumn setting, warm orange tones, falling leaves, {style}',
    winter: '{service} in winter setting, cozy indoor atmosphere, {style}',
    holiday: '{service} with subtle holiday decorations, festive but professional, {style}'
  },
  location: {
    residential: '{service} in modern residential setting, suburban home, {style}',
    commercial: '{service} in professional office environment, {style}',
    industrial: '{service} in industrial facility setting, {style}',
    outdoor: '{service} in outdoor setting, natural environment, {style}'
  }
};

// Style Modifiers
const STYLE_MODIFIERS = {
  modern: 'ultra-modern contemporary style',
  classic: 'timeless classic professional style',
  minimal: 'minimalist clean design aesthetic',
  premium: 'luxury high-end premium feel',
  friendly: 'approachable warm friendly atmosphere',
  tech: 'high-tech futuristic design elements',
  eco: 'eco-friendly sustainable green design',
  urban: 'urban metropolitan city aesthetic'
};

class AIGraphicDesigner {
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }

  /**
   * Generate an image using Google Imagen 2
   */
  async generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<Buffer | null> {
    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      const requestBody = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspectRatio,
          addWatermark: false,
          safetySetting: 'block_some',
          personGeneration: 'dont_allow',
          seed: Math.floor(Math.random() * 1000000)
        }
      };

      console.log(`\n🎨 Generating image with prompt: "${prompt}"`);

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

      // Type assertion to handle the response data structure
      const responseData = response.data as {
        predictions?: Array<{
          bytesBase64Encoded?: string;
        }>;
      };

      if (responseData.predictions?.[0]?.bytesBase64Encoded) {
        const imageBuffer = Buffer.from(responseData.predictions[0].bytesBase64Encoded, 'base64');
        console.log('✅ Image generated successfully');
        return imageBuffer;
      }

      console.error('❌ No image data in response');
      return null;
    } catch (error: any) {
      console.error('❌ Error generating image:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Build a professional prompt based on templates and guidelines
   */
  buildPrompt(
    subject: string,
    assetType: keyof typeof ASSET_TYPES,
    template?: string,
    styleModifier?: keyof typeof STYLE_MODIFIERS
  ): string {
    const brandStyle = `${BRAND_GUIDELINES.style.general}, ${BRAND_GUIDELINES.style.lighting}, ${BRAND_GUIDELINES.style.composition}, purple (#7C3AED) and blue (#3B82F6) color accents`;
    
    let finalPrompt = template || ASSET_TYPES[assetType].promptTemplate;
    finalPrompt = finalPrompt.replace('{service}', subject);
    finalPrompt = finalPrompt.replace('{category}', subject);
    
    const style = styleModifier ? STYLE_MODIFIERS[styleModifier] : brandStyle;
    finalPrompt = finalPrompt.replace('{style}', style);

    // Add brand restrictions
    if (BRAND_GUIDELINES.restrictions.avoidPeople) {
      finalPrompt += ', no people or human figures';
    }
    if (BRAND_GUIDELINES.restrictions.avoidText) {
      finalPrompt += ', no text or typography';
    }
    if (BRAND_GUIDELINES.restrictions.avoidLogos) {
      finalPrompt += ', no logos or brand marks';
    }

    return finalPrompt;
  }

  /**
   * Process and save image with multiple sizes
   */
  async processAndSaveImage(
    imageBuffer: Buffer,
    outputDir: string,
    baseName: string,
    sizes: Array<{ width: number; height: number; suffix: string }>
  ): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${baseName}-${size.suffix}.png`);
      
      await sharp(imageBuffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 90 })
        .toFile(outputPath);

      console.log(`💾 Saved: ${outputPath} (${size.width}x${size.height})`);
    }

    // Also save original
    const originalPath = path.join(outputDir, `${baseName}-original.png`);
    await fs.writeFile(originalPath, imageBuffer);
    console.log(`💾 Saved original: ${originalPath}`);
  }

  /**
   * Interactive prompt builder
   */
  async interactivePromptBuilder(): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string): Promise<string> => {
      return new Promise(resolve => rl.question(query, resolve));
    };

    console.log('\n🎨 AI Graphic Designer - Interactive Mode\n');

    // Get subject
    const subject = await question('What is the subject? (e.g., "house cleaning", "plumbing repair"): ');

    // Select asset type
    console.log('\nAsset Types:');
    Object.entries(ASSET_TYPES).forEach(([key, value], index) => {
      console.log(`${index + 1}. ${value.name} (${value.aspectRatio})`);
    });
    const assetTypeIndex = parseInt(await question('\nSelect asset type (number): ')) - 1;
    const assetType = Object.keys(ASSET_TYPES)[assetTypeIndex] as keyof typeof ASSET_TYPES;

    // Select template category
    console.log('\nTemplate Categories:');
    console.log('1. Default');
    console.log('2. Marketing');
    console.log('3. UI/UX');
    console.log('4. Seasonal');
    console.log('5. Location-based');
    const templateCategory = await question('\nSelect template category (number): ');

    let template: string | undefined;
    if (templateCategory !== '1') {
      const categories = ['', 'marketing', 'ui', 'seasonal', 'location'];
      const selectedCategory = categories[parseInt(templateCategory) - 1];
      
      if (selectedCategory && selectedCategory in PROMPT_TEMPLATES) {
        const templates = PROMPT_TEMPLATES[selectedCategory as keyof typeof PROMPT_TEMPLATES];
        console.log(`\n${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Templates:`);
        Object.entries(templates).forEach(([key, value], index) => {
          console.log(`${index + 1}. ${key}`);
        });
        const templateIndex = parseInt(await question('\nSelect template (number): ')) - 1;
        template = Object.values(templates)[templateIndex];
      }
    }

    // Select style modifier
    console.log('\nStyle Modifiers:');
    console.log('1. Default (Brand Style)');
    Object.keys(STYLE_MODIFIERS).forEach((key, index) => {
      console.log(`${index + 2}. ${key.charAt(0).toUpperCase() + key.slice(1)}`);
    });
    const styleIndex = parseInt(await question('\nSelect style (number): ')) - 1;
    const styleModifier = styleIndex === 0 ? undefined : Object.keys(STYLE_MODIFIERS)[styleIndex - 1] as keyof typeof STYLE_MODIFIERS;

    rl.close();

    return this.buildPrompt(subject, assetType, template, styleModifier);
  }

  /**
   * Generate multiple variations of an asset
   */
  async generateVariations(
    subject: string,
    assetType: keyof typeof ASSET_TYPES,
    count: number = 3,
    outputDir: string
  ): Promise<void> {
    const baseOutputDir = path.join(outputDir, subject.replace(/\s+/g, '-').toLowerCase());
    await fs.mkdir(baseOutputDir, { recursive: true });

    for (let i = 0; i < count; i++) {
      console.log(`\n🎨 Generating variation ${i + 1} of ${count}...`);
      
      // Use different style modifiers for variations
      const styleModifiers = Object.keys(STYLE_MODIFIERS) as Array<keyof typeof STYLE_MODIFIERS>;
      const styleModifier = styleModifiers[i % styleModifiers.length];
      
      const prompt = this.buildPrompt(subject, assetType, undefined, styleModifier);
      const imageBuffer = await this.generateImage(prompt, ASSET_TYPES[assetType].aspectRatio);
      
      if (imageBuffer) {
        await this.processAndSaveImage(
          imageBuffer,
          baseOutputDir,
          `${assetType}-v${i + 1}`,
          ASSET_TYPES[assetType].sizes
        );
      }
    }
  }

  /**
   * Generate a complete asset package for a service
   */
  async generateServicePackage(serviceName: string, outputDir: string): Promise<void> {
    console.log(`\n📦 Generating complete asset package for "${serviceName}"...\n`);

    const serviceOutputDir = path.join(outputDir, serviceName.replace(/\s+/g, '-').toLowerCase());
    await fs.mkdir(serviceOutputDir, { recursive: true });

    // Generate each asset type
    for (const [assetType, config] of Object.entries(ASSET_TYPES)) {
      console.log(`\n🎨 Generating ${config.name}...`);
      
      const prompt = this.buildPrompt(serviceName, assetType as keyof typeof ASSET_TYPES);
      const imageBuffer = await this.generateImage(prompt, config.aspectRatio);
      
      if (imageBuffer) {
        await this.processAndSaveImage(
          imageBuffer,
          serviceOutputDir,
          assetType,
          config.sizes
        );
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Generate manifest file
    const manifest = {
      service: serviceName,
      generatedAt: new Date().toISOString(),
      assets: Object.entries(ASSET_TYPES).map(([type, config]) => ({
        type,
        name: config.name,
        sizes: config.sizes.map(size => ({
          ...size,
          path: `${type}-${size.suffix}.png`
        }))
      })),
      brandGuidelines: BRAND_GUIDELINES
    };

    await fs.writeFile(
      path.join(serviceOutputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`\n✅ Asset package complete! Check ${serviceOutputDir}`);
  }
}

// CLI Commands
program
  .name('ai-designer')
  .description('AI-powered graphic designer for Leila Home Services')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate a single image asset')
  .option('-p, --prompt <prompt>', 'Custom prompt')
  .option('-s, --subject <subject>', 'Subject (e.g., "house cleaning")')
  .option('-t, --type <type>', 'Asset type (serviceCard, serviceHero, etc.)')
  .option('-a, --aspect <ratio>', 'Aspect ratio', '1:1')
  .option('-o, --output <dir>', 'Output directory', './generated-assets')
  .action(async (options) => {
    const designer = new AIGraphicDesigner();
    
    let prompt: string;
    if (options.prompt) {
      prompt = options.prompt;
    } else if (options.subject && options.type) {
      prompt = designer.buildPrompt(options.subject, options.type);
    } else {
      prompt = await designer.interactivePromptBuilder();
    }

    const imageBuffer = await designer.generateImage(prompt, options.aspect);
    if (imageBuffer) {
      const outputPath = path.join(options.output, `generated-${Date.now()}.png`);
      await fs.mkdir(options.output, { recursive: true });
      await fs.writeFile(outputPath, imageBuffer);
      console.log(`\n✅ Image saved to: ${outputPath}`);
    }
  });

program
  .command('interactive')
  .description('Interactive prompt builder')
  .option('-o, --output <dir>', 'Output directory', './generated-assets')
  .action(async (options) => {
    const designer = new AIGraphicDesigner();
    const prompt = await designer.interactivePromptBuilder();
    
    console.log(`\n📝 Generated prompt: "${prompt}"`);
    
    const imageBuffer = await designer.generateImage(prompt);
    if (imageBuffer) {
      const outputPath = path.join(options.output, `generated-${Date.now()}.png`);
      await fs.mkdir(options.output, { recursive: true });
      await fs.writeFile(outputPath, imageBuffer);
      console.log(`\n✅ Image saved to: ${outputPath}`);
    }
  });

program
  .command('variations')
  .description('Generate multiple variations of an asset')
  .requiredOption('-s, --subject <subject>', 'Subject (e.g., "house cleaning")')
  .requiredOption('-t, --type <type>', 'Asset type')
  .option('-c, --count <count>', 'Number of variations', '3')
  .option('-o, --output <dir>', 'Output directory', './generated-assets')
  .action(async (options) => {
    const designer = new AIGraphicDesigner();
    await designer.generateVariations(
      options.subject,
      options.type,
      parseInt(options.count),
      options.output
    );
  });

program
  .command('package')
  .description('Generate a complete asset package for a service')
  .requiredOption('-s, --service <service>', 'Service name')
  .option('-o, --output <dir>', 'Output directory', './generated-assets')
  .action(async (options) => {
    const designer = new AIGraphicDesigner();
    await designer.generateServicePackage(options.service, options.output);
  });

program
  .command('batch')
  .description('Generate assets for multiple services from a file')
  .requiredOption('-f, --file <file>', 'File containing service names (one per line)')
  .option('-t, --type <type>', 'Asset type to generate')
  .option('-o, --output <dir>', 'Output directory', './generated-assets')
  .action(async (options) => {
    const designer = new AIGraphicDesigner();
    const services = (await fs.readFile(options.file, 'utf-8')).split('\n').filter(Boolean);
    
    for (const service of services) {
      console.log(`\n🎨 Processing: ${service}`);
      
      if (options.type) {
        const prompt = designer.buildPrompt(service, options.type);
        const imageBuffer = await designer.generateImage(prompt, ASSET_TYPES[options.type].aspectRatio);
        
        if (imageBuffer) {
          await designer.processAndSaveImage(
            imageBuffer,
            path.join(options.output, service.replace(/\s+/g, '-').toLowerCase()),
            options.type,
            ASSET_TYPES[options.type].sizes
          );
        }
      } else {
        await designer.generateServicePackage(service, options.output);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  });

// Run CLI
program.parse();