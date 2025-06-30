// Simplified Service Catalog for Testing

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
  category?: string;
  rating?: number;
  includesSupplies?: boolean;
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

// Simplified catalog with just essential services
export const COMPREHENSIVE_SERVICE_CATALOG: ServiceCategory[] = [
  {
    id: 'electrical',
    name: 'Electrical',
    icon: '⚡',
    description: 'Licensed electrical services',
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
        skillLevel: 'professional',
        popularityScore: 0.8
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
        id: 'leak-repair',
        name: 'Leak Repair',
        description: 'Fix water leaks and pipe issues',
        basePrice: 150,
        priceUnit: 'hourly',
        duration: '1-2 hours',
        requiresLicense: true,
        skillLevel: 'professional',
        popularityScore: 0.9
      }
    ]
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: '🧽',
    description: 'Professional cleaning services',
    availableFor: ['both'],
    featured: true,
    subcategories: [
      {
        id: 'house-cleaning',
        name: 'House Cleaning',
        description: 'Complete home cleaning service',
        basePrice: 120,
        priceUnit: 'fixed',
        duration: '2-4 hours',
        requiresLicense: false,
        skillLevel: 'entry',
        popularityScore: 0.95
      }
    ]
  }
];

// Helper function to get service by ID
export function getServiceById(serviceId: string): ServiceSubcategory | null {
  for (const category of COMPREHENSIVE_SERVICE_CATALOG) {
    const service = category.subcategories.find(s => s.id === serviceId);
    if (service) return service;
  }
  return null;
}