// Original Service Catalog - Now redirects to comprehensive version
// For the complete catalog, see comprehensive-services-catalog.ts

export interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceUnit: 'fixed' | 'hourly' | 'sqft' | 'perUnit';
  duration: string;
  requiresLicense: boolean;
  licenseType?: string;
  popularityScore?: number;
  tags?: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: ServiceSubcategory[];
  availableFor: ('residential' | 'commercial' | 'both')[];
  featured?: boolean;
}

// Use the original catalog as the main catalog
export const SERVICE_CATALOG = ORIGINAL_CATALOG;
export const COMPREHENSIVE_SERVICE_CATALOG = ORIGINAL_CATALOG;

// Original catalog kept for reference
const ORIGINAL_CATALOG: ServiceCategory[] = [
  // HOME MAINTENANCE & REPAIR
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    description: 'Licensed electrical services for all your power needs',
    availableFor: ['both'],
    featured: true,
    subcategories: [
      {
        id: 'electrical-repair',
        name: 'Electrical Repair',
        description: 'Fix outlets, switches, and electrical issues',
        basePrice: 125,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: true,
        licenseType: 'Electrical License',
        tags: ['emergency', 'repair']
      },
      {
        id: 'panel-upgrade',
        name: 'Panel Upgrade',
        description: 'Upgrade electrical panel for modern power needs',
        basePrice: 2500,
        priceUnit: 'fixed',
        duration: '4-8 hours',
        requiresLicense: true,
        licenseType: 'Master Electrician',
        tags: ['upgrade', 'safety']
      },
      {
        id: 'ev-charger-install',
        name: 'EV Charger Installation',
        description: 'Install electric vehicle charging station',
        basePrice: 1500,
        priceUnit: 'fixed',
        duration: '3-5 hours',
        requiresLicense: true,
        licenseType: 'Electrical License',
        tags: ['green', 'installation']
      },
      {
        id: 'lighting-install',
        name: 'Lighting Installation',
        description: 'Install indoor/outdoor lighting fixtures',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: true,
        licenseType: 'Electrical License',
        tags: ['installation', 'upgrade']
      },
      {
        id: 'smart-home-wiring',
        name: 'Smart Home Wiring',
        description: 'Wire smart switches, thermostats, and devices',
        basePrice: 175,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: true,
        licenseType: 'Electrical License',
        tags: ['smart-home', 'installation']
      },
      {
        id: 'generator-install',
        name: 'Generator Installation',
        description: 'Install backup generator system',
        basePrice: 3500,
        priceUnit: 'fixed',
        duration: '6-8 hours',
        requiresLicense: true,
        licenseType: 'Master Electrician',
        tags: ['installation', 'emergency-prep']
      }
    ]
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: '🔧',
    description: 'Professional plumbing services',
    availableFor: ['both'],
    featured: true,
    subcategories: [
      {
        id: 'drain-cleaning',
        name: 'Drain Cleaning',
        description: 'Clear clogged drains and pipes',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'Plumbing License',
        tags: ['emergency', 'repair']
      },
      {
        id: 'leak-repair',
        name: 'Leak Repair',
        description: 'Fix water leaks in pipes and fixtures',
        basePrice: 125,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: true,
        licenseType: 'Plumbing License',
        tags: ['emergency', 'repair']
      },
      {
        id: 'water-heater',
        name: 'Water Heater Service',
        description: 'Repair or replace water heaters',
        basePrice: 1200,
        priceUnit: 'fixed',
        duration: '3-5 hours',
        requiresLicense: true,
        licenseType: 'Plumbing License',
        tags: ['installation', 'repair']
      },
      {
        id: 'toilet-repair',
        name: 'Toilet Repair/Install',
        description: 'Fix or install toilets',
        basePrice: 250,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'Plumbing License',
        tags: ['repair', 'installation']
      },
      {
        id: 'sewer-line',
        name: 'Sewer Line Service',
        description: 'Repair or replace sewer lines',
        basePrice: 300,
        priceUnit: 'hourly',
        duration: '4-8 hours',
        requiresLicense: true,
        licenseType: 'Master Plumber',
        tags: ['repair', 'emergency']
      }
    ]
  },
  {
    id: 'hvac',
    name: 'HVAC',
    icon: '❄️',
    description: 'Heating and cooling services',
    availableFor: ['both'],
    featured: true,
    subcategories: [
      {
        id: 'ac-repair',
        name: 'AC Repair',
        description: 'Fix air conditioning issues',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: true,
        licenseType: 'HVAC License',
        tags: ['emergency', 'repair']
      },
      {
        id: 'hvac-maintenance',
        name: 'HVAC Tune-Up',
        description: 'Seasonal maintenance service',
        basePrice: 120,
        priceUnit: 'fixed',
        duration: '1 hour',
        requiresLicense: true,
        licenseType: 'HVAC License',
        tags: ['maintenance', 'preventive']
      },
      {
        id: 'duct-cleaning',
        name: 'Duct Cleaning',
        description: 'Clean air ducts for better air quality',
        basePrice: 350,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['cleaning', 'health']
      },
      {
        id: 'hvac-install',
        name: 'HVAC System Install',
        description: 'Install new heating/cooling system',
        basePrice: 5000,
        priceUnit: 'fixed',
        duration: '1-2 days',
        requiresLicense: true,
        licenseType: 'HVAC License',
        tags: ['installation', 'upgrade']
      }
    ]
  },

  // CLEANING SERVICES
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: '🧹',
    description: 'Professional cleaning services',
    availableFor: ['both'],
    featured: true,
    subcategories: [
      {
        id: 'house-cleaning',
        name: 'House Cleaning',
        description: 'Regular home cleaning service',
        basePrice: 40,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['recurring', 'residential']
      },
      {
        id: 'deep-cleaning',
        name: 'Deep Cleaning',
        description: 'Thorough one-time cleaning',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '4-6 hours',
        requiresLicense: false,
        tags: ['one-time', 'thorough']
      },
      {
        id: 'move-in-out',
        name: 'Move In/Out Cleaning',
        description: 'Complete cleaning for moving',
        basePrice: 300,
        priceUnit: 'fixed',
        duration: '4-8 hours',
        requiresLicense: false,
        tags: ['moving', 'thorough']
      },
      {
        id: 'office-cleaning',
        name: 'Office Cleaning',
        description: 'Commercial office cleaning',
        basePrice: 0.15,
        priceUnit: 'sqft',
        duration: 'Varies',
        requiresLicense: false,
        tags: ['commercial', 'recurring']
      },
      {
        id: 'window-cleaning',
        name: 'Window Cleaning',
        description: 'Interior and exterior windows',
        basePrice: 15,
        priceUnit: 'perUnit',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['specialized', 'detail']
      },
      {
        id: 'carpet-cleaning',
        name: 'Carpet Cleaning',
        description: 'Professional carpet steam cleaning',
        basePrice: 50,
        priceUnit: 'perUnit',
        duration: '2-3 hours',
        requiresLicense: false,
        tags: ['specialized', 'deep-clean']
      }
    ]
  },

  // PERSONAL SERVICES
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '💇',
    description: 'Mobile personal care services',
    availableFor: ['residential'],
    subcategories: [
      {
        id: 'mobile-haircut',
        name: 'Mobile Haircut',
        description: 'Professional haircut at your location',
        basePrice: 50,
        priceUnit: 'fixed',
        duration: '30-45 min',
        requiresLicense: true,
        licenseType: 'Cosmetology License',
        tags: ['personal', 'convenience']
      },
      {
        id: 'mobile-barber',
        name: 'Mobile Barber',
        description: 'Full barber services at home',
        basePrice: 60,
        priceUnit: 'fixed',
        duration: '45-60 min',
        requiresLicense: true,
        licenseType: 'Barber License',
        tags: ['personal', 'grooming']
      },
      {
        id: 'mobile-nails',
        name: 'Mobile Nail Service',
        description: 'Manicure and pedicure at home',
        basePrice: 80,
        priceUnit: 'fixed',
        duration: '60-90 min',
        requiresLicense: true,
        licenseType: 'Nail Technician License',
        tags: ['personal', 'beauty']
      },
      {
        id: 'mobile-massage',
        name: 'Mobile Massage',
        description: 'Professional massage therapy at home',
        basePrice: 120,
        priceUnit: 'hourly',
        duration: '60-90 min',
        requiresLicense: true,
        licenseType: 'Massage Therapy License',
        tags: ['wellness', 'relaxation']
      },
      {
        id: 'personal-trainer',
        name: 'Personal Training',
        description: 'In-home fitness training',
        basePrice: 80,
        priceUnit: 'hourly',
        duration: '60 min',
        requiresLicense: false,
        tags: ['fitness', 'health']
      }
    ]
  },

  // AUTOMOTIVE SERVICES
  {
    id: 'automotive',
    name: 'Automotive',
    icon: '🚗',
    description: 'Mobile car care services',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'mobile-car-wash',
        name: 'Mobile Car Wash',
        description: 'Professional car wash at your location',
        basePrice: 30,
        priceUnit: 'fixed',
        duration: '30-45 min',
        requiresLicense: false,
        tags: ['convenience', 'regular']
      },
      {
        id: 'mobile-detailing',
        name: 'Mobile Auto Detailing',
        description: 'Complete interior and exterior detailing',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['premium', 'thorough']
      },
      {
        id: 'oil-change',
        name: 'Mobile Oil Change',
        description: 'Oil change service at your location',
        basePrice: 60,
        priceUnit: 'fixed',
        duration: '30 min',
        requiresLicense: false,
        tags: ['maintenance', 'convenience']
      },
      {
        id: 'tire-service',
        name: 'Mobile Tire Service',
        description: 'Tire rotation, repair, or replacement',
        basePrice: 80,
        priceUnit: 'fixed',
        duration: '45-60 min',
        requiresLicense: false,
        tags: ['repair', 'safety']
      },
      {
        id: 'battery-service',
        name: 'Battery Jump/Replace',
        description: 'Jump start or battery replacement',
        basePrice: 50,
        priceUnit: 'fixed',
        duration: '30 min',
        requiresLicense: false,
        tags: ['emergency', 'repair']
      }
    ]
  },

  // PET SERVICES
  {
    id: 'pet-care',
    name: 'Pet Care',
    icon: '🐕',
    description: 'Professional pet care services',
    availableFor: ['residential'],
    subcategories: [
      {
        id: 'dog-walking',
        name: 'Dog Walking',
        description: 'Professional dog walking service',
        basePrice: 25,
        priceUnit: 'fixed',
        duration: '30 min',
        requiresLicense: false,
        tags: ['recurring', 'exercise']
      },
      {
        id: 'pet-sitting',
        name: 'Pet Sitting',
        description: 'In-home pet care while youre away',
        basePrice: 40,
        priceUnit: 'fixed',
        duration: 'Per visit',
        requiresLicense: false,
        tags: ['care', 'trust']
      },
      {
        id: 'mobile-grooming',
        name: 'Mobile Pet Grooming',
        description: 'Full grooming service at your home',
        basePrice: 75,
        priceUnit: 'fixed',
        duration: '60-90 min',
        requiresLicense: false,
        tags: ['grooming', 'convenience']
      },
      {
        id: 'pet-training',
        name: 'Pet Training',
        description: 'Professional dog training sessions',
        basePrice: 100,
        priceUnit: 'hourly',
        duration: '60 min',
        requiresLicense: false,
        tags: ['training', 'behavior']
      },
      {
        id: 'pet-waste-removal',
        name: 'Pet Waste Removal',
        description: 'Regular yard waste cleanup',
        basePrice: 15,
        priceUnit: 'fixed',
        duration: '15-30 min',
        requiresLicense: false,
        tags: ['cleaning', 'recurring']
      }
    ]
  },

  // HANDYMAN SERVICES
  {
    id: 'handyman',
    name: 'Handyman',
    icon: '🔨',
    description: 'General repair and maintenance',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'furniture-assembly',
        name: 'Furniture Assembly',
        description: 'Assemble furniture and fixtures',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        tags: ['assembly', 'installation']
      },
      {
        id: 'tv-mounting',
        name: 'TV Mounting',
        description: 'Mount TVs and hide cables',
        basePrice: 120,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        tags: ['installation', 'tech']
      },
      {
        id: 'drywall-repair',
        name: 'Drywall Repair',
        description: 'Fix holes and damage in walls',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['repair', 'maintenance']
      },
      {
        id: 'painting-touch-up',
        name: 'Painting & Touch-ups',
        description: 'Small painting projects',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: false,
        tags: ['painting', 'maintenance']
      },
      {
        id: 'general-repairs',
        name: 'General Repairs',
        description: 'Various small repairs',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: 'Varies',
        requiresLicense: false,
        tags: ['repair', 'general']
      }
    ]
  },

  // LANDSCAPING & LAWN CARE
  {
    id: 'landscaping',
    name: 'Landscaping',
    icon: '🌿',
    description: 'Lawn and garden services',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'lawn-mowing',
        name: 'Lawn Mowing',
        description: 'Regular grass cutting service',
        basePrice: 40,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        tags: ['recurring', 'maintenance']
      },
      {
        id: 'yard-cleanup',
        name: 'Yard Cleanup',
        description: 'Seasonal yard cleaning',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['seasonal', 'cleaning']
      },
      {
        id: 'tree-trimming',
        name: 'Tree Trimming',
        description: 'Trim trees and large shrubs',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: true,
        licenseType: 'Arborist License',
        tags: ['specialized', 'safety']
      },
      {
        id: 'sprinkler-repair',
        name: 'Sprinkler Repair',
        description: 'Fix irrigation systems',
        basePrice: 80,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        tags: ['repair', 'water']
      },
      {
        id: 'landscape-design',
        name: 'Landscape Design',
        description: 'Professional landscape planning',
        basePrice: 500,
        priceUnit: 'fixed',
        duration: 'Consultation',
        requiresLicense: false,
        tags: ['design', 'planning']
      }
    ]
  },

  // PEST CONTROL
  {
    id: 'pest-control',
    name: 'Pest Control',
    icon: '🐛',
    description: 'Professional pest management',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'general-pest',
        name: 'General Pest Control',
        description: 'Treat common household pests',
        basePrice: 120,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: true,
        licenseType: 'Pest Control License',
        tags: ['treatment', 'prevention']
      },
      {
        id: 'termite-inspection',
        name: 'Termite Inspection',
        description: 'Professional termite inspection',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'Pest Control License',
        tags: ['inspection', 'prevention']
      },
      {
        id: 'rodent-control',
        name: 'Rodent Control',
        description: 'Remove and prevent rodents',
        basePrice: 200,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'Pest Control License',
        tags: ['removal', 'prevention']
      },
      {
        id: 'bee-removal',
        name: 'Bee/Wasp Removal',
        description: 'Safe removal of stinging insects',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'Pest Control License',
        tags: ['removal', 'safety']
      }
    ]
  },

  // MOVING & STORAGE
  {
    id: 'moving',
    name: 'Moving & Labor',
    icon: '📦',
    description: 'Moving and heavy lifting help',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'moving-help',
        name: 'Moving Help',
        description: 'Labor for loading/unloading',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '2-8 hours',
        requiresLicense: false,
        tags: ['labor', 'moving']
      },
      {
        id: 'furniture-moving',
        name: 'Furniture Moving',
        description: 'Move furniture within home',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        tags: ['labor', 'rearranging']
      },
      {
        id: 'junk-removal',
        name: 'Junk Removal',
        description: 'Haul away unwanted items',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        tags: ['removal', 'cleanup']
      },
      {
        id: 'donation-pickup',
        name: 'Donation Pickup',
        description: 'Pick up items for donation',
        basePrice: 50,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        tags: ['pickup', 'charity']
      }
    ]
  },

  // CONTRACTOR SERVICES (B2B)
  {
    id: 'contractor-services',
    name: 'Contractor Services',
    icon: '👷',
    description: 'Services for other contractors',
    availableFor: ['commercial'],
    subcategories: [
      {
        id: 'site-survey',
        name: 'Site Survey',
        description: 'Professional site assessment for solar/construction',
        basePrice: 300,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['survey', 'assessment']
      },
      {
        id: 'cad-design',
        name: 'CAD Design Services',
        description: 'Technical drawings and plans',
        basePrice: 100,
        priceUnit: 'hourly',
        duration: 'Varies',
        requiresLicense: false,
        tags: ['design', 'technical']
      },
      {
        id: 'permit-expediting',
        name: 'Permit Expediting',
        description: 'Help obtain building permits',
        basePrice: 500,
        priceUnit: 'fixed',
        duration: 'Varies',
        requiresLicense: false,
        tags: ['permits', 'compliance']
      },
      {
        id: 'drone-inspection',
        name: 'Drone Inspection',
        description: 'Aerial photography and inspection',
        basePrice: 250,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'FAA Part 107',
        tags: ['inspection', 'aerial']
      },
      {
        id: 'project-photography',
        name: 'Project Photography',
        description: 'Before/after photos for contractors',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        tags: ['photography', 'documentation']
      }
    ]
  },

  // TECH SERVICES
  {
    id: 'tech-support',
    name: 'Tech Support',
    icon: '💻',
    description: 'Technology help and setup',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'computer-repair',
        name: 'Computer Repair',
        description: 'Fix computer hardware/software issues',
        basePrice: 80,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        tags: ['repair', 'tech']
      },
      {
        id: 'wifi-setup',
        name: 'WiFi Setup & Troubleshooting',
        description: 'Set up or fix internet issues',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        tags: ['setup', 'network']
      },
      {
        id: 'smart-home-setup',
        name: 'Smart Home Setup',
        description: 'Install and configure smart devices',
        basePrice: 75,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        tags: ['smart-home', 'setup']
      },
      {
        id: 'home-theater',
        name: 'Home Theater Setup',
        description: 'Install and calibrate AV systems',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: false,
        tags: ['entertainment', 'setup']
      }
    ]
  },

  // HOME SECURITY
  {
    id: 'security',
    name: 'Home Security',
    icon: '🔒',
    description: 'Security and safety services',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'lock-change',
        name: 'Lock Change/Rekey',
        description: 'Change or rekey locks',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: true,
        licenseType: 'Locksmith License',
        tags: ['security', 'emergency']
      },
      {
        id: 'security-camera',
        name: 'Security Camera Install',
        description: 'Install surveillance cameras',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '3-6 hours',
        requiresLicense: false,
        tags: ['security', 'installation']
      },
      {
        id: 'alarm-system',
        name: 'Alarm System Service',
        description: 'Install or service alarm systems',
        basePrice: 200,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: true,
        licenseType: 'Alarm Installer License',
        tags: ['security', 'safety']
      }
    ]
  }
];

