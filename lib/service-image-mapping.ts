// Service Image Mapping
// Maps service IDs to their corresponding image categories and subcategories

export const SERVICE_IMAGE_MAPPING: Record<string, { category: string; subcategory: string }> = {
  // Electrical Services
  'electrical-repair': { category: 'electrical', subcategory: 'outlet-repair-installation' },
  'panel-upgrade': { category: 'electrical', subcategory: 'electrical-panel-upgrade' },
  'ev-charger-install': { category: 'electrical', subcategory: 'smart-home-installation' },
  'lighting-install': { category: 'electrical', subcategory: 'lighting-installation' },
  'ceiling-fan-install': { category: 'electrical', subcategory: 'ceiling-fan-installation' },
  'smart-home-wiring': { category: 'electrical', subcategory: 'smart-home-installation' },
  'generator-install': { category: 'electrical', subcategory: 'electrical-panel-upgrade' },
  'security-system-wiring': { category: 'electrical', subcategory: 'smart-home-installation' },
  'surge-protection': { category: 'electrical', subcategory: 'electrical-panel-upgrade' },
  'outlet-installation': { category: 'electrical', subcategory: 'outlet-repair-installation' },
  
  // Plumbing Services
  'pipe-repair': { category: 'plumbing', subcategory: 'pipe-installation' },
  'drain-cleaning': { category: 'plumbing', subcategory: 'drain-cleaning' },
  'water-heater-install': { category: 'plumbing', subcategory: 'water-heater' },
  'toilet-repair': { category: 'plumbing', subcategory: 'faucet-repair' },
  'faucet-install': { category: 'plumbing', subcategory: 'faucet-repair' },
  'sewer-line-repair': { category: 'plumbing', subcategory: 'pipe-installation' },
  'water-softener-install': { category: 'plumbing', subcategory: 'water-heater' },
  'garbage-disposal': { category: 'plumbing', subcategory: 'drain-cleaning' },
  'bathroom-plumbing': { category: 'plumbing', subcategory: 'faucet-repair' },
  'emergency-plumbing': { category: 'plumbing', subcategory: 'pipe-installation' },
  
  // HVAC Services
  'ac-repair': { category: 'hvac', subcategory: 'ac-installation' },
  'furnace-repair': { category: 'hvac', subcategory: 'furnace-repair' },
  'hvac-maintenance': { category: 'hvac', subcategory: 'ac-installation' },
  'duct-cleaning': { category: 'hvac', subcategory: 'duct-cleaning' },
  'thermostat-install': { category: 'hvac', subcategory: 'ac-installation' },
  'air-quality-testing': { category: 'hvac', subcategory: 'duct-cleaning' },
  'mini-split-install': { category: 'hvac', subcategory: 'ac-installation' },
  'heat-pump-install': { category: 'hvac', subcategory: 'furnace-repair' },
  'ventilation-install': { category: 'hvac', subcategory: 'duct-cleaning' },
  'hvac-inspection': { category: 'hvac', subcategory: 'ac-installation' },
  
  // Handyman Services
  'general-repair': { category: 'handyman', subcategory: 'general-repair' },
  'furniture-assembly': { category: 'handyman', subcategory: 'furniture-assembly' },
  'tv-mounting': { category: 'handyman', subcategory: 'general-repair' },
  'shelf-installation': { category: 'handyman', subcategory: 'furniture-assembly' },
  'door-repair': { category: 'handyman', subcategory: 'general-repair' },
  'window-repair': { category: 'handyman', subcategory: 'general-repair' },
  'drywall-repair': { category: 'handyman', subcategory: 'painting' },
  'picture-hanging': { category: 'handyman', subcategory: 'general-repair' },
  'cabinet-install': { category: 'handyman', subcategory: 'furniture-assembly' },
  'misc-repairs': { category: 'handyman', subcategory: 'general-repair' },
  
  // Cleaning Services
  'house-cleaning': { category: 'cleaning', subcategory: 'house-cleaning' },
  'deep-cleaning': { category: 'cleaning', subcategory: 'deep-cleaning' },
  'move-out-cleaning': { category: 'cleaning', subcategory: 'deep-cleaning' },
  'carpet-cleaning': { category: 'cleaning', subcategory: 'carpet-cleaning' },
  'window-cleaning': { category: 'cleaning', subcategory: 'house-cleaning' },
  'pressure-washing': { category: 'cleaning', subcategory: 'house-cleaning' },
  'gutter-cleaning': { category: 'cleaning', subcategory: 'house-cleaning' },
  'garage-cleaning': { category: 'cleaning', subcategory: 'deep-cleaning' },
  'attic-cleaning': { category: 'cleaning', subcategory: 'deep-cleaning' },
  'post-construction': { category: 'cleaning', subcategory: 'deep-cleaning' },
  
  // Landscaping Services
  'lawn-mowing': { category: 'landscaping', subcategory: 'lawn-care' },
  'landscaping-design': { category: 'landscaping', subcategory: 'garden-design' },
  'tree-trimming': { category: 'landscaping', subcategory: 'tree-service' },
  'mulching': { category: 'landscaping', subcategory: 'lawn-care' },
  'fertilization': { category: 'landscaping', subcategory: 'lawn-care' },
  'sprinkler-install': { category: 'landscaping', subcategory: 'garden-design' },
  'sod-installation': { category: 'landscaping', subcategory: 'lawn-care' },
  'hardscaping': { category: 'landscaping', subcategory: 'garden-design' },
  'landscape-lighting': { category: 'landscaping', subcategory: 'garden-design' },
  'tree-removal': { category: 'landscaping', subcategory: 'tree-service' },
  
  // Appliance Repair
  'refrigerator-repair': { category: 'appliance', subcategory: 'refrigerator-repair' },
  'washer-repair': { category: 'appliance', subcategory: 'washer-repair' },
  'dryer-repair': { category: 'appliance', subcategory: 'washer-repair' },
  'dishwasher-repair': { category: 'appliance', subcategory: 'refrigerator-repair' },
  'oven-repair': { category: 'appliance', subcategory: 'refrigerator-repair' },
  'microwave-repair': { category: 'appliance', subcategory: 'refrigerator-repair' },
  'freezer-repair': { category: 'appliance', subcategory: 'refrigerator-repair' },
  'garbage-disposal-repair': { category: 'appliance', subcategory: 'refrigerator-repair' },
  'appliance-install': { category: 'appliance', subcategory: 'washer-repair' },
  'appliance-maintenance': { category: 'appliance', subcategory: 'refrigerator-repair' },
  
  // Pest Control
  'pest-inspection': { category: 'pest-control', subcategory: 'inspection' },
  'ant-control': { category: 'pest-control', subcategory: 'treatment' },
  'termite-treatment': { category: 'pest-control', subcategory: 'treatment' },
  'rodent-control': { category: 'pest-control', subcategory: 'treatment' },
  'spider-control': { category: 'pest-control', subcategory: 'treatment' },
  'bee-removal': { category: 'pest-control', subcategory: 'treatment' },
  'mosquito-control': { category: 'pest-control', subcategory: 'treatment' },
  'cockroach-control': { category: 'pest-control', subcategory: 'treatment' },
  'wildlife-removal': { category: 'pest-control', subcategory: 'treatment' },
  'preventive-treatment': { category: 'pest-control', subcategory: 'inspection' },
  
  // Default fallback for any unmapped services
  'default': { category: 'handyman', subcategory: 'general-repair' }
};

export function getServiceImage(serviceId: string): { category: string; subcategory: string } {
  return SERVICE_IMAGE_MAPPING[serviceId] || SERVICE_IMAGE_MAPPING['default'];
}