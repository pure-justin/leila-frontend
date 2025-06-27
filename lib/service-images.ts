// High-quality service images catalog
// Using multiple CDNs for variety and availability

export interface ServiceImage {
  url: string;
  alt: string;
  credit?: string;
}

// Category hero images - beautiful, lifestyle shots
export const CATEGORY_HERO_IMAGES: Record<string, ServiceImage> = {
  'electrical': {
    url: 'https://images.unsplash.com/photo-1565608087341-404b25492fee?w=1200&h=800&fit=crop&q=80',
    alt: 'Professional electrician working on modern home lighting'
  },
  'plumbing': {
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&h=800&fit=crop&q=80',
    alt: 'Modern bathroom with elegant fixtures'
  },
  'hvac': {
    url: 'https://images.unsplash.com/photo-1631545806609-24040d63f79d?w=1200&h=800&fit=crop&q=80',
    alt: 'Modern HVAC system installation'
  },
  'cleaning': {
    url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=1200&h=800&fit=crop&q=80',
    alt: 'Sparkling clean modern home interior'
  },
  'landscaping': {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop&q=80',
    alt: 'Beautiful landscaped garden with flowers'
  },
  'pest-control': {
    url: 'https://images.unsplash.com/photo-1569405780657-e13620a42aca?w=1200&h=800&fit=crop&q=80',
    alt: 'Professional pest control service'
  },
  'handyman': {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&h=800&fit=crop&q=80',
    alt: 'Handyman with professional tools'
  },
  'painting': {
    url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&h=800&fit=crop&q=80',
    alt: 'Professional painter working on interior wall'
  },
  'personal-care': {
    url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=800&fit=crop&q=80',
    alt: 'Relaxing spa and beauty treatment'
  },
  'pet-care': {
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=800&fit=crop&q=80',
    alt: 'Happy dog being groomed professionally'
  },
  'automotive': {
    url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&h=800&fit=crop&q=80',
    alt: 'Professional auto detailing service'
  },
  'moving': {
    url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1200&h=800&fit=crop&q=80',
    alt: 'Professional movers handling furniture'
  },
  'tech-support': {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop&q=80',
    alt: 'Tech support helping with computer setup'
  },
  'security': {
    url: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&h=800&fit=crop&q=80',
    alt: 'Modern home security system'
  },
  'contractor-services': {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop&q=80',
    alt: 'Professional contractor team at work'
  }
};

