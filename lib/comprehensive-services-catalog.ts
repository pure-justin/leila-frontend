// Comprehensive Service Catalog - Professional to Entry Level

export interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  priceUnit: 'fixed' | 'hourly' | 'sqft' | 'perUnit' | 'quote';
  duration: string;
  requiresLicense: boolean;
  licenseType?: string;
  skillLevel: 'entry' | 'intermediate' | 'professional' | 'expert';
  popularityScore?: number;
  tags?: string[];
  ageRequirement?: number;
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

export const COMPREHENSIVE_SERVICE_CATALOG: ServiceCategory[] = [
  // HOME MAINTENANCE & REPAIR - PROFESSIONAL
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
        skillLevel: 'professional',
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
        skillLevel: 'expert',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
        tags: ['installation', 'upgrade']
      },
      {
        id: 'ceiling-fan-install',
        name: 'Ceiling Fan Installation',
        description: 'Install or replace ceiling fans',
        basePrice: 200,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: true,
        licenseType: 'Electrical License',
        skillLevel: 'professional',
        tags: ['installation', 'comfort']
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
        skillLevel: 'professional',
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
        skillLevel: 'expert',
        tags: ['installation', 'emergency-prep']
      },
      {
        id: 'outlet-usb-upgrade',
        name: 'USB Outlet Installation',
        description: 'Upgrade outlets with USB charging ports',
        basePrice: 75,
        priceUnit: 'perUnit',
        duration: '30 min per outlet',
        requiresLicense: true,
        licenseType: 'Electrical License',
        skillLevel: 'professional',
        tags: ['upgrade', 'convenience']
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'expert',
        tags: ['repair', 'emergency']
      },
      {
        id: 'garbage-disposal',
        name: 'Garbage Disposal Install/Repair',
        description: 'Install or fix garbage disposals',
        basePrice: 200,
        priceUnit: 'fixed',
        duration: '1 hour',
        requiresLicense: true,
        licenseType: 'Plumbing License',
        skillLevel: 'professional',
        tags: ['installation', 'repair']
      },
      {
        id: 'water-filter-install',
        name: 'Water Filtration System',
        description: 'Install whole-house or under-sink water filters',
        basePrice: 500,
        priceUnit: 'fixed',
        duration: '2-3 hours',
        requiresLicense: true,
        licenseType: 'Plumbing License',
        skillLevel: 'professional',
        tags: ['installation', 'health']
      },
      {
        id: 'bathroom-remodel-plumbing',
        name: 'Bathroom Plumbing Remodel',
        description: 'Complete bathroom plumbing renovation',
        basePrice: 2500,
        priceUnit: 'quote',
        duration: '2-5 days',
        requiresLicense: true,
        licenseType: 'Master Plumber',
        skillLevel: 'expert',
        tags: ['remodel', 'major-project']
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'expert',
        tags: ['installation', 'upgrade']
      },
      {
        id: 'smart-thermostat',
        name: 'Smart Thermostat Install',
        description: 'Install and program smart thermostats',
        basePrice: 200,
        priceUnit: 'fixed',
        duration: '1 hour',
        requiresLicense: true,
        licenseType: 'HVAC License',
        skillLevel: 'professional',
        tags: ['smart-home', 'energy-saving']
      }
    ]
  },

  // CLEANING SERVICES - MIXED SKILL LEVELS
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: '🧹',
    description: 'Professional and basic cleaning services',
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
        skillLevel: 'entry',
        tags: ['recurring', 'residential'],
        ageRequirement: 16
      },
      {
        id: 'deep-cleaning',
        name: 'Deep Cleaning',
        description: 'Thorough one-time cleaning',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '4-6 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'entry',
        tags: ['commercial', 'recurring'],
        ageRequirement: 16
      },
      {
        id: 'window-cleaning',
        name: 'Window Cleaning',
        description: 'Interior and exterior windows',
        basePrice: 15,
        priceUnit: 'perUnit',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
        tags: ['specialized', 'deep-clean']
      },
      {
        id: 'garage-cleaning',
        name: 'Garage Cleaning & Organization',
        description: 'Clean and organize garage spaces',
        basePrice: 35,
        priceUnit: 'hourly',
        duration: '3-5 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['organization', 'cleaning'],
        ageRequirement: 16
      },
      {
        id: 'post-construction',
        name: 'Post-Construction Cleaning',
        description: 'Clean up after renovations',
        basePrice: 80,
        priceUnit: 'hourly',
        duration: '4-8 hours',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['specialized', 'heavy-duty']
      },
      {
        id: 'pressure-washing',
        name: 'Pressure Washing',
        description: 'Clean driveways, siding, decks',
        basePrice: 0.20,
        priceUnit: 'sqft',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['exterior', 'equipment']
      },
      {
        id: 'gutter-cleaning',
        name: 'Gutter Cleaning',
        description: 'Clear and clean gutters',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['maintenance', 'seasonal']
      }
    ]
  },

  // PERSONAL SERVICES - MIXED
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '💇',
    description: 'Mobile personal care and beauty services',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'intermediate',
        tags: ['fitness', 'health']
      },
      {
        id: 'mobile-makeup',
        name: 'Mobile Makeup Artist',
        description: 'Professional makeup for events',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '60-90 min',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['beauty', 'events']
      },
      {
        id: 'mobile-spa',
        name: 'Mobile Spa Services',
        description: 'Facials and spa treatments at home',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '90-120 min',
        requiresLicense: true,
        licenseType: 'Esthetician License',
        skillLevel: 'professional',
        tags: ['luxury', 'wellness']
      },
      {
        id: 'mobile-yoga',
        name: 'Private Yoga Instruction',
        description: 'Personal yoga sessions',
        basePrice: 75,
        priceUnit: 'hourly',
        duration: '60-75 min',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['wellness', 'fitness']
      }
    ]
  },

  // AUTOMOTIVE SERVICES - MIXED
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
        skillLevel: 'entry',
        tags: ['convenience', 'regular'],
        ageRequirement: 16
      },
      {
        id: 'mobile-detailing',
        name: 'Mobile Auto Detailing',
        description: 'Complete interior and exterior detailing',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'professional',
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
        skillLevel: 'entry',
        tags: ['emergency', 'repair']
      },
      {
        id: 'windshield-repair',
        name: 'Mobile Windshield Repair',
        description: 'Fix chips and cracks',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['repair', 'safety']
      },
      {
        id: 'headlight-restore',
        name: 'Headlight Restoration',
        description: 'Restore foggy headlights',
        basePrice: 80,
        priceUnit: 'fixed',
        duration: '45 min',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['restoration', 'safety']
      }
    ]
  },

  // PET SERVICES - ENTRY TO INTERMEDIATE
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
        skillLevel: 'entry',
        tags: ['recurring', 'exercise'],
        ageRequirement: 14
      },
      {
        id: 'pet-sitting',
        name: 'Pet Sitting',
        description: 'In-home pet care while you\'re away',
        basePrice: 40,
        priceUnit: 'fixed',
        duration: 'Per visit',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['care', 'trust'],
        ageRequirement: 16
      },
      {
        id: 'mobile-grooming',
        name: 'Mobile Pet Grooming',
        description: 'Full grooming service at your home',
        basePrice: 75,
        priceUnit: 'fixed',
        duration: '60-90 min',
        requiresLicense: false,
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'entry',
        tags: ['cleaning', 'recurring'],
        ageRequirement: 14
      },
      {
        id: 'pet-taxi',
        name: 'Pet Transportation',
        description: 'Transport pets to vet, groomer, etc.',
        basePrice: 35,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['transport', 'convenience']
      },
      {
        id: 'pet-feeding',
        name: 'Pet Feeding Visits',
        description: 'Feed pets while owners are away',
        basePrice: 20,
        priceUnit: 'fixed',
        duration: '15-20 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['care', 'short-visit'],
        ageRequirement: 14
      },
      {
        id: 'aquarium-maintenance',
        name: 'Aquarium Maintenance',
        description: 'Clean and maintain fish tanks',
        basePrice: 60,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['specialized', 'maintenance']
      }
    ]
  },

  // HANDYMAN SERVICES - MIXED
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
        skillLevel: 'entry',
        tags: ['assembly', 'installation'],
        ageRequirement: 16
      },
      {
        id: 'tv-mounting',
        name: 'TV Mounting',
        description: 'Mount TVs and hide cables',
        basePrice: 120,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
        tags: ['repair', 'general']
      },
      {
        id: 'picture-hanging',
        name: 'Picture & Art Hanging',
        description: 'Hang pictures, mirrors, artwork',
        basePrice: 40,
        priceUnit: 'hourly',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['installation', 'decor'],
        ageRequirement: 16
      },
      {
        id: 'shelf-installation',
        name: 'Shelf Installation',
        description: 'Install floating shelves and brackets',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['installation', 'organization']
      },
      {
        id: 'door-repair',
        name: 'Door Repair & Adjustment',
        description: 'Fix sticking doors, replace hardware',
        basePrice: 75,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['repair', 'maintenance']
      },
      {
        id: 'baby-proofing',
        name: 'Baby Proofing Installation',
        description: 'Install safety gates, locks, covers',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['safety', 'installation']
      }
    ]
  },

  // LANDSCAPING & LAWN CARE - ENTRY TO PRO
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
        skillLevel: 'entry',
        tags: ['recurring', 'maintenance'],
        ageRequirement: 14
      },
      {
        id: 'yard-cleanup',
        name: 'Yard Cleanup',
        description: 'Seasonal yard cleaning',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'cleaning'],
        ageRequirement: 14
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
        skillLevel: 'professional',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'professional',
        tags: ['design', 'planning']
      },
      {
        id: 'leaf-removal',
        name: 'Leaf Removal',
        description: 'Fall leaf cleanup service',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'cleanup'],
        ageRequirement: 14
      },
      {
        id: 'garden-weeding',
        name: 'Garden Weeding',
        description: 'Remove weeds from gardens',
        basePrice: 30,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['maintenance', 'gardening'],
        ageRequirement: 12
      },
      {
        id: 'mulch-installation',
        name: 'Mulch Installation',
        description: 'Spread mulch in garden beds',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['landscaping', 'maintenance'],
        ageRequirement: 16
      },
      {
        id: 'hedge-trimming',
        name: 'Hedge Trimming',
        description: 'Shape and trim hedges',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['maintenance', 'aesthetics']
      },
      {
        id: 'plant-installation',
        name: 'Plant & Flower Installation',
        description: 'Plant flowers, shrubs, and trees',
        basePrice: 70,
        priceUnit: 'hourly',
        duration: '2-5 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['planting', 'beautification']
      },
      {
        id: 'snow-removal',
        name: 'Snow Removal',
        description: 'Clear driveways and walkways',
        basePrice: 50,
        priceUnit: 'fixed',
        duration: '30-90 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'winter'],
        ageRequirement: 16
      }
    ]
  },

  // PEST CONTROL - PROFESSIONAL
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
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
        skillLevel: 'professional',
        tags: ['removal', 'safety']
      },
      {
        id: 'bed-bug-treatment',
        name: 'Bed Bug Treatment',
        description: 'Eliminate bed bug infestations',
        basePrice: 300,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: true,
        licenseType: 'Pest Control License',
        skillLevel: 'professional',
        tags: ['treatment', 'specialized']
      },
      {
        id: 'mosquito-control',
        name: 'Mosquito Control',
        description: 'Yard treatment for mosquitoes',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '30-45 min',
        requiresLicense: true,
        licenseType: 'Pest Control License',
        skillLevel: 'professional',
        tags: ['outdoor', 'seasonal']
      }
    ]
  },

  // MOVING & STORAGE - ENTRY TO INTERMEDIATE
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
        skillLevel: 'entry',
        tags: ['labor', 'moving'],
        ageRequirement: 18
      },
      {
        id: 'furniture-moving',
        name: 'Furniture Moving',
        description: 'Move furniture within home',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['labor', 'rearranging'],
        ageRequirement: 18
      },
      {
        id: 'junk-removal',
        name: 'Junk Removal',
        description: 'Haul away unwanted items',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['removal', 'cleanup'],
        ageRequirement: 18
      },
      {
        id: 'donation-pickup',
        name: 'Donation Pickup',
        description: 'Pick up items for donation',
        basePrice: 50,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['pickup', 'charity'],
        ageRequirement: 16
      },
      {
        id: 'packing-service',
        name: 'Packing Service',
        description: 'Professional packing assistance',
        basePrice: 40,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['packing', 'organization']
      },
      {
        id: 'storage-organization',
        name: 'Storage Unit Organization',
        description: 'Organize storage units',
        basePrice: 45,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['organization', 'storage']
      }
    ]
  },

  // TECH SERVICES - INTERMEDIATE TO EXPERT
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
        skillLevel: 'professional',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'professional',
        tags: ['entertainment', 'setup']
      },
      {
        id: 'printer-setup',
        name: 'Printer Setup & Repair',
        description: 'Set up or fix printers',
        basePrice: 60,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['setup', 'repair']
      },
      {
        id: 'virus-removal',
        name: 'Virus & Malware Removal',
        description: 'Clean infected computers',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['security', 'repair']
      },
      {
        id: 'data-recovery',
        name: 'Data Recovery',
        description: 'Recover lost or deleted files',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'expert',
        tags: ['recovery', 'specialized']
      },
      {
        id: 'tech-tutoring',
        name: 'Tech Tutoring',
        description: 'One-on-one technology training',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['education', 'support']
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
        skillLevel: 'professional',
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
        skillLevel: 'intermediate',
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
        skillLevel: 'professional',
        tags: ['security', 'safety']
      },
      {
        id: 'doorbell-camera',
        name: 'Smart Doorbell Install',
        description: 'Install video doorbell systems',
        basePrice: 100,
        priceUnit: 'fixed',
        duration: '1 hour',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['smart-home', 'security']
      },
      {
        id: 'safe-installation',
        name: 'Safe Installation',
        description: 'Install home or office safes',
        basePrice: 150,
        priceUnit: 'fixed',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['security', 'installation']
      }
    ]
  },

  // SEASONAL SERVICES - ENTRY LEVEL
  {
    id: 'seasonal',
    name: 'Seasonal Services',
    icon: '🍂',
    description: 'Seasonal and holiday services',
    availableFor: ['residential'],
    subcategories: [
      {
        id: 'holiday-lights',
        name: 'Holiday Light Installation',
        description: 'Install and remove holiday decorations',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'decoration'],
        ageRequirement: 16
      },
      {
        id: 'christmas-tree-setup',
        name: 'Christmas Tree Setup',
        description: 'Deliver and set up Christmas trees',
        basePrice: 75,
        priceUnit: 'fixed',
        duration: '1 hour',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'holiday'],
        ageRequirement: 16
      },
      {
        id: 'pool-opening',
        name: 'Pool Opening/Closing',
        description: 'Seasonal pool maintenance',
        basePrice: 200,
        priceUnit: 'fixed',
        duration: '2-3 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['seasonal', 'pool']
      },
      {
        id: 'patio-furniture',
        name: 'Patio Furniture Setup',
        description: 'Assemble and arrange outdoor furniture',
        basePrice: 40,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'assembly'],
        ageRequirement: 16
      },
      {
        id: 'firewood-stacking',
        name: 'Firewood Stacking',
        description: 'Stack and organize firewood',
        basePrice: 35,
        priceUnit: 'hourly',
        duration: '2-3 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'labor'],
        ageRequirement: 14
      }
    ]
  },

  // ORGANIZATION & DECLUTTERING
  {
    id: 'organization',
    name: 'Organization',
    icon: '📋',
    description: 'Home organization and decluttering',
    availableFor: ['residential'],
    subcategories: [
      {
        id: 'closet-organization',
        name: 'Closet Organization',
        description: 'Organize and optimize closet space',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '3-6 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['organization', 'declutter']
      },
      {
        id: 'pantry-organization',
        name: 'Pantry Organization',
        description: 'Organize kitchen pantry',
        basePrice: 45,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['organization', 'kitchen']
      },
      {
        id: 'garage-organization',
        name: 'Garage Organization',
        description: 'Organize and declutter garage',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '4-8 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['organization', 'declutter']
      },
      {
        id: 'home-staging',
        name: 'Home Staging',
        description: 'Stage home for sale',
        basePrice: 100,
        priceUnit: 'hourly',
        duration: '4-8 hours',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['staging', 'real-estate']
      },
      {
        id: 'digital-organization',
        name: 'Digital File Organization',
        description: 'Organize computer files and photos',
        basePrice: 40,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['digital', 'organization']
      }
    ]
  },

  // ELDERLY CARE SERVICES
  {
    id: 'elderly-care',
    name: 'Senior Services',
    icon: '👵',
    description: 'Services for elderly assistance',
    availableFor: ['residential'],
    subcategories: [
      {
        id: 'companion-care',
        name: 'Companion Care',
        description: 'Companionship and light assistance',
        basePrice: 25,
        priceUnit: 'hourly',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['care', 'companion'],
        ageRequirement: 18
      },
      {
        id: 'grocery-shopping',
        name: 'Grocery Shopping Service',
        description: 'Shop for and deliver groceries',
        basePrice: 35,
        priceUnit: 'hourly',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['shopping', 'assistance'],
        ageRequirement: 16
      },
      {
        id: 'medication-reminder',
        name: 'Medication Reminders',
        description: 'Help with medication schedules',
        basePrice: 30,
        priceUnit: 'fixed',
        duration: '30 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['health', 'assistance']
      },
      {
        id: 'transportation-elderly',
        name: 'Transportation Service',
        description: 'Drive to appointments and errands',
        basePrice: 30,
        priceUnit: 'hourly',
        duration: 'Varies',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['transportation', 'assistance']
      },
      {
        id: 'meal-prep-elderly',
        name: 'Meal Preparation',
        description: 'Prepare healthy meals',
        basePrice: 40,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['cooking', 'nutrition']
      }
    ]
  },

  // TUTORING & EDUCATION
  {
    id: 'tutoring',
    name: 'Tutoring',
    icon: '📚',
    description: 'Educational services',
    availableFor: ['residential'],
    subcategories: [
      {
        id: 'math-tutoring',
        name: 'Math Tutoring',
        description: 'K-12 and college math help',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['education', 'academic']
      },
      {
        id: 'language-tutoring',
        name: 'Language Tutoring',
        description: 'English and foreign language help',
        basePrice: 45,
        priceUnit: 'hourly',
        duration: '1 hour',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['education', 'language']
      },
      {
        id: 'music-lessons',
        name: 'Music Lessons',
        description: 'Piano, guitar, voice lessons',
        basePrice: 60,
        priceUnit: 'hourly',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['music', 'arts']
      },
      {
        id: 'test-prep',
        name: 'Test Prep Tutoring',
        description: 'SAT, ACT, and other test prep',
        basePrice: 75,
        priceUnit: 'hourly',
        duration: '1.5-2 hours',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['test-prep', 'academic']
      },
      {
        id: 'homework-help',
        name: 'Homework Help',
        description: 'General homework assistance',
        basePrice: 35,
        priceUnit: 'hourly',
        duration: '1-2 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['homework', 'academic'],
        ageRequirement: 16
      }
    ]
  },

  // EVENT SERVICES
  {
    id: 'event-services',
    name: 'Event Services',
    icon: '🎉',
    description: 'Party and event assistance',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'party-setup',
        name: 'Party Setup & Breakdown',
        description: 'Set up and clean up events',
        basePrice: 25,
        priceUnit: 'hourly',
        duration: '2-6 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['events', 'setup'],
        ageRequirement: 16
      },
      {
        id: 'bartending',
        name: 'Mobile Bartending',
        description: 'Professional bartending service',
        basePrice: 50,
        priceUnit: 'hourly',
        duration: '4-8 hours',
        requiresLicense: true,
        licenseType: 'Liquor License',
        skillLevel: 'professional',
        tags: ['events', 'service'],
        ageRequirement: 21
      },
      {
        id: 'event-photography',
        name: 'Event Photography',
        description: 'Capture special moments',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '2-8 hours',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['photography', 'events']
      },
      {
        id: 'dj-services',
        name: 'DJ Services',
        description: 'Music and entertainment',
        basePrice: 100,
        priceUnit: 'hourly',
        duration: '4-6 hours',
        requiresLicense: false,
        skillLevel: 'professional',
        tags: ['entertainment', 'music']
      },
      {
        id: 'catering-help',
        name: 'Catering Assistant',
        description: 'Help with food service',
        basePrice: 20,
        priceUnit: 'hourly',
        duration: '4-8 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['food', 'service'],
        ageRequirement: 16
      }
    ]
  },

  // MISCELLANEOUS SERVICES
  {
    id: 'miscellaneous',
    name: 'Other Services',
    icon: '🎯',
    description: 'Various other services',
    availableFor: ['both'],
    subcategories: [
      {
        id: 'errand-running',
        name: 'Errand Running',
        description: 'Run errands and pick up items',
        basePrice: 25,
        priceUnit: 'hourly',
        duration: '1-3 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['errands', 'assistance'],
        ageRequirement: 16
      },
      {
        id: 'gift-wrapping',
        name: 'Gift Wrapping Service',
        description: 'Professional gift wrapping',
        basePrice: 5,
        priceUnit: 'perUnit',
        duration: '5-15 min per gift',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['seasonal', 'service'],
        ageRequirement: 14
      },
      {
        id: 'notary-service',
        name: 'Mobile Notary',
        description: 'Notarize documents at your location',
        basePrice: 50,
        priceUnit: 'fixed',
        duration: '15-30 min',
        requiresLicense: true,
        licenseType: 'Notary Public',
        skillLevel: 'professional',
        tags: ['legal', 'documents']
      },
      {
        id: 'plant-sitting',
        name: 'Plant Care Service',
        description: 'Water and care for plants',
        basePrice: 20,
        priceUnit: 'fixed',
        duration: '15-30 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['plants', 'care'],
        ageRequirement: 14
      },
      {
        id: 'pool-cleaning',
        name: 'Pool Cleaning',
        description: 'Regular pool maintenance',
        basePrice: 80,
        priceUnit: 'fixed',
        duration: '30-60 min',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['pool', 'maintenance']
      },
      {
        id: 'power-washing-fence',
        name: 'Fence & Deck Staining',
        description: 'Stain or seal wood surfaces',
        basePrice: 0.50,
        priceUnit: 'sqft',
        duration: '4-8 hours',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['maintenance', 'preservation']
      },
      {
        id: 'shoe-shining',
        name: 'Mobile Shoe Shine',
        description: 'Professional shoe cleaning',
        basePrice: 15,
        priceUnit: 'perUnit',
        duration: '10-15 min',
        requiresLicense: false,
        skillLevel: 'entry',
        tags: ['personal', 'service'],
        ageRequirement: 14
      },
      {
        id: 'knife-sharpening',
        name: 'Knife Sharpening',
        description: 'Sharpen kitchen and garden tools',
        basePrice: 5,
        priceUnit: 'perUnit',
        duration: '5 min per item',
        requiresLicense: false,
        skillLevel: 'intermediate',
        tags: ['maintenance', 'tools']
      }
    ]
  }
];

