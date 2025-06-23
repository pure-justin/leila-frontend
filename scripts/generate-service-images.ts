import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { SERVICE_TEMPLATES, generateProfessionalPrompt, STYLE_GUIDELINES } from './gemini-image-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Image generation configuration
interface ImageConfig {
  sizes: {
    hero: { width: 1920, height: 1080 };
    thumbnail: { width: 800, height: 800 };
    card: { width: 400, height: 300 };
    mobile: { width: 375, height: 200 };
  };
  quality: number;
  format: 'jpeg' | 'webp';
}

const IMAGE_CONFIG: ImageConfig = {
  sizes: {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  },
  quality: 85,
  format: 'jpeg'
};

// Vertex AI Image Generation (when available)
async function generateWithVertexAI(prompt: string): Promise<Buffer | null> {
  // This would integrate with Google's Vertex AI image generation
  // Currently placeholder - will be implemented when API is available
  console.log('🎨 Vertex AI integration placeholder');
  return null;
}

// Alternative: Integration with other image generation services
async function generateWithAlternativeService(prompt: string): Promise<Buffer | null> {
  // This could integrate with:
  // - Stable Diffusion API
  // - DALL-E API
  // - Midjourney API
  // - Or any other image generation service
  
  console.log('🎨 Alternative image generation service placeholder');
  return null;
}

// Process and optimize generated image
async function processGeneratedImage(
  imageBuffer: Buffer,
  outputPath: string,
  size: { width: number; height: number }
): Promise<void> {
  await sharp(imageBuffer)
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: IMAGE_CONFIG.quality })
    .toFile(outputPath);
    
  console.log(`✅ Processed image saved to: ${outputPath}`);
}