// Specific service images - appetizing, professional shots
export const SERVICE_IMAGES: Record<string, ServiceImage> = {
  // Electrical Services
  'electrical-inspection': {
    url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop&q=80',
    alt: 'Electrical panel inspection'
  },
  'outlet-installation': {
    url: 'https://images.unsplash.com/photo-1565608087341-404b25492fee?w=800&h=600&fit=crop&q=80',
    alt: 'Installing electrical outlet'
  },
  'lighting-installation': {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
    alt: 'Modern lighting installation'
  },
  'electrical-repair': {
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&h=600&fit=crop&q=80',
    alt: 'Electrical repair work'
  },

  // Plumbing Services
  'leak-repair': {
    url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop&q=80',
    alt: 'Fixing water leak'
  },
  'drain-cleaning': {
    url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600&fit=crop&q=80',
    alt: 'Professional drain cleaning'
  },
  'toilet-repair': {
    url: 'https://images.unsplash.com/photo-1604709177225-055f99402ea3?w=800&h=600&fit=crop&q=80',
    alt: 'Toilet repair service'
  },
  'water-heater': {
    url: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4b3?w=800&h=600&fit=crop&q=80',
    alt: 'Water heater installation'
  },

  // HVAC Services
  'ac-repair': {
    url: 'https://images.unsplash.com/photo-1631545806609-24040d63f79d?w=800&h=600&fit=crop&q=80',
    alt: 'Air conditioner repair'
  },
  'hvac-maintenance': {
    url: 'https://images.unsplash.com/photo-1626662055740-7c3d1c043a46?w=800&h=600&fit=crop&q=80',
    alt: 'HVAC system maintenance'
  },
  'furnace-repair': {
    url: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=800&h=600&fit=crop&q=80',
    alt: 'Furnace repair service'
  },

  // Cleaning Services
  'deep-cleaning': {
    url: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600&fit=crop&q=80',
    alt: 'Deep house cleaning'
  },
  'carpet-cleaning': {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
    alt: 'Professional carpet cleaning'
  },
  'window-cleaning': {
    url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&h=600&fit=crop&q=80',
    alt: 'Window cleaning service'
  },
  'move-out-cleaning': {
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop&q=80',
    alt: 'Move out cleaning service'
  },

  // Landscaping Services
  'lawn-mowing': {
    url: 'https://images.unsplash.com/photo-1592417817038-d13fd7342605?w=800&h=600&fit=crop&q=80',
    alt: 'Professional lawn mowing'
  },
  'garden-design': {
    url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop&q=80',
    alt: 'Beautiful garden design'
  },
  'tree-trimming': {
    url: 'https://images.unsplash.com/photo-1563714272638-82bc29bb5c8e?w=800&h=600&fit=crop&q=80',
    alt: 'Tree trimming service'
  },
  'leaf-removal': {
    url: 'https://images.unsplash.com/photo-1509060698828-4a551c134112?w=800&h=600&fit=crop&q=80',
    alt: 'Fall leaf removal'
  },

  // Handyman Services
  'furniture-assembly': {
    url: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=600&fit=crop&q=80',
    alt: 'Furniture assembly service'
  },
  'tv-mounting': {
    url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&h=600&fit=crop&q=80',
    alt: 'TV wall mounting'
  },
  'drywall-repair': {
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=600&fit=crop&q=80',
    alt: 'Drywall repair service'
  },

  // Personal Care
  'haircut-home': {
    url: 'https://images.unsplash.com/photo-1599351431613-18ef1fdd27e3?w=800&h=600&fit=crop&q=80',
    alt: 'Home haircut service'
  },
  'massage-therapy': {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop&q=80',
    alt: 'Professional massage therapy'
  },
  'nail-service': {
    url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop&q=80',
    alt: 'Professional nail service'
  },

  // Pet Care
  'dog-walking': {
    url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop&q=80',
    alt: 'Professional dog walking'
  },
  'pet-grooming': {
    url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=600&fit=crop&q=80',
    alt: 'Pet grooming service'
  },
  'pet-sitting': {
    url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop&q=80',
    alt: 'Pet sitting service'
  },

  // Automotive
  'car-wash': {
    url: 'https://images.unsplash.com/photo-1590767187868-b8e9ece0ebb2?w=800&h=600&fit=crop&q=80',
    alt: 'Professional car wash'
  },
  'oil-change': {
    url: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800&h=600&fit=crop&q=80',
    alt: 'Mobile oil change service'
  },
  'auto-detailing': {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&q=80',
    alt: 'Auto detailing service'
  },

  // Moving Services
  'full-service-moving': {
    url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop&q=80',
    alt: 'Full service moving'
  },
  'packing-service': {
    url: 'https://images.unsplash.com/photo-1609743522653-52354461eb7f?w=800&h=600&fit=crop&q=80',
    alt: 'Professional packing service'
  },

  // Default fallback
  'default': {
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80',
    alt: 'Professional home service'
  }
};

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  return SERVICE_IMAGES[serviceId] || SERVICE_IMAGES['default'];
}

// Get category hero image
export function getCategoryHeroImage(categoryId: string): ServiceImage {
  return CATEGORY_HERO_IMAGES[categoryId] || CATEGORY_HERO_IMAGES['contractor-services'];
}

// Image loading states
export const IMAGE_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOCIgaGVpZ2h0PSI2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjYiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';