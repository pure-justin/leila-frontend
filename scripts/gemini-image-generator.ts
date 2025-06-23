import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Professional style guidelines for consistent image generation
const STYLE_GUIDELINES = {
  general: {
    style: "hyperrealistic professional photography",
    lighting: "bright natural lighting with soft shadows",
    composition: "rule of thirds, professional angle",
    quality: "8K ultra HD, sharp focus, high detail",
    mood: "clean, modern, trustworthy, premium service",
    colorPalette: "purple and blue accents matching brand colors #7C3AED and #3B82F6",
    background: "modern home interior or relevant workspace",
    elements: "include professional tools and equipment when relevant"
  },
  avoid: [
    "stock photo watermarks",
    "generic or cliché compositions",
    "dark or gloomy atmospheres",
    "cluttered backgrounds",
    "unprofessional appearance",
    "cartoon or illustration styles"
  ]
};

// Service-specific image templates
interface ServiceImageTemplate {
  category: string;
  subcategory: string;
  basePrompt: string;
  variations: string[];
  keywords: string[];
}

const SERVICE_TEMPLATES: ServiceImageTemplate[] = [
  // Plumbing Services
  {
    category: "plumbing",
    subcategory: "faucet-repair",
    basePrompt: "Professional plumber in clean uniform installing a modern chrome faucet in a luxury kitchen",
    variations: ["close-up", "wide-angle", "action-shot"],
    keywords: ["modern faucet", "professional tools", "clean workspace", "luxury kitchen"]
  },
  {
    category: "plumbing",
    subcategory: "pipe-installation",
    basePrompt: "Expert plumber working on copper pipes under a modern sink with professional tools laid out",
    variations: ["technical-view", "professional-portrait", "before-after"],
    keywords: ["copper pipes", "professional plumber", "modern plumbing", "quality materials"]
  },
  {
    category: "plumbing",
    subcategory: "drain-cleaning",
    basePrompt: "Professional drain cleaning service with modern equipment in a spotless bathroom",
    variations: ["equipment-focus", "service-action", "clean-result"],
    keywords: ["drain cleaning", "professional equipment", "spotless bathroom", "modern tools"]
  },
  {
    category: "plumbing",
    subcategory: "water-heater",
    basePrompt: "Professional installing a modern tankless water heater in a clean utility room",
    variations: ["installation-process", "modern-equipment", "energy-efficient"],
    keywords: ["water heater", "tankless", "professional installation", "modern home"]
  },

  // Electrical Services
  {
    category: "electrical",
    subcategory: "outlet-installation",
    basePrompt: "Licensed electrician installing modern USB outlets in a contemporary home office",
    variations: ["detail-shot", "safety-focus", "modern-outlet"],
    keywords: ["USB outlets", "licensed electrician", "modern home", "safety equipment"]
  },
  {
    category: "electrical",
    subcategory: "panel-upgrade",
    basePrompt: "Professional electrician working on a modern electrical panel with safety gear",
    variations: ["technical-detail", "safety-equipment", "modern-panel"],
    keywords: ["electrical panel", "circuit breakers", "professional electrician", "safety"]
  },
  {
    category: "electrical",
    subcategory: "lighting-installation",
    basePrompt: "Electrician installing elegant recessed LED lighting in a modern living room",
    variations: ["ambient-lighting", "installation-process", "finished-result"],
    keywords: ["LED lighting", "recessed lights", "modern interior", "professional installation"]
  },
  {
    category: "electrical",
    subcategory: "smart-home",
    basePrompt: "Professional setting up smart home automation system with tablet control",
    variations: ["technology-focus", "user-interface", "integrated-system"],
    keywords: ["smart home", "automation", "modern technology", "professional setup"]
  },

  // HVAC Services
  {
    category: "hvac",
    subcategory: "ac-installation",
    basePrompt: "HVAC technician installing a modern energy-efficient air conditioning unit",
    variations: ["outdoor-unit", "indoor-installation", "technical-work"],
    keywords: ["air conditioning", "HVAC technician", "energy efficient", "modern unit"]
  },
  {
    category: "hvac",
    subcategory: "furnace-repair",
    basePrompt: "Professional HVAC specialist servicing a high-efficiency furnace with diagnostic tools",
    variations: ["diagnostic-process", "repair-action", "maintenance-check"],
    keywords: ["furnace repair", "HVAC specialist", "diagnostic tools", "high efficiency"]
  },
  {
    category: "hvac",
    subcategory: "duct-cleaning",
    basePrompt: "Professional duct cleaning service with specialized equipment in a modern home",
    variations: ["equipment-detail", "cleaning-process", "clean-ducts"],
    keywords: ["duct cleaning", "specialized equipment", "air quality", "professional service"]
  },

  // Cleaning Services
  {
    category: "cleaning",
    subcategory: "house-cleaning",
    basePrompt: "Professional house cleaner in uniform using eco-friendly products in a bright modern kitchen",
    variations: ["kitchen-cleaning", "bathroom-cleaning", "living-room"],
    keywords: ["house cleaning", "eco-friendly", "professional cleaner", "spotless home"]
  },
  {
    category: "cleaning",
    subcategory: "deep-cleaning",
    basePrompt: "Team of professional cleaners performing deep cleaning with professional equipment",
    variations: ["team-work", "detailed-cleaning", "professional-equipment"],
    keywords: ["deep cleaning", "professional team", "thorough service", "modern home"]
  },
  {
    category: "cleaning",
    subcategory: "carpet-cleaning",
    basePrompt: "Professional carpet cleaning service using industrial equipment on luxury carpets",
    variations: ["equipment-action", "before-after", "stain-removal"],
    keywords: ["carpet cleaning", "industrial equipment", "luxury carpets", "professional service"]
  },

  // Landscaping Services
  {
    category: "landscaping",
    subcategory: "lawn-care",
    basePrompt: "Professional landscaper with modern equipment maintaining a perfectly manicured lawn",
    variations: ["mowing-action", "edge-trimming", "finished-lawn"],
    keywords: ["lawn care", "professional landscaper", "manicured lawn", "modern equipment"]
  },
  {
    category: "landscaping",
    subcategory: "garden-design",
    basePrompt: "Landscape designer creating a beautiful modern garden with premium plants and features",
    variations: ["design-process", "planting", "finished-garden"],
    keywords: ["garden design", "landscape designer", "modern garden", "premium landscaping"]
  },
  {
    category: "landscaping",
    subcategory: "tree-service",
    basePrompt: "Certified arborist safely trimming trees with professional equipment",
    variations: ["safety-gear", "precision-cutting", "healthy-trees"],
    keywords: ["tree service", "certified arborist", "safety equipment", "professional trimming"]
  },

  // Handyman Services
  {
    category: "handyman",
    subcategory: "general-repair",
    basePrompt: "Professional handyman with organized toolbox fixing modern home fixtures",
    variations: ["tool-organization", "repair-action", "multiple-tools"],
    keywords: ["handyman", "professional tools", "home repair", "versatile service"]
  },
  {
    category: "handyman",
    subcategory: "furniture-assembly",
    basePrompt: "Skilled handyman assembling modern furniture with precision tools",
    variations: ["assembly-process", "tools-detail", "finished-furniture"],
    keywords: ["furniture assembly", "precision tools", "modern furniture", "professional assembly"]
  },
  {
    category: "handyman",
    subcategory: "painting",
    basePrompt: "Professional painter creating perfect finish on modern interior walls",
    variations: ["brush-technique", "color-selection", "finished-room"],
    keywords: ["interior painting", "professional painter", "perfect finish", "modern colors"]
  },

  // Appliance Repair
  {
    category: "appliance",
    subcategory: "washer-repair",
    basePrompt: "Appliance technician repairing modern high-efficiency washing machine",
    variations: ["diagnostic-work", "repair-detail", "testing-phase"],
    keywords: ["washer repair", "appliance technician", "modern appliance", "professional repair"]
  },
  {
    category: "appliance",
    subcategory: "refrigerator-repair",
    basePrompt: "Professional technician servicing a modern smart refrigerator with diagnostic tablet",
    variations: ["smart-diagnostics", "component-repair", "professional-service"],
    keywords: ["refrigerator repair", "smart appliance", "diagnostic tools", "professional technician"]
  },

  // Pest Control
  {
    category: "pest-control",
    subcategory: "inspection",
    basePrompt: "Licensed pest control specialist performing thorough inspection with modern equipment",
    variations: ["inspection-process", "professional-equipment", "detailed-check"],
    keywords: ["pest inspection", "licensed specialist", "modern equipment", "thorough service"]
  },
  {
    category: "pest-control",
    subcategory: "treatment",
    basePrompt: "Professional applying eco-friendly pest control treatment in a modern home",
    variations: ["safe-application", "eco-friendly", "professional-treatment"],
    keywords: ["pest treatment", "eco-friendly", "safe application", "professional service"]
  }
];

