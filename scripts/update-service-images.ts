import { pexelsService, SERVICE_SEARCH_QUERIES } from '../lib/pexels-service';
import { COMPREHENSIVE_SERVICE_CATALOG } from '../lib/comprehensive-services-catalog';
import fs from 'fs/promises';
import path from 'path';

interface ServiceImageMapping {
  serviceId: string;
  serviceName: string;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  photographerCredit: string;
  pexelsUrl: string;
}

async function updateServiceImages() {
  console.log('🎨 Starting service image update from Pexels...\n');
  
  const serviceImageMappings: ServiceImageMapping[] = [];
  const failedServices: string[] = [];

  // Process each category
  for (const category of COMPREHENSIVE_SERVICE_CATALOG) {
    console.log(`\n📁 Processing category: ${category.name}`);
    
    // Process each subcategory/service
    for (const service of category.subcategories) {
      console.log(`  🔍 Searching for: ${service.name} (${service.id})`);
      
      try {
        const photo = await pexelsService.getBestServicePhoto(service.id);
        
        if (photo) {
          const mapping: ServiceImageMapping = {
            serviceId: service.id,
            serviceName: service.name,
            categoryId: category.id,
            categoryName: category.name,
            imageUrl: photo.src.large,
            photographerCredit: `Photo by ${photo.photographer} on Pexels`,
            pexelsUrl: photo.url
          };
          
          serviceImageMappings.push(mapping);
          console.log(`    ✅ Found image: ${photo.alt || 'No description'}`);
        } else {
          failedServices.push(`${service.name} (${service.id})`);
          console.log(`    ❌ No suitable image found`);
        }
        
        // Rate limiting - Pexels allows 200 requests per hour
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`    ❌ Error: ${error}`);
        failedServices.push(`${service.name} (${service.id})`);
      }
    }
  }

  // Generate the new service images file
  const serviceImagesContent = generateServiceImagesFile(serviceImageMappings);
  
  // Save the updated file
  const outputPath = path.join(__dirname, '../lib/service-images-pexels.ts');
  await fs.writeFile(outputPath, serviceImagesContent);
  
  console.log('\n✅ Service images updated successfully!');
  console.log(`📊 Total services processed: ${serviceImageMappings.length}`);
  
  if (failedServices.length > 0) {
    console.log(`\n⚠️  Failed to find images for ${failedServices.length} services:`);
    failedServices.forEach(service => console.log(`  - ${service}`));
  }
  
  // Save a JSON report
  const reportPath = path.join(__dirname, '../lib/service-images-report.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalServices: serviceImageMappings.length,
    failedServices,
    mappings: serviceImageMappings
  }, null, 2));
  
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

function generateServiceImagesFile(mappings: ServiceImageMapping[]): string {
  const categoryImages: Record<string, any> = {};
  const serviceImages: Record<string, any> = {};
  
  // Group by category for hero images
  mappings.forEach(mapping => {
    if (!categoryImages[mapping.categoryId]) {
      categoryImages[mapping.categoryId] = {
        url: mapping.imageUrl,
        alt: `Professional ${mapping.categoryName.toLowerCase()} services`,
        credit: mapping.photographerCredit
      };
    }
    
    serviceImages[mapping.serviceId] = {
      url: mapping.imageUrl,
      alt: mapping.serviceName,
      credit: mapping.photographerCredit
    };
  });
  
  return `// Auto-generated service images from Pexels
// Generated on: ${new Date().toISOString()}
// Total images: ${mappings.length}

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Category hero images - beautiful, lifestyle shots
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = ${JSON.stringify(categoryImages, null, 2)};

// Specific service images - professional shots
export const SERVICE_IMAGES: Record<string, ServiceImage> = ${JSON.stringify(serviceImages, null, 2)};

// Default fallback image
export const DEFAULT_SERVICE_IMAGE: ServiceImage = {
  url: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  alt: 'Professional home service',
  credit: 'Photo by Pixabay on Pexels'
};

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  return SERVICE_IMAGES[serviceId] || DEFAULT_SERVICE_IMAGE;
}

// Get category hero image
export function getCategoryHeroImage(categoryId: string): ServiceImage {
  return CATEGORY_HERO_IMAGES[categoryId] || DEFAULT_SERVICE_IMAGE;
}

// Image loading states
export const IMAGE_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
`;
}

// Add more search queries if some services don't have them
const additionalQueries: Record<string, string[]> = {
  // Add any missing service IDs here
  'pressure-washing': ['pressure washing service', 'power washing', 'driveway cleaning'],
  'solar-panel-install': ['solar panel installation', 'solar energy', 'rooftop solar'],
  'pool-cleaning': ['pool cleaning service', 'swimming pool maintenance', 'pool care'],
  'appliance-repair': ['appliance repair', 'fixing appliances', 'home appliance service'],
  'roofing': ['roofing contractor', 'roof repair', 'shingle replacement'],
  'flooring': ['flooring installation', 'hardwood floors', 'tile installation'],
  'kitchen-remodel': ['kitchen renovation', 'kitchen remodeling', 'modern kitchen'],
  'bathroom-remodel': ['bathroom renovation', 'bathroom remodeling', 'modern bathroom']
};

// Merge additional queries
Object.assign(SERVICE_SEARCH_QUERIES, additionalQueries);

// Run the update if this file is executed directly
if (require.main === module) {
  updateServiceImages().catch(console.error);
}

export { updateServiceImages };