export interface Service {
  basePrice(basePrice: any): import("react").ReactNode;
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
    priceRange: '$150-$500',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'electrical-service',
    name: 'Electrical Service',
    description: 'Electrical repairs, installations, and troubleshooting',
    icon: '⚡',
    category: 'Electrical',
    estimatedDuration: '2-4 hours',
    priceRange: '$200-$800',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'hvac-maintenance',
    name: 'HVAC Maintenance',
    description: 'AC/Heating repair, maintenance, and installation',
    icon: '❄️',
    category: 'HVAC',
    estimatedDuration: '2-6 hours',
    priceRange: '$200-$1500',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    description: 'Professional home cleaning services',
    icon: '🧹',
    category: 'Cleaning',
    estimatedDuration: '2-4 hours',
    priceRange: '$100-$300',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'lawn-care',
    name: 'Lawn Care',
    description: 'Mowing, trimming, landscaping services',
    icon: '🌿',
    category: 'Landscaping',
    estimatedDuration: '1-3 hours',
    priceRange: '$50-$200',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'pest-control',
    name: 'Pest Control',
    description: 'Eliminate pests and prevent infestations',
    icon: '🐛',
    category: 'Pest Control',
    estimatedDuration: '1-2 hours',
    priceRange: '$150-$400',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'appliance-repair',
    name: 'Appliance Repair',
    description: 'Fix washers, dryers, refrigerators, and more',
    icon: '🔌',
    category: 'Appliances',
    estimatedDuration: '1-3 hours',
    priceRange: '$100-$500',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  },
  {
    id: 'painting',
    name: 'Painting Services',
    description: 'Interior and exterior painting',
    icon: '🎨',
    category: 'Painting',
    estimatedDuration: '4-8 hours',
    priceRange: '$300-$2000',
    basePrice: function (basePrice: any): import("react").ReactNode {
      throw new Error("Function not implemented.");
    }
  }
];