// Function to generate professional prompt
function generateProfessionalPrompt(template: ServiceImageTemplate, variation: string): string {
  const { general, avoid } = STYLE_GUIDELINES;
  
  const prompt = `
${template.basePrompt}, ${variation} perspective.

Style Requirements:
- ${general.style}
- ${general.lighting}
- ${general.composition}
- ${general.quality}
- Mood: ${general.mood}
- Color palette: ${general.colorPalette}
- Setting: ${general.background}
- ${general.elements}

Key Elements to Include:
${template.keywords.map(k => `- ${k}`).join('\n')}

Technical Specifications:
- Aspect ratio: 16:9 for hero images, 1:1 for thumbnails
- Ultra high resolution suitable for 4K displays
- Professional commercial photography quality
- Brand colors ${general.colorPalette} subtly incorporated

Avoid:
${avoid.map(a => `- ${a}`).join('\n')}
`;

  return prompt.trim();
}

// Function to generate image using Gemini (placeholder - actual implementation would use image generation API)
async function generateImage(prompt: string, outputPath: string): Promise<void> {
  console.log(`Generating image with prompt:\n${prompt}\n`);
  console.log(`Output path: ${outputPath}\n`);
  
  // Note: Gemini currently doesn't have direct image generation
  // This would integrate with Imagen API or another Google image generation service
  // For now, we'll create the prompt files for use with other services
  
  const promptFilePath = outputPath.replace(/\.(jpg|png)$/, '-prompt.txt');
  fs.writeFileSync(promptFilePath, prompt);
  
  console.log(`✅ Prompt saved to: ${promptFilePath}`);
}