// Generate placeholder images with brand colors
async function generatePlaceholder(
  text: string,
  size: { width: number; height: number },
  outputPath: string
): Promise<void> {
  const svg = `
    <svg width="${size.width}" height="${size.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size.width}" height="${size.height}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">
        ${text}
      </text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .jpeg({ quality: IMAGE_CONFIG.quality })
    .toFile(outputPath);
}

// Update service catalog with generated images
function updateServiceCatalog(imageMapping: Record<string, any>): void {
  const catalogPath = path.join(__dirname, '../lib/services-catalog.ts');
  
  // This would update the service catalog with new image paths
  console.log('📝 Service catalog update placeholder');
  console.log('Image mapping:', JSON.stringify(imageMapping, null, 2));
}

// Main image generation workflow
async function generateServiceImages(): Promise<void> {
  console.log('🚀 Starting Service Image Generation\n');
  
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  const generatedImages: Record<string, any> = {};
  
  for (const template of SERVICE_TEMPLATES) {
    const categoryDir = path.join(baseDir, template.category);
    
    if (!generatedImages[template.category]) {
      generatedImages[template.category] = {};
    }
    
    console.log(`\n📸 Processing ${template.category}/${template.subcategory}`);
    
    // Generate hero image
    const heroPrompt = generateProfessionalPrompt(template, 'wide-angle');
    const heroPath = path.join(categoryDir, `${template.subcategory}-hero.jpg`);
    
    // Try to generate with AI service
    let imageBuffer = await generateWithVertexAI(heroPrompt);
    
    if (!imageBuffer) {
      imageBuffer = await generateWithAlternativeService(heroPrompt);
    }
    
    if (imageBuffer) {
      // Process real generated image
      await processGeneratedImage(imageBuffer, heroPath, IMAGE_CONFIG.sizes.hero);
      
      // Generate additional sizes
      for (const [sizeName, dimensions] of Object.entries(IMAGE_CONFIG.sizes)) {
        if (sizeName !== 'hero') {
          const sizePath = path.join(categoryDir, `${template.subcategory}-${sizeName}.jpg`);
          await processGeneratedImage(imageBuffer, sizePath, dimensions);
        }
      }
    } else {
      // Generate placeholders for now
      console.log('⚠️  Generating placeholder images');
      
      for (const [sizeName, dimensions] of Object.entries(IMAGE_CONFIG.sizes)) {
        const placeholderPath = path.join(categoryDir, `${template.subcategory}-${sizeName}.jpg`);
        await generatePlaceholder(
          `${template.category}\n${template.subcategory}`,
          dimensions,
          placeholderPath
        );
      }
    }
    
    generatedImages[template.category][template.subcategory] = {
      hero: `${template.subcategory}-hero.jpg`,
      thumbnail: `${template.subcategory}-thumbnail.jpg`,
      card: `${template.subcategory}-card.jpg`,
      mobile: `${template.subcategory}-mobile.jpg`
    };
  }
  
  // Save image mapping
  const mappingPath = path.join(baseDir, 'generated-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(generatedImages, null, 2));
  
  // Update service catalog
  updateServiceCatalog(generatedImages);
  
  console.log('\n✨ Image generation complete!');
  console.log(`📁 Images saved to: ${baseDir}`);
  console.log(`📍 Mapping saved to: ${mappingPath}`);
}

// Batch optimization for existing images
async function optimizeExistingImages(): Promise<void> {
  const baseDir = path.join(__dirname, '../../shared-assets/images/services');
  const categories = fs.readdirSync(baseDir).filter(f => 
    fs.statSync(path.join(baseDir, f)).isDirectory()
  );
  
  for (const category of categories) {
    const categoryDir = path.join(baseDir, category);
    const images = fs.readdirSync(categoryDir).filter(f => 
      f.endsWith('.jpg') || f.endsWith('.png')
    );
    
    for (const image of images) {
      const imagePath = path.join(categoryDir, image);
      const optimizedPath = imagePath.replace(/\.(jpg|png)$/, '-optimized.jpg');
      
      try {
        await sharp(imagePath)
          .jpeg({ quality: IMAGE_CONFIG.quality, progressive: true })
          .toFile(optimizedPath);
          
        console.log(`✅ Optimized: ${image}`);
      } catch (error) {
        console.error(`❌ Error optimizing ${image}:`, error);
      }
    }
  }
}

// Generate service image component
function generateImageComponent(): void {
  const componentContent = `import Image from 'next/image';

interface ServiceImageProps {
  category: string;
  subcategory: string;
  variant?: 'hero' | 'thumbnail' | 'card' | 'mobile';
  alt?: string;
  className?: string;
  priority?: boolean;
}

export function ServiceImage({
  category,
  subcategory,
  variant = 'card',
  alt,
  className = '',
  priority = false
}: ServiceImageProps) {
  const imagePath = \`/shared-assets/images/services/\${category}/\${subcategory}-\${variant}.jpg\`;
  const fallbackPath = '/shared-assets/images/services/placeholder.jpg';
  
  const dimensions = {
    hero: { width: 1920, height: 1080 },
    thumbnail: { width: 800, height: 800 },
    card: { width: 400, height: 300 },
    mobile: { width: 375, height: 200 }
  };
  
  const { width, height } = dimensions[variant];
  
  return (
    <div className={\`relative overflow-hidden \${className}\`}>
      <Image
        src={imagePath}
        alt={alt || \`\${category} - \${subcategory} service\`}
        width={width}
        height={height}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackPath;
        }}
        className="object-cover w-full h-full"
      />
    </div>
  );
}

export default ServiceImage;`;

  const componentPath = path.join(__dirname, '../components/ServiceImage.tsx');
  fs.writeFileSync(componentPath, componentContent);
  console.log(`🧩 Service image component created at: ${componentPath}`);
}

// Main execution
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'generate':
      await generateServiceImages();
      break;
    case 'optimize':
      await optimizeExistingImages();
      break;
    case 'component':
      generateImageComponent();
      break;
    default:
      console.log('Usage: npm run images [generate|optimize|component]');
      console.log('  generate - Generate new service images');
      console.log('  optimize - Optimize existing images');
      console.log('  component - Create React component for service images');
  }
}

if (import.meta.url === `file://${__filename}`) {
  main().catch(console.error);
}

export { generateServiceImages, optimizeExistingImages };