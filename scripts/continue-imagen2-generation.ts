import { generateSpecificServiceNoPeople } from './google-imagen2-no-people.js';

// Remaining services to generate
const REMAINING_SERVICES = [
  { category: 'cleaning', subcategory: 'carpet-cleaning' },
  { category: 'handyman', subcategory: 'general-repair' },
  { category: 'handyman', subcategory: 'furniture-assembly' },
  { category: 'handyman', subcategory: 'painting' },
  { category: 'landscaping', subcategory: 'lawn-care' },
  { category: 'landscaping', subcategory: 'garden-design' },
  { category: 'landscaping', subcategory: 'tree-service' },
  { category: 'appliance', subcategory: 'refrigerator-repair' },
  { category: 'appliance', subcategory: 'washer-repair' },
  { category: 'pest-control', subcategory: 'inspection' },
  { category: 'pest-control', subcategory: 'treatment' }
];

async function continueGeneration() {
  console.log('🎨 Continuing Google Imagen 2 Generation\n');
  console.log(`📊 Generating remaining ${REMAINING_SERVICES.length} services\n`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < REMAINING_SERVICES.length; i++) {
    const service = REMAINING_SERVICES[i];
    console.log(`\n[${i + 1}/${REMAINING_SERVICES.length}] ${service.category}/${service.subcategory}`);
    
    try {
      await generateSpecificServiceNoPeople(service.category, service.subcategory);
      success++;
    } catch (error) {
      console.error('Failed:', error);
      failed++;
    }
    
    // Rate limiting
    if (i < REMAINING_SERVICES.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n✨ Continuation Complete!');
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

continueGeneration().catch(console.error);