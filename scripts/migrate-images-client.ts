// Client-side migration script that runs in the browser
// This can be run from the browser console or as a page

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ImageInfo {
  path: string;
  url: string;
}

// List of all images to migrate
const IMAGES_TO_MIGRATE: ImageInfo[] = [
  // Plumbing
  { path: 'plumbing/drain-cleaning-1.webp', url: '/images/services/plumbing/drain-cleaning-1.webp' },
  { path: 'plumbing/drain-cleaning-1-thumb.webp', url: '/images/services/plumbing/drain-cleaning-1-thumb.webp' },
  { path: 'plumbing/drain-cleaning-hero.jpg', url: '/images/services/plumbing/drain-cleaning-hero.jpg' },
  { path: 'plumbing/pipe-repair-1.webp', url: '/images/services/plumbing/pipe-repair-1.webp' },
  { path: 'plumbing/pipe-repair-1-thumb.webp', url: '/images/services/plumbing/pipe-repair-1-thumb.webp' },
  { path: 'plumbing/faucet-repair-hero.jpg', url: '/images/services/plumbing/faucet-repair-hero.jpg' },
  { path: 'plumbing/faucet-repair-installation-1.webp', url: '/images/services/plumbing/faucet-repair-installation-1.webp' },
  { path: 'plumbing/faucet-repair-installation-1-thumb.webp', url: '/images/services/plumbing/faucet-repair-installation-1-thumb.webp' },
  { path: 'plumbing/toilet-repair-installation-1.webp', url: '/images/services/plumbing/toilet-repair-installation-1.webp' },
  { path: 'plumbing/toilet-repair-installation-1-thumb.webp', url: '/images/services/plumbing/toilet-repair-installation-1-thumb.webp' },
  { path: 'plumbing/water-heater-hero.jpg', url: '/images/services/plumbing/water-heater-hero.jpg' },
  { path: 'plumbing/water-heater-installation-1.webp', url: '/images/services/plumbing/water-heater-installation-1.webp' },
  { path: 'plumbing/water-heater-installation-1-thumb.webp', url: '/images/services/plumbing/water-heater-installation-1-thumb.webp' },
  { path: 'plumbing/pipe-installation-hero.jpg', url: '/images/services/plumbing/pipe-installation-hero.jpg' },
  { path: 'plumbing/sewer-line-service-1.webp', url: '/images/services/plumbing/sewer-line-service-1.webp' },
  { path: 'plumbing/sewer-line-service-1-thumb.webp', url: '/images/services/plumbing/sewer-line-service-1-thumb.webp' },
  { path: 'plumbing/emergency-plumbing-1.webp', url: '/images/services/plumbing/emergency-plumbing-1.webp' },
  { path: 'plumbing/emergency-plumbing-1-thumb.webp', url: '/images/services/plumbing/emergency-plumbing-1-thumb.webp' },
  { path: 'plumbing/water-pressure-fix-1.webp', url: '/images/services/plumbing/water-pressure-fix-1.webp' },
  { path: 'plumbing/water-pressure-fix-1-thumb.webp', url: '/images/services/plumbing/water-pressure-fix-1-thumb.webp' },
  
  // Electrical
  { path: 'electrical/lighting-installation-hero.jpg', url: '/images/services/electrical/lighting-installation-hero.jpg' },
  { path: 'electrical/lighting-installation-1.webp', url: '/images/services/electrical/lighting-installation-1.webp' },
  { path: 'electrical/lighting-installation-1-thumb.webp', url: '/images/services/electrical/lighting-installation-1-thumb.webp' },
  { path: 'electrical/outlet-installation-hero.jpg', url: '/images/services/electrical/outlet-installation-hero.jpg' },
  { path: 'electrical/outlet-repair-installation-1.webp', url: '/images/services/electrical/outlet-repair-installation-1.webp' },
  { path: 'electrical/outlet-repair-installation-1-thumb.webp', url: '/images/services/electrical/outlet-repair-installation-1-thumb.webp' },
  { path: 'electrical/panel-upgrade-hero.jpg', url: '/images/services/electrical/panel-upgrade-hero.jpg' },
  { path: 'electrical/electrical-panel-upgrade-1.webp', url: '/images/services/electrical/electrical-panel-upgrade-1.webp' },
  { path: 'electrical/electrical-panel-upgrade-1-thumb.webp', url: '/images/services/electrical/electrical-panel-upgrade-1-thumb.webp' },
  { path: 'electrical/ceiling-fan-installation-1.webp', url: '/images/services/electrical/ceiling-fan-installation-1.webp' },
  { path: 'electrical/ceiling-fan-installation-1-thumb.webp', url: '/images/services/electrical/ceiling-fan-installation-1-thumb.webp' },
  { path: 'electrical/smart-home-hero.jpg', url: '/images/services/electrical/smart-home-hero.jpg' },
  { path: 'electrical/smart-home-installation-1.webp', url: '/images/services/electrical/smart-home-installation-1.webp' },
  { path: 'electrical/smart-home-installation-1-thumb.webp', url: '/images/services/electrical/smart-home-installation-1-thumb.webp' },
  { path: 'electrical/electrical-inspection-1.webp', url: '/images/services/electrical/electrical-inspection-1.webp' },
  { path: 'electrical/electrical-inspection-1-thumb.webp', url: '/images/services/electrical/electrical-inspection-1-thumb.webp' },
  { path: 'electrical/emergency-electrical-1.webp', url: '/images/services/electrical/emergency-electrical-1.webp' },
  { path: 'electrical/emergency-electrical-1-thumb.webp', url: '/images/services/electrical/emergency-electrical-1-thumb.webp' },
  { path: 'electrical/landscape-lighting-1.webp', url: '/images/services/electrical/landscape-lighting-1.webp' },
  { path: 'electrical/landscape-lighting-1-thumb.webp', url: '/images/services/electrical/landscape-lighting-1-thumb.webp' },
  
  // HVAC
  { path: 'hvac/ac-installation-hero.jpg', url: '/images/services/hvac/ac-installation-hero.jpg' },
  { path: 'hvac/ac-installation-repair-1.webp', url: '/images/services/hvac/ac-installation-repair-1.webp' },
  { path: 'hvac/ac-installation-repair-1-thumb.webp', url: '/images/services/hvac/ac-installation-repair-1-thumb.webp' },
  { path: 'hvac/furnace-repair-hero.jpg', url: '/images/services/hvac/furnace-repair-hero.jpg' },
  { path: 'hvac/heating-system-repair-1.webp', url: '/images/services/hvac/heating-system-repair-1.webp' },
  { path: 'hvac/heating-system-repair-1-thumb.webp', url: '/images/services/hvac/heating-system-repair-1-thumb.webp' },
  { path: 'hvac/duct-cleaning-hero.jpg', url: '/images/services/hvac/duct-cleaning-hero.jpg' },
  { path: 'hvac/duct-cleaning-1.webp', url: '/images/services/hvac/duct-cleaning-1.webp' },
  { path: 'hvac/duct-cleaning-1-thumb.webp', url: '/images/services/hvac/duct-cleaning-1-thumb.webp' },
  { path: 'hvac/system-installation-1.webp', url: '/images/services/hvac/system-installation-1.webp' },
  { path: 'hvac/system-installation-1-thumb.webp', url: '/images/services/hvac/system-installation-1-thumb.webp' },
  { path: 'hvac/refrigerant-recharge-1.webp', url: '/images/services/hvac/refrigerant-recharge-1.webp' },
  { path: 'hvac/refrigerant-recharge-1-thumb.webp', url: '/images/services/hvac/refrigerant-recharge-1-thumb.webp' },
  { path: 'hvac/air-quality-testing-1.webp', url: '/images/services/hvac/air-quality-testing-1.webp' },
  { path: 'hvac/air-quality-testing-1-thumb.webp', url: '/images/services/hvac/air-quality-testing-1-thumb.webp' },
  { path: 'hvac/emergency-hvac-service-1.webp', url: '/images/services/hvac/emergency-hvac-service-1.webp' },
  { path: 'hvac/emergency-hvac-service-1-thumb.webp', url: '/images/services/hvac/emergency-hvac-service-1-thumb.webp' },
  
  // Cleaning
  { path: 'cleaning/house-cleaning-hero.jpg', url: '/images/services/cleaning/house-cleaning-hero.jpg' },
  { path: 'cleaning/house-cleaning-1.webp', url: '/images/services/cleaning/house-cleaning-1.webp' },
  { path: 'cleaning/house-cleaning-1-thumb.webp', url: '/images/services/cleaning/house-cleaning-1-thumb.webp' },
  { path: 'cleaning/deep-cleaning-hero.jpg', url: '/images/services/cleaning/deep-cleaning-hero.jpg' },
  { path: 'cleaning/carpet-cleaning-hero.jpg', url: '/images/services/cleaning/carpet-cleaning-hero.jpg' },
  { path: 'cleaning/carpet-cleaning-1.webp', url: '/images/services/cleaning/carpet-cleaning-1.webp' },
  { path: 'cleaning/carpet-cleaning-1-thumb.webp', url: '/images/services/cleaning/carpet-cleaning-1-thumb.webp' },
  { path: 'cleaning/window-cleaning-1.webp', url: '/images/services/cleaning/window-cleaning-1.webp' },
  { path: 'cleaning/window-cleaning-1-thumb.webp', url: '/images/services/cleaning/window-cleaning-1-thumb.webp' },
  { path: 'cleaning/pressure-washing-1.webp', url: '/images/services/cleaning/pressure-washing-1.webp' },
  { path: 'cleaning/pressure-washing-1-thumb.webp', url: '/images/services/cleaning/pressure-washing-1-thumb.webp' },
  { path: 'cleaning/gutter-cleaning-1.webp', url: '/images/services/cleaning/gutter-cleaning-1.webp' },
  { path: 'cleaning/gutter-cleaning-1-thumb.webp', url: '/images/services/cleaning/gutter-cleaning-1-thumb.webp' },
  { path: 'cleaning/post-construction-cleaning-1.webp', url: '/images/services/cleaning/post-construction-cleaning-1.webp' },
  { path: 'cleaning/post-construction-cleaning-1-thumb.webp', url: '/images/services/cleaning/post-construction-cleaning-1-thumb.webp' },
  { path: 'cleaning/green-eco-cleaning-1.webp', url: '/images/services/cleaning/green-eco-cleaning-1.webp' },
  { path: 'cleaning/green-eco-cleaning-1-thumb.webp', url: '/images/services/cleaning/green-eco-cleaning-1-thumb.webp' },
  { path: 'cleaning/garage-cleaning-1.webp', url: '/images/services/cleaning/garage-cleaning-1.webp' },
  { path: 'cleaning/garage-cleaning-1-thumb.webp', url: '/images/services/cleaning/garage-cleaning-1-thumb.webp' },
  { path: 'cleaning/attic-basement-cleaning-1.webp', url: '/images/services/cleaning/attic-basement-cleaning-1.webp' },
  { path: 'cleaning/attic-basement-cleaning-1-thumb.webp', url: '/images/services/cleaning/attic-basement-cleaning-1-thumb.webp' },
  
  // Handyman
  { path: 'handyman/furniture-assembly-hero.jpg', url: '/images/services/handyman/furniture-assembly-hero.jpg' },
  { path: 'handyman/furniture-assembly-1.webp', url: '/images/services/handyman/furniture-assembly-1.webp' },
  { path: 'handyman/furniture-assembly-1-thumb.webp', url: '/images/services/handyman/furniture-assembly-1-thumb.webp' },
  { path: 'handyman/tv-mounting-1.webp', url: '/images/services/handyman/tv-mounting-1.webp' },
  { path: 'handyman/tv-mounting-1-thumb.webp', url: '/images/services/handyman/tv-mounting-1-thumb.webp' },
  { path: 'handyman/picture-hanging-1.webp', url: '/images/services/handyman/picture-hanging-1.webp' },
  { path: 'handyman/picture-hanging-1-thumb.webp', url: '/images/services/handyman/picture-hanging-1-thumb.webp' },
  { path: 'handyman/shelving-installation-1.webp', url: '/images/services/handyman/shelving-installation-1.webp' },
  { path: 'handyman/shelving-installation-1-thumb.webp', url: '/images/services/handyman/shelving-installation-1-thumb.webp' },
  { path: 'handyman/door-window-repair-1.webp', url: '/images/services/handyman/door-window-repair-1.webp' },
  { path: 'handyman/door-window-repair-1-thumb.webp', url: '/images/services/handyman/door-window-repair-1-thumb.webp' },
  { path: 'handyman/drywall-repair-1.webp', url: '/images/services/handyman/drywall-repair-1.webp' },
  { path: 'handyman/drywall-repair-1-thumb.webp', url: '/images/services/handyman/drywall-repair-1-thumb.webp' },
  { path: 'handyman/general-repair-hero.jpg', url: '/images/services/handyman/general-repair-hero.jpg' },
  { path: 'handyman/painting-hero.jpg', url: '/images/services/handyman/painting-hero.jpg' },
  { path: 'handyman/caulking-sealing-1.webp', url: '/images/services/handyman/caulking-sealing-1.webp' },
  { path: 'handyman/caulking-sealing-1-thumb.webp', url: '/images/services/handyman/caulking-sealing-1-thumb.webp' },
  { path: 'handyman/deck-patio-repair-1.webp', url: '/images/services/handyman/deck-patio-repair-1.webp' },
  { path: 'handyman/deck-patio-repair-1-thumb.webp', url: '/images/services/handyman/deck-patio-repair-1-thumb.webp' },
  { path: 'handyman/home-maintenance-1.webp', url: '/images/services/handyman/home-maintenance-1.webp' },
  { path: 'handyman/home-maintenance-1-thumb.webp', url: '/images/services/handyman/home-maintenance-1-thumb.webp' },
  { path: 'handyman/ceiling-fan-installation-1.webp', url: '/images/services/handyman/ceiling-fan-installation-1.webp' },
  { path: 'handyman/ceiling-fan-installation-1-thumb.webp', url: '/images/services/handyman/ceiling-fan-installation-1-thumb.webp' },
  
  // Landscaping
  { path: 'landscaping/lawn-care-hero.jpg', url: '/images/services/landscaping/lawn-care-hero.jpg' },
  { path: 'landscaping/lawn-mowing-trimming-1.webp', url: '/images/services/landscaping/lawn-mowing-trimming-1.webp' },
  { path: 'landscaping/lawn-mowing-trimming-1-thumb.webp', url: '/images/services/landscaping/lawn-mowing-trimming-1-thumb.webp' },
  { path: 'landscaping/tree-service-hero.jpg', url: '/images/services/landscaping/tree-service-hero.jpg' },
  { path: 'landscaping/tree-trimming-1.webp', url: '/images/services/landscaping/tree-trimming-1.webp' },
  { path: 'landscaping/tree-trimming-1-thumb.webp', url: '/images/services/landscaping/tree-trimming-1-thumb.webp' },
  { path: 'landscaping/garden-design-hero.jpg', url: '/images/services/landscaping/garden-design-hero.jpg' },
  { path: 'landscaping/leaf-removal-1.webp', url: '/images/services/landscaping/leaf-removal-1.webp' },
  { path: 'landscaping/leaf-removal-1-thumb.webp', url: '/images/services/landscaping/leaf-removal-1-thumb.webp' },
  { path: 'landscaping/fertilization-1.webp', url: '/images/services/landscaping/fertilization-1.webp' },
  { path: 'landscaping/fertilization-1-thumb.webp', url: '/images/services/landscaping/fertilization-1-thumb.webp' },
  { path: 'landscaping/sod-installation-1.webp', url: '/images/services/landscaping/sod-installation-1.webp' },
  { path: 'landscaping/sod-installation-1-thumb.webp', url: '/images/services/landscaping/sod-installation-1-thumb.webp' },
  { path: 'landscaping/mulching-1.webp', url: '/images/services/landscaping/mulching-1.webp' },
  { path: 'landscaping/mulching-1-thumb.webp', url: '/images/services/landscaping/mulching-1-thumb.webp' },
  { path: 'landscaping/hardscaping-1.webp', url: '/images/services/landscaping/hardscaping-1.webp' },
  { path: 'landscaping/hardscaping-1-thumb.webp', url: '/images/services/landscaping/hardscaping-1-thumb.webp' },
  { path: 'landscaping/sprinkler-repair-1.webp', url: '/images/services/landscaping/sprinkler-repair-1.webp' },
  { path: 'landscaping/sprinkler-repair-1-thumb.webp', url: '/images/services/landscaping/sprinkler-repair-1-thumb.webp' },
  { path: 'landscaping/landscape-lighting-1.webp', url: '/images/services/landscaping/landscape-lighting-1.webp' },
  { path: 'landscaping/landscape-lighting-1-thumb.webp', url: '/images/services/landscaping/landscape-lighting-1-thumb.webp' },
  
  // Moving
  { path: 'moving/local-moving-1.webp', url: '/images/services/moving/local-moving-1.webp' },
  { path: 'moving/local-moving-1-thumb.webp', url: '/images/services/moving/local-moving-1-thumb.webp' },
  { path: 'moving/piano-moving-1.webp', url: '/images/services/moving/piano-moving-1.webp' },
  { path: 'moving/piano-moving-1-thumb.webp', url: '/images/services/moving/piano-moving-1-thumb.webp' },
  { path: 'moving/office-relocation-1.webp', url: '/images/services/moving/office-relocation-1.webp' },
  { path: 'moving/office-relocation-1-thumb.webp', url: '/images/services/moving/office-relocation-1-thumb.webp' },
  { path: 'moving/loadingunloading-help-1.webp', url: '/images/services/moving/loadingunloading-help-1.webp' },
  { path: 'moving/loadingunloading-help-1-thumb.webp', url: '/images/services/moving/loadingunloading-help-1-thumb.webp' },
  { path: 'moving/moving-supplies-1.webp', url: '/images/services/moving/moving-supplies-1.webp' },
  { path: 'moving/moving-supplies-1-thumb.webp', url: '/images/services/moving/moving-supplies-1-thumb.webp' },
  
  // Pest Control
  { path: 'pest-control/inspection-hero.jpg', url: '/images/services/pest-control/inspection-hero.jpg' },
  { path: 'pest-control/general-inspection-1.webp', url: '/images/services/pest-control/general-inspection-1.webp' },
  { path: 'pest-control/general-inspection-1-thumb.webp', url: '/images/services/pest-control/general-inspection-1-thumb.webp' },
  { path: 'pest-control/treatment-hero.jpg', url: '/images/services/pest-control/treatment-hero.jpg' },
  { path: 'pest-control/ant-control-1.webp', url: '/images/services/pest-control/ant-control-1.webp' },
  { path: 'pest-control/ant-control-1-thumb.webp', url: '/images/services/pest-control/ant-control-1-thumb.webp' },
  { path: 'pest-control/rodent-control-1.webp', url: '/images/services/pest-control/rodent-control-1.webp' },
  { path: 'pest-control/rodent-control-1-thumb.webp', url: '/images/services/pest-control/rodent-control-1-thumb.webp' },
  { path: 'pest-control/bed-bug-treatment-1.webp', url: '/images/services/pest-control/bed-bug-treatment-1.webp' },
  { path: 'pest-control/bed-bug-treatment-1-thumb.webp', url: '/images/services/pest-control/bed-bug-treatment-1-thumb.webp' },
  { path: 'pest-control/mosquito-control-1.webp', url: '/images/services/pest-control/mosquito-control-1.webp' },
  { path: 'pest-control/mosquito-control-1-thumb.webp', url: '/images/services/pest-control/mosquito-control-1-thumb.webp' },
  { path: 'pest-control/wildlife-removal-1.webp', url: '/images/services/pest-control/wildlife-removal-1.webp' },
  { path: 'pest-control/wildlife-removal-1-thumb.webp', url: '/images/services/pest-control/wildlife-removal-1-thumb.webp' },
  
  // Automotive
  { path: 'automotive/oil-change-filter-1.webp', url: '/images/services/automotive/oil-change-filter-1.webp' },
  { path: 'automotive/oil-change-filter-1-thumb.webp', url: '/images/services/automotive/oil-change-filter-1-thumb.webp' },
  { path: 'automotive/brake-services-1.webp', url: '/images/services/automotive/brake-services-1.webp' },
  { path: 'automotive/brake-services-1-thumb.webp', url: '/images/services/automotive/brake-services-1-thumb.webp' },
  { path: 'automotive/tire-services-1.webp', url: '/images/services/automotive/tire-services-1.webp' },
  { path: 'automotive/tire-services-1-thumb.webp', url: '/images/services/automotive/tire-services-1-thumb.webp' },
  { path: 'automotive/battery-replacement-1.webp', url: '/images/services/automotive/battery-replacement-1.webp' },
  { path: 'automotive/battery-replacement-1-thumb.webp', url: '/images/services/automotive/battery-replacement-1-thumb.webp' },
  { path: 'automotive/engine-diagnostics-1.webp', url: '/images/services/automotive/engine-diagnostics-1.webp' },
  { path: 'automotive/engine-diagnostics-1-thumb.webp', url: '/images/services/automotive/engine-diagnostics-1-thumb.webp' },
  { path: 'automotive/transmission-service-1.webp', url: '/images/services/automotive/transmission-service-1.webp' },
  { path: 'automotive/transmission-service-1-thumb.webp', url: '/images/services/automotive/transmission-service-1-thumb.webp' },
  { path: 'automotive/ac-service-1.webp', url: '/images/services/automotive/ac-service-1.webp' },
  { path: 'automotive/ac-service-1-thumb.webp', url: '/images/services/automotive/ac-service-1-thumb.webp' },
  { path: 'automotive/general-maintenance-1.webp', url: '/images/services/automotive/general-maintenance-1.webp' },
  { path: 'automotive/general-maintenance-1-thumb.webp', url: '/images/services/automotive/general-maintenance-1-thumb.webp' },
  { path: 'automotive/car-wash-detailing-1.webp', url: '/images/services/automotive/car-wash-detailing-1.webp' },
  { path: 'automotive/car-wash-detailing-1-thumb.webp', url: '/images/services/automotive/car-wash-detailing-1-thumb.webp' },
  { path: 'automotive/interior-detailing-1.webp', url: '/images/services/automotive/interior-detailing-1.webp' },
  { path: 'automotive/interior-detailing-1-thumb.webp', url: '/images/services/automotive/interior-detailing-1-thumb.webp' },
  { path: 'automotive/paint-protection-1.webp', url: '/images/services/automotive/paint-protection-1.webp' },
  { path: 'automotive/paint-protection-1-thumb.webp', url: '/images/services/automotive/paint-protection-1-thumb.webp' },
  { path: 'automotive/emergency-roadside-1.webp', url: '/images/services/automotive/emergency-roadside-1.webp' },
  { path: 'automotive/emergency-roadside-1-thumb.webp', url: '/images/services/automotive/emergency-roadside-1-thumb.webp' },
  { path: 'automotive/wheel-alignment-1.webp', url: '/images/services/automotive/wheel-alignment-1.webp' },
  { path: 'automotive/wheel-alignment-1-thumb.webp', url: '/images/services/automotive/wheel-alignment-1-thumb.webp' },
  
  // Appliance
  { path: 'appliance/refrigerator-repair-hero.jpg', url: '/images/services/appliance/refrigerator-repair-hero.jpg' },
  { path: 'appliance/washer-repair-hero.jpg', url: '/images/services/appliance/washer-repair-hero.jpg' },
  
  // Placeholder
  { path: 'placeholder.jpg', url: '/images/services/placeholder.jpg' },
];

