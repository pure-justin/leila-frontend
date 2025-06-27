import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { generateProfessionalPlaceholder, generateServiceImageWithFallbacks, checkVertexAIAvailability } from './vertex-ai-image-generator.js';
import { SERVICE_TEMPLATES } from './gemini-image-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Priority services to generate first
const PRIORITY_SERVICES = [
  { category: 'electrical', subcategories: ['outlet-installation', 'panel-upgrade', 'lighting-installation', 'smart-home'] },
  { category: 'plumbing', subcategories: ['faucet-repair', 'pipe-installation', 'drain-cleaning', 'water-heater'] },
  { category: 'hvac', subcategories: ['ac-installation', 'furnace-repair', 'duct-cleaning'] },
  { category: 'cleaning', subcategories: ['house-cleaning', 'deep-cleaning', 'carpet-cleaning'] },
  { category: 'handyman', subcategories: ['general-repair', 'furniture-assembly', 'painting'] },
  { category: 'landscaping', subcategories: ['lawn-care', 'garden-design', 'tree-service'] },
  { category: 'appliance', subcategories: ['refrigerator-repair', 'washer-repair'] },
  { category: 'pest-control', subcategories: ['inspection', 'treatment'] }
];

interface ImageStats {
  total: number;
  generated: number;
  skipped: number;
  startTime: number;
}

const stats: ImageStats = {
  total: 0,
  generated: 0,
  skipped: 0,
  startTime: Date.now()
};

// Generate professional-looking images
async function generateProfessionalImages(): Promise<void> {
  console.log('🎨 Leila Professional Image Generation System\n');
  
  // Check available services
  checkVertexAIAvailability();
  
  console.log('\n📸 Starting image generation...\n');
  
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  
  for (const service of PRIORITY_SERVICES) {
    const categoryDir = path.join(baseDir, service.category);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    for (const subcategory of service.subcategories) {
      console.log(`\n🔧 Processing ${service.category}/${subcategory}`);
      
      const variants: Array<{ type: 'hero' | 'thumbnail' | 'card' | 'mobile'; desc: string }> = [
        { type: 'hero', desc: 'Hero banner (1920x1080)' },
        { type: 'thumbnail', desc: 'Square thumbnail (800x800)' },
        { type: 'card', desc: 'Service card (400x300)' },
        { type: 'mobile', desc: 'Mobile view (375x200)' }
      ];
      
      for (const variant of variants) {
        stats.total++;
        const outputPath = path.join(categoryDir, `${subcategory}-${variant.type}.jpg`);
        
        // Skip if already exists
        if (fs.existsSync(outputPath)) {
          const fileStats = fs.statSync(outputPath);
          if (fileStats.size > 10000) { // Skip if file is larger than 10KB (not a placeholder)
            console.log(`⏭️  Skipping ${variant.desc} - already exists`);
            stats.skipped++;
            continue;
          }
        }
        
        try {
          // Find the matching template for enhanced prompt
          const template = SERVICE_TEMPLATES.find(t => 
            t.category === service.category && t.subcategory === subcategory
          );
          
          const prompt = template ? 
            `${template.basePrompt}, ${variant.type} perspective, professional photography` :
            `Professional ${service.category} service: ${subcategory}, ${variant.type} view`;
          
          // Generate with fallbacks
          const imageBuffer = await generateServiceImageWithFallbacks(
            service.category,
            subcategory,
            variant.type,
            prompt
          );
          
          // Optimize and save
          await sharp(imageBuffer)
            .jpeg({ quality: 85, progressive: true })
            .toFile(outputPath);
          
          stats.generated++;
          console.log(`✅ Generated ${variant.desc}`);
          
        } catch (error) {
          console.error(`❌ Failed to generate ${variant.desc}:`, error);
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  
  // Display statistics
  const elapsed = Math.floor((Date.now() - stats.startTime) / 1000);
  console.log('\n📊 Generation Complete!\n');
  console.log(`⏱️  Time: ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`📸 Total images: ${stats.total}`);
  console.log(`✅ Generated: ${stats.generated}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);
  console.log(`📁 Location: ${baseDir}`);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Review generated images');
  console.log('2. Set up AI API for photorealistic images:');
  console.log('   - Enable Vertex AI in Google Cloud Console');
  console.log('   - OR get a free Hugging Face token');
  console.log('   - OR sign up for Replicate/Stability AI');
  console.log('3. Re-run this script to upgrade placeholders to AI images');
}

// Main execution
if (import.meta.url === `file://${__filename}`) {
  generateProfessionalImages().catch(console.error);
}