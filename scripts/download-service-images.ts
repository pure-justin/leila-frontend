import axios from 'axios';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { CATEGORY_HERO_IMAGES, SERVICE_IMAGES } from '../lib/professional-service-images';

// Create directories if they don't exist
async function ensureDirectoryExists(dirPath: string) {
  try {
    await fsPromises.access(dirPath);
  } catch {
    await fsPromises.mkdir(dirPath, { recursive: true });
  }
}

// Download image from URL
async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    const writer = fs.createWriteStream(filepath);
    (response.data as NodeJS.ReadableStream).pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error);
    throw error;
  }
}

// Main download function
async function downloadAllServiceImages() {
  console.log('🎨 Starting download of all service images...\n');

  // Create base directories
  const baseDir = path.join(__dirname, '..', 'public', 'assets', 'services');
  const categoriesDir = path.join(baseDir, 'categories');
  const servicesDir = path.join(baseDir, 'services');

  await ensureDirectoryExists(categoriesDir);
  await ensureDirectoryExists(servicesDir);

  // Track statistics
  let totalDownloaded = 0;
  let failedDownloads: string[] = [];

  // Download category hero images
  console.log('📁 Downloading category hero images...');
  for (const [categoryId, imageData] of Object.entries(CATEGORY_HERO_IMAGES)) {
    try {
      console.log(`  Downloading: ${categoryId}`);
      const filename = `${categoryId}-hero.jpg`;
      const filepath = path.join(categoriesDir, filename);
      
      await downloadImage(imageData.url, filepath);
      totalDownloaded++;
      console.log(`    ✅ Saved: ${filename}`);
    } catch (error) {
      failedDownloads.push(`Category: ${categoryId}`);
      console.log(`    ❌ Failed: ${categoryId}`);
    }
  }

  // Download service-specific images
  console.log('\n🔧 Downloading service-specific images...');
  for (const [serviceId, imageData] of Object.entries(SERVICE_IMAGES)) {
    try {
      console.log(`  Downloading: ${serviceId}`);
      const filename = `${serviceId}.jpg`;
      const filepath = path.join(servicesDir, filename);
      
      await downloadImage(imageData.url, filepath);
      totalDownloaded++;
      console.log(`    ✅ Saved: ${filename}`);
    } catch (error) {
      failedDownloads.push(`Service: ${serviceId}`);
      console.log(`    ❌ Failed: ${serviceId}`);
    }

    // Add small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Generate updated service images configuration pointing to local assets
  const localImagesConfig = generateLocalImagesConfig();
  const configPath = path.join(__dirname, '..', 'lib', 'service-images-local.ts');
  await fsPromises.writeFile(configPath, localImagesConfig);

  // Summary
  console.log('\n✅ Download complete!');
  console.log(`📊 Total images downloaded: ${totalDownloaded}`);
  
  if (failedDownloads.length > 0) {
    console.log(`\n⚠️  Failed downloads: ${failedDownloads.length}`);
    failedDownloads.forEach(item => console.log(`  - ${item}`));
  }

  console.log(`\n📁 Images saved to: ${baseDir}`);
  console.log(`📄 Local config saved to: ${configPath}`);
}

// Generate TypeScript config for local images
function generateLocalImagesConfig(): string {
  const categoryEntries = Object.entries(CATEGORY_HERO_IMAGES).map(([id, data]) => {
    return `  '${id}': {
    url: '/assets/services/categories/${id}-hero.jpg',
    alt: '${data.alt}',
    credit: '${data.credit || ''}'
  }`;
  }).join(',\n');

  const serviceEntries = Object.entries(SERVICE_IMAGES).map(([id, data]) => {
    return `  '${id}': {
    url: '/assets/services/services/${id}.jpg',
    alt: '${data.alt}',
    credit: '${data.credit || ''}'
  }`;
  }).join(',\n');

  return `// Local service images configuration
// Auto-generated from downloaded Pexels images
// Generated on: ${new Date().toISOString()}

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Category hero images - beautiful, lifestyle shots
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = {
${categoryEntries}
};

// Specific service images - professional shots
export const SERVICE_IMAGES: Record<string, ServiceImage> = {
${serviceEntries}
};

// Default fallback image
export const DEFAULT_SERVICE_IMAGE: ServiceImage = {
  url: '/assets/services/services/default.jpg',
  alt: 'Professional home service',
  credit: 'Photo by Pixabay on Pexels'
};

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  return SERVICE_IMAGES[serviceId] || DEFAULT_SERVICE_IMAGE;
}

// Get category hero image with fallback
export function getCategoryHeroImage(categoryId: string): ServiceImage {
  return CATEGORY_HERO_IMAGES[categoryId] || CATEGORY_HERO_IMAGES['contractor-services'];
}

// Get multiple images for a service (for galleries)
export function getServiceGallery(serviceId: string, count: number = 3): ServiceImage[] {
  const images: ServiceImage[] = [];
  const mainImage = getServiceImage(serviceId);
  images.push(mainImage);
  
  // Add category image if different
  const categoryId = getCategoryForService(serviceId);
  const categoryImage = getCategoryHeroImage(categoryId);
  if (categoryImage.url !== mainImage.url) {
    images.push(categoryImage);
  }
  
  // Add default if needed
  if (images.length < count && mainImage.url !== DEFAULT_SERVICE_IMAGE.url) {
    images.push(DEFAULT_SERVICE_IMAGE);
  }
  
  return images.slice(0, count);
}

// Helper to map service to category
function getCategoryForService(serviceId: string): string {
  const categoryMap: Record<string, string> = {
    'electrical-repair': 'electrical',
    'panel-upgrade': 'electrical',
    'ev-charger-install': 'electrical',
    'lighting-install': 'electrical',
    'ceiling-fan-install': 'electrical',
    'outlet-switch-repair': 'electrical',
    'wiring-install': 'electrical',
    'generator-install': 'electrical',
    
    'leak-repair': 'plumbing',
    'drain-cleaning': 'plumbing',
    'toilet-repair': 'plumbing',
    'water-heater-install': 'plumbing',
    'faucet-install': 'plumbing',
    'pipe-repair': 'plumbing',
    'sewer-repair': 'plumbing',
    'garbage-disposal': 'plumbing',
    
    'ac-repair': 'hvac',
    'furnace-repair': 'hvac',
    'hvac-maintenance': 'hvac',
    'duct-cleaning': 'hvac',
    'thermostat-install': 'hvac',
    'ac-install': 'hvac',
    'heat-pump-service': 'hvac',
    'air-quality': 'hvac',
    
    'house-cleaning': 'cleaning',
    'deep-cleaning': 'cleaning',
    'move-cleaning': 'cleaning',
    'carpet-cleaning': 'cleaning',
    'window-cleaning': 'cleaning',
    'pressure-washing': 'cleaning',
    'office-cleaning': 'cleaning',
    'post-construction': 'cleaning',
    
    'lawn-mowing': 'landscaping',
    'tree-trimming': 'landscaping',
    'garden-design': 'landscaping',
    'sprinkler-install': 'landscaping',
    'sod-installation': 'landscaping',
    'mulching': 'landscaping',
    'leaf-removal': 'landscaping',
    'landscape-lighting': 'landscaping',
    
    'general-pest': 'pest-control',
    'termite-control': 'pest-control',
    'rodent-control': 'pest-control',
    'ant-control': 'pest-control',
    'mosquito-control': 'pest-control',
    'bed-bug-treatment': 'pest-control',
    'wildlife-removal': 'pest-control',
    'pest-prevention': 'pest-control',
    
    'furniture-assembly': 'handyman',
    'tv-mounting': 'handyman',
    'picture-hanging': 'handyman',
    'shelf-installation': 'handyman',
    'door-repair': 'handyman',
    'drywall-repair': 'handyman',
    'caulking': 'handyman',
    'general-repairs': 'handyman',
    
    'interior-painting': 'painting',
    'exterior-painting': 'painting',
    'cabinet-painting': 'painting',
    'deck-staining': 'painting',
    'wallpaper-removal': 'painting',
    'texture-painting': 'painting',
    'power-washing-paint': 'painting',
    'trim-painting': 'painting'
  };
  
  return categoryMap[serviceId] || 'contractor-services';
}

// Image loading states
export const IMAGE_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
`;
}

// Run the download
downloadAllServiceImages().catch(console.error);