// Function to create asset directory structure
function createAssetDirectories(): void {
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  
  const categories = [...new Set(SERVICE_TEMPLATES.map(t => t.category))];
  
  categories.forEach(category => {
    const categoryDir = path.join(baseDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
      console.log(`📁 Created directory: ${categoryDir}`);
    }
  });
}

// Function to generate all service images
async function generateAllServiceImages(): Promise<void> {
  console.log('🎨 Starting Leila Service Image Generation System\n');
  
  // Create directories
  createAssetDirectories();
  
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  const promptsDir = path.join(__dirname, '../../shared-assets/prompts');
  
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  
  // Generate comprehensive prompt documentation
  const allPrompts: any[] = [];
  
  for (const template of SERVICE_TEMPLATES) {
    console.log(`\n📸 Generating images for ${template.category}/${template.subcategory}`);
    
    for (const variation of template.variations) {
      const prompt = generateProfessionalPrompt(template, variation);
      const filename = `${template.subcategory}-${variation}.jpg`;
      const outputPath = path.join(baseDir, template.category, filename);
      
      allPrompts.push({
        category: template.category,
        subcategory: template.subcategory,
        variation,
        filename,
        prompt
      });
      
      await generateImage(prompt, outputPath);
    }
  }
  
  // Save master prompt file
  const masterPromptFile = path.join(promptsDir, 'master-prompts.json');
  fs.writeFileSync(masterPromptFile, JSON.stringify(allPrompts, null, 2));
  console.log(`\n📄 Master prompt file saved to: ${masterPromptFile}`);
  
  // Generate service image mapping
  const imageMapping = generateImageMapping();
  const mappingFile = path.join(baseDir, 'image-mapping.json');
  fs.writeFileSync(mappingFile, JSON.stringify(imageMapping, null, 2));
  console.log(`📍 Image mapping saved to: ${mappingFile}`);
  
  console.log('\n✨ Image generation prompts completed!');
  console.log('🎯 Next steps:');
  console.log('1. Use these prompts with an image generation service');
  console.log('2. Save generated images to the specified paths');
  console.log('3. Run image optimization script');
  console.log('4. Update service catalog with new image references');
}