// Helper functions for service management
export function getAllServices(): ServiceSubcategory[] {
  return ORIGINAL_CATALOG.flatMap(category => 
    category.subcategories.map(sub => ({
      ...sub,
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon
    }))
  );
}

export function getServicesByCategory(categoryId: string): ServiceSubcategory[] {
  const category = ORIGINAL_CATALOG.find(c => c.id === categoryId);
  return category?.subcategories || [];
}

export function getServiceById(serviceId: string): (ServiceSubcategory & {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
}) | null {
  for (const category of ORIGINAL_CATALOG) {
    const service = category.subcategories.find(s => s.id === serviceId);
    if (service) {
      return {
        ...service,
        categoryId: category.id,
        categoryName: category.name,
        categoryIcon: category.icon
      };
    }
  }
  return null;
}

export function getServicesForType(type: 'residential' | 'commercial'): ServiceCategory[] {
  return ORIGINAL_CATALOG.filter(category => 
    category.availableFor.includes(type) || category.availableFor.includes('both')
  );
}

export function searchServices(query: string): ServiceSubcategory[] {
  const lowerQuery = query.toLowerCase();
  return getAllServices().filter(service => 
    service.name.toLowerCase().includes(lowerQuery) ||
    service.description.toLowerCase().includes(lowerQuery) ||
    service.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getLicensedServices(): ServiceSubcategory[] {
  return getAllServices().filter(service => service.requiresLicense);
}

export function getFeaturedCategories(): ServiceCategory[] {
  return ORIGINAL_CATALOG.filter(category => category.featured === true);
}