// Local service images configuration
// These images are stored locally for better performance and reliability

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// For now, we'll use the existing Pexels URLs until all images are downloaded
// To use local images, replace the URLs with paths like: '/assets/services/categories/electrical-hero.jpg'

import { 
  CATEGORY_HERO_IMAGES as PEXELS_CATEGORY_IMAGES, 
  SERVICE_IMAGES as PEXELS_SERVICE_IMAGES,
  getCategoryForService 
} from './professional-service-images';

// Override with local images where available
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = {
  ...PEXELS_CATEGORY_IMAGES,
  // These are downloaded locally
  'electrical': {
    url: '/assets/services/categories/electrical-hero.jpg',
    alt: 'Professional electrician working on electrical panel',
    credit: 'Photo by Pixabay on Pexels'
  },
  'plumbing': {
    url: '/assets/services/categories/plumbing-hero.jpg',
    alt: 'Modern bathroom with elegant plumbing fixtures',
    credit: 'Photo by Max Vakhtbovych on Pexels'
  },
  'hvac': {
    url: '/assets/services/categories/hvac-hero.jpg',
    alt: 'HVAC technician servicing air conditioning unit',
    credit: 'Photo by Gustavo Fring on Pexels'
  }
};

// For service images, we'll continue using Pexels URLs for now
export const SERVICE_IMAGES = PEXELS_SERVICE_IMAGES;

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

// Image loading states
export const IMAGE_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';