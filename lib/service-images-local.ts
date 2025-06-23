// Local service images configuration
// These images are AI-generated and stored locally for optimal performance

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Import the service image mapping
import { getServiceImage as getImageMapping } from './service-image-mapping';

// Category hero images - using our AI-generated images
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = {
  'electrical': {
    url: '/shared-assets/images/services/electrical/panel-upgrade-hero.jpg',
    alt: 'Professional electrician working on modern electrical panel',
    credit: 'AI Generated'
  },
  'plumbing': {
    url: '/shared-assets/images/services/plumbing/faucet-repair-hero.jpg',
    alt: 'Expert plumber installing modern faucet in luxury kitchen',
    credit: 'AI Generated'
  },
  'hvac': {
    url: '/shared-assets/images/services/hvac/ac-installation-hero.jpg',
    alt: 'HVAC technician installing energy-efficient air conditioning',
    credit: 'AI Generated'
  },
  'cleaning': {
    url: '/shared-assets/images/services/cleaning/house-cleaning-hero.jpg',
    alt: 'Professional house cleaner using eco-friendly products',
    credit: 'AI Generated'
  },
  'landscaping': {
    url: '/shared-assets/images/services/landscaping/lawn-care-hero.jpg',
    alt: 'Professional landscaper maintaining perfect lawn',
    credit: 'AI Generated'
  },
  'handyman': {
    url: '/shared-assets/images/services/handyman/general-repair-hero.jpg',
    alt: 'Skilled handyman with professional tools',
    credit: 'AI Generated'
  },
  'appliance': {
    url: '/shared-assets/images/services/appliance/refrigerator-repair-hero.jpg',
    alt: 'Technician repairing modern smart refrigerator',
    credit: 'AI Generated'
  },
  'pest-control': {
    url: '/shared-assets/images/services/pest-control/inspection-hero.jpg',
    alt: 'Licensed pest control specialist performing inspection',
    credit: 'AI Generated'
  }
};

// Service-specific images
export const SERVICE_IMAGES: Record<string, ServiceImage> = {};

// Default fallback image
export const DEFAULT_SERVICE_IMAGE: ServiceImage = {
  url: '/shared-assets/images/services/placeholder.svg',
  alt: 'Leila Home Services',
  credit: 'AI Generated'
};

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  const mapping = getImageMapping(serviceId);
  // Use the base image name with -1.png suffix
  const imageUrl = `/shared-assets/images/services/${mapping.category}/${mapping.subcategory}-1.png`;
  
  return {
    url: imageUrl,
    alt: `${serviceId} service`,
    credit: 'AI Generated'
  };
}

// Get service thumbnail
export function getServiceThumbnail(serviceId: string): ServiceImage {
  const mapping = getImageMapping(serviceId);
  // Use the -thumb.png suffix
  const imageUrl = `/shared-assets/images/services/${mapping.category}/${mapping.subcategory}-1-thumb.png`;
  
  return {
    url: imageUrl,
    alt: `${serviceId} service thumbnail`,
    credit: 'AI Generated'
  };
}

// Get service hero image
export function getServiceHeroImage(serviceId: string): ServiceImage {
  const mapping = getImageMapping(serviceId);
  // Use the -large.png suffix for hero images
  const imageUrl = `/shared-assets/images/services/${mapping.category}/${mapping.subcategory}-1-large.png`;
  
  return {
    url: imageUrl,
    alt: `${serviceId} service hero`,
    credit: 'AI Generated'
  };
}

// Get category hero image with fallback
export function getCategoryHeroImage(categoryId: string): ServiceImage {
  return CATEGORY_HERO_IMAGES[categoryId] || DEFAULT_SERVICE_IMAGE;
}

// Helper to map service to category
function getCategoryForService(serviceId: string): string {
  const categoryMap: Record<string, string> = {
    'electrical-repair': 'electrical',
    'panel-upgrade': 'electrical',
    'ev-charger-install': 'electrical',
    'lighting-install': 'electrical',
    'ceiling-fan-install': 'electrical',
    
    'leak-repair': 'plumbing',
    'drain-cleaning': 'plumbing',
    'toilet-repair': 'plumbing',
    'water-heater-install': 'plumbing',
    
    'ac-repair': 'hvac',
    'furnace-repair': 'hvac',
    'hvac-maintenance': 'hvac',
    
    'house-cleaning': 'cleaning',
    'deep-cleaning': 'cleaning',
    'carpet-cleaning': 'cleaning',
    
    'lawn-mowing': 'landscaping',
    'tree-trimming': 'landscaping',
    'garden-design': 'landscaping',
    
    'furniture-assembly': 'handyman',
    'tv-mounting': 'handyman',
    'drywall-repair': 'handyman',
    
    'interior-painting': 'painting',
    'exterior-painting': 'painting',
    'cabinet-painting': 'painting'
  };
  
  return categoryMap[serviceId] || 'contractor-services';
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

// Image loading states
export const IMAGE_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';