// Helper functions
export function getAllServices(): ServiceSubcategory[] {
  return COMPREHENSIVE_SERVICE_CATALOG.flatMap(category => 
    category.subcategories.map(sub => ({
      ...sub,
      categoryId: category.id,
      categoryName: category.name,
      categoryIcon: category.icon
    }))
  );
}

export function getServicesByCategory(categoryId: string): ServiceSubcategory[] {
  const category = COMPREHENSIVE_SERVICE_CATALOG.find(c => c.id === categoryId);
  return category?.subcategories || [];
}

export function getServiceById(serviceId: string): (ServiceSubcategory & {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
}) | null {
  for (const category of COMPREHENSIVE_SERVICE_CATALOG) {
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
  return COMPREHENSIVE_SERVICE_CATALOG.filter(category => 
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

export function getEntryLevelServices(): ServiceSubcategory[] {
  return getAllServices().filter(service => 
    service.skillLevel === 'entry' && 
    (!service.ageRequirement || service.ageRequirement <= 18)
  );
}

export function getSummerJobServices(): ServiceSubcategory[] {
  return getAllServices().filter(service => 
    service.skillLevel === 'entry' && 
    (!service.ageRequirement || service.ageRequirement <= 16) &&
    !service.requiresLicense
  );
}

export function getProfessionalServices(): ServiceSubcategory[] {
  return getAllServices().filter(service => 
    service.skillLevel === 'professional' || 
    service.skillLevel === 'expert' ||
    service.requiresLicense
  );
}

export function getLicensedServices(): ServiceSubcategory[] {
  return getAllServices().filter(service => service.requiresLicense);
}

export function getFeaturedCategories(): ServiceCategory[] {
  return COMPREHENSIVE_SERVICE_CATALOG.filter(category => category.featured === true);
}

export function getServicesBySkillLevel(level: 'entry' | 'intermediate' | 'professional' | 'expert'): ServiceSubcategory[] {
  return getAllServices().filter(service => service.skillLevel === level);
}

export function getServicesByPriceRange(minPrice: number, maxPrice: number): ServiceSubcategory[] {
  return getAllServices().filter(service => {
    if (service.priceUnit === 'quote') return true;
    return service.basePrice >= minPrice && service.basePrice <= maxPrice;
  });
}

// Export the comprehensive catalog as default
export const SERVICE_CATALOG = COMPREHENSIVE_SERVICE_CATALOG;