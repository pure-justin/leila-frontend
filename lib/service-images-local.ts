// Local service images configuration
// These images are AI-generated and stored locally for optimal performance

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Simple fallback for service image mapping
const getImageMapping = (serviceId: string) => {
  // Return a fallback image based on service ID
  return {
    url: '/images/services/handyman/home-maintenance-1.webp',
    alt: 'Professional service'
  };
};

// Category hero images - using our AI-generated images
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = {
  'electrical': {
    url: '/images/services/electrical/electrical-panel-upgrade-1.webp',
    alt: 'Professional electrician working on modern electrical panel',
    credit: 'AI Generated'
  },
  'plumbing': {
    url: '/images/services/plumbing/faucet-repair-installation-1.webp',
    alt: 'Expert plumber installing modern faucet in luxury kitchen',
    credit: 'AI Generated'
  },
  'hvac': {
    url: '/images/services/hvac/ac-installation-repair-1.webp',
    alt: 'HVAC technician installing energy-efficient air conditioning',
    credit: 'AI Generated'
  },
  'cleaning': {
    url: '/images/services/cleaning/house-cleaning-1.webp',
    alt: 'Professional house cleaner using eco-friendly products',
    credit: 'AI Generated'
  },
  'landscaping': {
    url: '/images/services/landscaping/lawn-care-1.webp',
    alt: 'Professional landscaper maintaining perfect lawn',
    credit: 'AI Generated'
  },
  'handyman': {
    url: '/images/services/handyman/home-maintenance-1.webp',
    alt: 'Skilled handyman with professional tools',
    credit: 'AI Generated'
  },
  'appliance': {
    url: '/images/services/appliance/refrigerator-repair-hero.jpg',
    alt: 'Technician repairing modern smart refrigerator',
    credit: 'AI Generated'
  },
  'pest-control': {
    url: '/images/services/pest-control/general-inspection-1.webp',
    alt: 'Licensed pest control specialist performing inspection',
    credit: 'AI Generated'
  },
  'automotive': {
    url: '/images/services/automotive/general-maintenance-1.webp',
    alt: 'Professional auto mechanic performing maintenance',
    credit: 'AI Generated'
  },
  'moving': {
    url: '/images/services/moving/local-moving-1.webp',
    alt: 'Professional moving team handling belongings with care',
    credit: 'AI Generated'
  },
  'home-security': {
    url: '/images/services/home-security/security-camera-1.webp',
    alt: 'Modern home security system installation',
    credit: 'AI Generated'
  },
  'event-services': {
    url: '/images/services/event-services/event-planning-1.webp',
    alt: 'Professional event planning and coordination',
    credit: 'AI Generated'
  },
  'pet-care': {
    url: '/images/services/pet-care/dog-walking-1.webp',
    alt: 'Professional pet care services',
    credit: 'AI Generated'
  },
  'tech-support': {
    url: '/images/services/tech-support/computer-repair-1.webp',
    alt: 'Expert computer and tech support services',
    credit: 'AI Generated'
  },
  'personal-care': {
    url: '/images/services/personal-care/massage-therapy-1.webp',
    alt: 'Professional personal care services',
    credit: 'AI Generated'
  },
  'tutoring': {
    url: '/images/services/tutoring/academic-tutoring-1.webp',
    alt: 'Professional tutoring and education services',
    credit: 'AI Generated'
  },
  'senior-care': {
    url: '/images/services/senior-care/companionship-1.webp',
    alt: 'Compassionate senior care services',
    credit: 'AI Generated'
  },
  'organization': {
    url: '/images/services/organization/home-organizing-1.webp',
    alt: 'Professional home organization services',
    credit: 'AI Generated'
  },
  'seasonal': {
    url: '/images/services/seasonal/holiday-decorating-1.webp',
    alt: 'Seasonal and holiday services',
    credit: 'AI Generated'
  },
  'miscellaneous': {
    url: '/images/services/miscellaneous/errand-running-1.webp',
    alt: 'Various home service solutions',
    credit: 'AI Generated'
  }
};

// Service-specific images
export const SERVICE_IMAGES: Record<string, ServiceImage> = {};

// Default fallback image
export const DEFAULT_SERVICE_IMAGE: ServiceImage = {
  url: '/images/services/placeholder.jpg',
  alt: 'Leila Home Services',
  credit: 'AI Generated'
};

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  const mapping = getImageMapping(serviceId);
  
  // Try multiple naming patterns
  const patterns = [
    `${mapping.subcategory}-1-thumb.webp`,
    `${mapping.subcategory}-1-thumb.png`,
    `${mapping.subcategory}-thumbnail.jpg`,
    `${mapping.subcategory}-card.jpg`,
    `${mapping.subcategory}-1.webp`,
    `${mapping.subcategory}-1.png`
  ];
  
  // Use the first pattern as default (will be handled by image component fallback)
  const imageUrl = `/shared-assets/images/services/${mapping.category}/${patterns[0]}`;
  
  return {
    url: imageUrl,
    alt: `${serviceId} service`,
    credit: 'AI Generated'
  };
}

// Get service thumbnail
export function getServiceThumbnail(serviceId: string): ServiceImage {
  const mapping = getImageMapping(serviceId);
  
  // Try multiple thumbnail patterns - prefer webp for better performance
  const patterns = [
    `${mapping.subcategory}-1-thumb.webp`,
    `${mapping.subcategory}-1-thumb.png`,
    `${mapping.subcategory}-thumbnail.jpg`,
    `${mapping.subcategory}-card.jpg`,
    `${mapping.subcategory}-1.png`
  ];
  
  const imageUrl = `/shared-assets/images/services/${mapping.category}/${patterns[0]}`;
  
  return {
    url: imageUrl,
    alt: `${serviceId} service thumbnail`,
    credit: 'AI Generated'
  };
}

// Get service hero image
export function getServiceHeroImage(serviceId: string): ServiceImage {
  const mapping = getImageMapping(serviceId);
  
  // Try multiple hero patterns - prefer webp and large versions
  const patterns = [
    `${mapping.subcategory}-1-large.webp`,
    `${mapping.subcategory}-1-large.png`,
    `${mapping.subcategory}-hero.jpg`,
    `${mapping.subcategory}-1.webp`,
    `${mapping.subcategory}-1.png`,
    `${mapping.subcategory}-card.jpg`
  ];
  
  const imageUrl = `/shared-assets/images/services/${mapping.category}/${patterns[0]}`;
  
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