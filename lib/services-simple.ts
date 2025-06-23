export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  duration: number; // in minutes
}

export const services: Service[] = [
  // Plumbing
  { id: 'drain-cleaning', name: 'Drain Cleaning', category: 'plumbing', description: 'Clear clogged drains', basePrice: 125, duration: 60 },
  { id: 'leak-repair', name: 'Leak Repair', category: 'plumbing', description: 'Fix water leaks', basePrice: 150, duration: 90 },
  { id: 'toilet-repair', name: 'Toilet Repair', category: 'plumbing', description: 'Fix toilet issues', basePrice: 100, duration: 60 },
  { id: 'water-heater-repair', name: 'Water Heater Repair', category: 'plumbing', description: 'Repair water heaters', basePrice: 200, duration: 120 },
  
  // Electrical
  { id: 'outlet-repair', name: 'Outlet Repair', category: 'electrical', description: 'Fix electrical outlets', basePrice: 85, duration: 45 },
  { id: 'light-installation', name: 'Light Installation', category: 'electrical', description: 'Install light fixtures', basePrice: 120, duration: 60 },
  { id: 'circuit-breaker-repair', name: 'Circuit Breaker Repair', category: 'electrical', description: 'Fix circuit breakers', basePrice: 150, duration: 90 },
  { id: 'ceiling-fan-installation', name: 'Ceiling Fan Installation', category: 'electrical', description: 'Install ceiling fans', basePrice: 180, duration: 90 },
  
  // HVAC
  { id: 'ac-repair', name: 'AC Repair', category: 'hvac', description: 'Fix air conditioning', basePrice: 250, duration: 120 },
  { id: 'furnace-repair', name: 'Furnace Repair', category: 'hvac', description: 'Repair heating systems', basePrice: 225, duration: 120 },
  { id: 'hvac-maintenance', name: 'HVAC Maintenance', category: 'hvac', description: 'Routine HVAC service', basePrice: 150, duration: 90 },
  
  // Cleaning
  { id: 'house-cleaning', name: 'House Cleaning', category: 'cleaning', description: 'General house cleaning', basePrice: 120, duration: 180 },
  { id: 'deep-cleaning', name: 'Deep Cleaning', category: 'cleaning', description: 'Thorough deep cleaning', basePrice: 200, duration: 240 },
  { id: 'carpet-cleaning', name: 'Carpet Cleaning', category: 'cleaning', description: 'Professional carpet cleaning', basePrice: 150, duration: 120 },
  
  // Handyman
  { id: 'furniture-assembly', name: 'Furniture Assembly', category: 'handyman', description: 'Assemble furniture', basePrice: 75, duration: 90 },
  { id: 'tv-mounting', name: 'TV Mounting', category: 'handyman', description: 'Mount TV on wall', basePrice: 100, duration: 60 },
  { id: 'drywall-repair', name: 'Drywall Repair', category: 'handyman', description: 'Fix holes in walls', basePrice: 125, duration: 120 },
  { id: 'door-repair', name: 'Door Repair', category: 'handyman', description: 'Fix doors and locks', basePrice: 95, duration: 60 },
  
  // Painting
  { id: 'interior-painting', name: 'Interior Painting', category: 'painting', description: 'Paint interior rooms', basePrice: 300, duration: 480 },
  { id: 'exterior-painting', name: 'Exterior Painting', category: 'painting', description: 'Paint house exterior', basePrice: 500, duration: 960 },
  
  // Landscaping
  { id: 'lawn-mowing', name: 'Lawn Mowing', category: 'landscaping', description: 'Mow and edge lawn', basePrice: 50, duration: 45 },
  { id: 'tree-trimming', name: 'Tree Trimming', category: 'landscaping', description: 'Trim trees and shrubs', basePrice: 150, duration: 120 },
  { id: 'garden-maintenance', name: 'Garden Maintenance', category: 'landscaping', description: 'Maintain gardens', basePrice: 100, duration: 90 },
  
  // Pest Control
  { id: 'pest-inspection', name: 'Pest Inspection', category: 'pest-control', description: 'Inspect for pests', basePrice: 75, duration: 45 },
  { id: 'pest-treatment', name: 'Pest Treatment', category: 'pest-control', description: 'Treat pest problems', basePrice: 150, duration: 60 },
  
  // Moving
  { id: 'local-moving', name: 'Local Moving', category: 'moving', description: 'Move within city', basePrice: 300, duration: 240 },
  { id: 'furniture-moving', name: 'Furniture Moving', category: 'moving', description: 'Move heavy furniture', basePrice: 150, duration: 120 }
];

export const categories = [
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'hvac', name: 'HVAC', icon: '❄️' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'handyman', name: 'Handyman', icon: '🔨' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌿' },
  { id: 'pest-control', name: 'Pest Control', icon: '🐛' },
  { id: 'moving', name: 'Moving', icon: '📦' }
];