export async function migrateImagesToFirebase() {
  const results = {
    success: [],
    failed: [],
    total: IMAGES_TO_MIGRATE.length
  };
  
  console.log(`Starting migration of ${results.total} images...`);
  
  for (const image of IMAGES_TO_MIGRATE) {
    try {
      console.log(`Migrating ${image.path}...`);
      
      // Fetch the image
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `images/services/${image.path}`);
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: blob.type,
        cacheControl: 'public, max-age=31536000',
        customMetadata: {
          originalUrl: image.url,
          migratedAt: new Date().toISOString()
        }
      });
      
      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);
      
      results.success.push({
        path: image.path,
        url: downloadUrl
      });
      
      console.log(`✓ Migrated ${image.path}`);
    } catch (error) {
      console.error(`✗ Failed to migrate ${image.path}:`, error);
      results.failed.push({
        path: image.path,
        error: error.message
      });
    }
  }
  
  console.log('\nMigration Complete!');
  console.log(`Success: ${results.success.length}/${results.total}`);
  console.log(`Failed: ${results.failed.length}/${results.total}`);
  
  if (results.failed.length > 0) {
    console.log('\nFailed images:');
    results.failed.forEach(f => console.log(`- ${f.path}: ${f.error}`));
  }
  
  // Save results to localStorage for reference
  localStorage.setItem('firebase-migration-results', JSON.stringify(results));
  
  return results;
}

// Function to generate the Firebase URLs mapping
export function generateFirebaseUrlsMapping(results: any) {
  const mapping = {};
  
  results.success.forEach(item => {
    const serviceId = item.path.split('/')[0];
    const fileName = item.path.split('/')[1];
    
    if (!mapping[serviceId]) {
      mapping[serviceId] = {};
    }
    
    if (fileName.includes('-thumb')) {
      mapping[serviceId].thumbnail = item.url;
    } else if (fileName.includes('-hero')) {
      mapping[serviceId].hero = item.url;
    } else {
      mapping[serviceId].card = item.url;
    }
  });
  
  console.log('\nFirebase URLs Mapping:');
  console.log(JSON.stringify(mapping, null, 2));
  
  return mapping;
}