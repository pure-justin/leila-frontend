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
  'pipe-repair': { category: 'plumbing', subcategory: 'pipe-repair' },
  'drain-cleaning': { category: 'plumbing', subcategory: 'drain-cleaning' },
  'water-heater-install': { category: 'plumbing', subcategory: 'water-heater-installation' },
  'toilet-repair': { category: 'plumbing', subcategory: 'toilet-repair-installation' },
  'faucet-install': { category: 'plumbing', subcategory: 'faucet-repair-installation' },
  'sewer-line-repair': { category: 'plumbing', subcategory: 'sewer-line-service' },
  'water-softener-install': { category: 'plumbing', subcategory: 'water-heater-installation' },
  'garbage-disposal': { category: 'plumbing', subcategory: 'drain-cleaning' },
  'bathroom-plumbing': { category: 'plumbing', subcategory: 'faucet-repair-installation' },
  'emergency-plumbing': { category: 'plumbing', subcategory: 'emergency-plumbing' },
  
  // HVAC Services
  'ac-repair': { category: 'hvac', subcategory: 'ac-installation-repair' },
  'furnace-repair': { category: 'hvac', subcategory: 'heating-system-repair' },
  'hvac-maintenance': { category: 'hvac', subcategory: 'system-installation' },
  'duct-cleaning': { category: 'hvac', subcategory: 'duct-cleaning' },
  'thermostat-install': { category: 'hvac', subcategory: 'system-installation' },
  'air-quality-testing': { category: 'hvac', subcategory: 'air-quality-testing' },
  'mini-split-install': { category: 'hvac', subcategory: 'system-installation' },
  'heat-pump-install': { category: 'hvac', subcategory: 'heating-system-repair' },
  'ventilation-install': { category: 'hvac', subcategory: 'duct-cleaning' },
  'hvac-inspection': { category: 'hvac', subcategory: 'air-quality-testing' },
  
  // Handyman Services
  'general-repair': { category: 'handyman', subcategory: 'home-maintenance' },
  'furniture-assembly': { category: 'handyman', subcategory: 'furniture-assembly' },
  'tv-mounting': { category: 'handyman', subcategory: 'tv-mounting' },
  'shelf-installation': { category: 'handyman', subcategory: 'shelving-installation' },
  'door-repair': { category: 'handyman', subcategory: 'door-window-repair' },
  'window-repair': { category: 'handyman', subcategory: 'door-window-repair' },
  'drywall-repair': { category: 'handyman', subcategory: 'drywall-repair' },
  'picture-hanging': { category: 'handyman', subcategory: 'picture-hanging' },
  'cabinet-install': { category: 'handyman', subcategory: 'shelving-installation' },
  'misc-repairs': { category: 'handyman', subcategory: 'home-maintenance' },
  
  // Cleaning Services
  'house-cleaning': { category: 'cleaning', subcategory: 'house-cleaning' },
  'deep-cleaning': { category: 'cleaning', subcategory: 'deep-cleaning' },
  'move-out-cleaning': { category: 'cleaning', subcategory: 'deep-cleaning' },
  'carpet-cleaning': { category: 'cleaning', subcategory: 'carpet-cleaning' },
  'window-cleaning': { category: 'cleaning', subcategory: 'window-cleaning' },
  'pressure-washing': { category: 'cleaning', subcategory: 'pressure-washing' },
  'gutter-cleaning': { category: 'cleaning', subcategory: 'gutter-cleaning' },
  'garage-cleaning': { category: 'cleaning', subcategory: 'garage-cleaning' },
  'attic-cleaning': { category: 'cleaning', subcategory: 'attic-basement-cleaning' },
  'post-construction': { category: 'cleaning', subcategory: 'post-construction-cleaning' },
  
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
  'pest-inspection': { category: 'pest-control', subcategory: 'general-inspection' },
  'ant-control': { category: 'pest-control', subcategory: 'ant-control' },
  'termite-treatment': { category: 'pest-control', subcategory: 'termite-inspection' },
  'rodent-control': { category: 'pest-control', subcategory: 'rodent-control' },
  'spider-control': { category: 'pest-control', subcategory: 'ant-control' },
  'bee-removal': { category: 'pest-control', subcategory: 'wasp-bee-removal' },
  'mosquito-control': { category: 'pest-control', subcategory: 'mosquito-control' },
  'cockroach-control': { category: 'pest-control', subcategory: 'ant-control' },
  'wildlife-removal': { category: 'pest-control', subcategory: 'wildlife-removal' },
  'preventive-treatment': { category: 'pest-control', subcategory: 'preventive-treatment' },
  
  // Default fallback for any unmapped services
  'default': { category: 'handyman', subcategory: 'general-repair' }
};

export function getServiceImage(serviceId: string): { category: string; subcategory: string } {
  return SERVICE_IMAGE_MAPPING[serviceId] || SERVICE_IMAGE_MAPPING['default'];
}