// Function to generate image mapping for services
function generateImageMapping(): Record<string, any> {
  const mapping: Record<string, any> = {};
  
  SERVICE_TEMPLATES.forEach(template => {
    if (!mapping[template.category]) {
      mapping[template.category] = {};
    }
    
    mapping[template.category][template.subcategory] = {
      hero: `${template.subcategory}-wide-angle.jpg`,
      thumbnail: `${template.subcategory}-close-up.jpg`,
      detail: `${template.subcategory}-action-shot.jpg`,
      variations: template.variations.map(v => `${template.subcategory}-${v}.jpg`)
    };
  });
  
  return mapping;
}

// Generate style guide document
function generateStyleGuide(): void {
  const styleGuideContent = `# Leila Service Images Style Guide

## Brand Colors
- Primary Purple: #7C3AED
- Secondary Blue: #3B82F6
- Success Green: #10B981
- Warning Orange: #F59E0B

## Image Requirements

### Hero Images (Service Pages)
- Aspect Ratio: 16:9
- Minimum Resolution: 1920x1080
- Format: JPEG (optimized)
- Style: Wide angle showing service in action

### Thumbnail Images (Service Cards)
- Aspect Ratio: 1:1
- Minimum Resolution: 800x800
- Format: JPEG (optimized)
- Style: Close-up detail or focused action

### Gallery Images
- Aspect Ratio: 4:3
- Minimum Resolution: 1200x900
- Format: JPEG (optimized)
- Style: Multiple angles and perspectives

## Photography Style
${JSON.stringify(STYLE_GUIDELINES, null, 2)}

## Naming Convention
{category}/{subcategory}-{variation}.jpg

Examples:
- plumbing/faucet-repair-close-up.jpg
- electrical/panel-upgrade-wide-angle.jpg
- hvac/ac-installation-action-shot.jpg

## Color Grading
- Bright, clean, modern aesthetic
- Slight cool tone for trust and professionalism
- Purple/blue accent lighting where appropriate
- High contrast for clarity
- Vibrant but not oversaturated

## Composition Guidelines
1. Rule of thirds for main subject
2. Clean, uncluttered backgrounds
3. Professional uniforms/appearance
4. Modern tools and equipment visible
5. Safety gear prominently displayed
6. Natural lighting preferred
7. Show both process and results

## Avoid
- Stock photo watermarks
- Dated equipment or settings
- Messy or unprofessional appearance
- Dark or gloomy atmospheres
- Generic or cliché poses
- Low resolution or blurry images
`;

  const styleGuidePath = path.join(__dirname, '../../shared-assets/STYLE_GUIDE.md');
  fs.writeFileSync(styleGuidePath, styleGuideContent);
  console.log(`📚 Style guide saved to: ${styleGuidePath}`);
}

// Main execution
async function main() {
  try {
    generateStyleGuide();
    await generateAllServiceImages();
  } catch (error) {
    console.error('❌ Error generating images:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${__filename}`) {
  main();
}

export { generateProfessionalPrompt, SERVICE_TEMPLATES, STYLE_GUIDELINES };