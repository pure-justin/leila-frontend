export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  estimatedDuration: string;
  priceRange: string;
}

export const services: Service[] = [
  {
    id: 'plumbing-repair',
    name: 'Plumbing Repair',
    description: 'Fix leaks, unclog drains, repair pipes and fixtures',
    icon: '🔧',
    category: 'Plumbing',
    estimatedDuration: '1-3 hours',
    priceRange: '$150-$500'
  },
  {
    id: 'electrical-service',
    name: 'Electrical Service',
    description: 'Electrical repairs, installations, and troubleshooting',
    icon: '⚡',
    category: 'Electrical',
    estimatedDuration: '2-4 hours',
    priceRange: '$200-$800'
  },
  {
    id: 'hvac-maintenance',
    name: 'HVAC Maintenance',
    description: 'AC/Heating repair, maintenance, and installation',
    icon: '❄️',
    category: 'HVAC',
    estimatedDuration: '2-6 hours',
    priceRange: '$200-$1500'
  },
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    description: 'Professional home cleaning services',
    icon: '🧹',
    category: 'Cleaning',
    estimatedDuration: '2-4 hours',
    priceRange: '$100-$300'
  },
  {
    id: 'lawn-care',
    name: 'Lawn Care',
    description: 'Mowing, trimming, landscaping services',
    icon: '🌿',
    category: 'Landscaping',
    estimatedDuration: '1-3 hours',
    priceRange: '$50-$200'
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Eliminate pests and prevent infestations',
    icon: '🐛',
    category: 'Pest Control',
    estimatedDuration: '1-2 hours',
    priceRange: '$150-$400'
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    description: 'Fix washers, dryers, refrigerators, and more',
    icon: '🔌',
    category: 'Appliances',
    estimatedDuration: '1-3 hours',
    priceRange: '$100-$500'
  },
  {
    id: 'painting',
    name: 'Painting Services',
    description: 'Interior and exterior painting',
    icon: '🎨',
    category: 'Painting',
    estimatedDuration: '4-8 hours',
    priceRange: '$300-$2000'
  },
  {
    id: 'solar-installation',
    name: 'Solar Panel Installation',
    description: 'Complete solar system design and installation',
    icon: '☀️',
    category: 'Solar',
    estimatedDuration: '2-3 days',
    priceRange: '$15,000-$30,000'
  },
  {
    id: 'solar-consultation',
    name: 'Solar Consultation',
    description: 'Free solar potential analysis and savings estimate',
    icon: '📊',
    category: 'Solar',
    estimatedDuration: '1-2 hours',
    priceRange: 'Free'
  },
  {
    id: 'solar-maintenance',
    name: 'Solar Panel Maintenance',
    description: 'Cleaning, inspection, and performance optimization',
    icon: '🔧',
    category: 'Solar',
    estimatedDuration: '2-4 hours',
    priceRange: '$200-$500'
  },
  {
    id: 'roofing-replacement',
    name: 'Roof Replacement',
    description: 'Complete roof replacement with warranty',
    icon: '🏠',
    category: 'Roofing',
    estimatedDuration: '2-5 days',
    priceRange: '$5,000-$15,000'
  },
  {
    id: 'roofing-repair',
    name: 'Roof Repair',
    description: 'Fix leaks, replace shingles, repair damage',
    icon: '🔨',
    category: 'Roofing',
    estimatedDuration: '2-6 hours',
    priceRange: '$300-$2,000'
  },
  {
    id: 'gutter-service',
    name: 'Gutter Cleaning & Repair',
    description: 'Clean, repair, or replace gutters',
    icon: '🏗️',
    category: 'Roofing',
    estimatedDuration: '2-4 hours',
    priceRange: '$150-$500'
  }
];