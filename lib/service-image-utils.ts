// Service image utility functions for flexible image loading

import { getServiceImage as getImageMapping } from './service-image-mapping';

// Common image naming patterns found in the shared-assets directory
export const IMAGE_PATTERNS = {
  numbered: [
    '{base}-1-thumb.webp',
    '{base}-1-thumb.png',
    '{base}-1.webp',
    '{base}-1.png',
    '{base}-2-thumb.webp',
    '{base}-2-thumb.png',
    '{base}-2.webp',
    '{base}-2.png',
  ],
  descriptive: [
    '{base}-thumbnail.jpg',
    '{base}-card.jpg',
    '{base}-hero.jpg',
    '{base}-mobile.jpg',
    '{base}.jpg',
    '{base}.png',
  ],
  prefixed: [
    'general-{base}-1-thumb.webp',
    'general-{base}-1-thumb.png',
    'general-{base}-thumbnail.jpg',
  ]
};

/**
 * Get all possible image paths for a service
 */
export function getPossibleImagePaths(serviceId: string): string[] {
  const mapping = getImageMapping(serviceId);
  const basePath = `/shared-assets/images/services/${mapping.category}/`;
  const paths: string[] = [];
  
  // Try all patterns
  Object.values(IMAGE_PATTERNS).forEach(patterns => {
    patterns.forEach(pattern => {
      const filename = pattern.replace('{base}', mapping.subcategory);
      paths.push(basePath + filename);
    });
  });
  
  // Add category-level fallbacks
  paths.push(`${basePath}${mapping.category}-hero.jpg`);
  paths.push(`${basePath}${mapping.category}-1.jpg`);
  
  // Add global fallback
  paths.push('/shared-assets/images/services/placeholder.jpg');
  
  return paths;
}

/**
 * Get the primary image URL for a service
 * This returns the first pattern to try, with fallbacks handled by the image components
 */
export function getServiceImageUrl(serviceId: string): string {
  const mapping = getImageMapping(serviceId);
  
  // Special cases based on observed patterns
  if (mapping.category === 'pest-control' && mapping.subcategory === 'inspection') {
    return `/shared-assets/images/services/${mapping.category}/general-inspection-1-thumb.webp`;
  }
  
  // Check for common patterns
  const commonPatterns = [
    `${mapping.subcategory}-1-thumb.webp`,
    `${mapping.subcategory}-thumbnail.jpg`,
    `${mapping.subcategory}-card.jpg`
  ];
  
  // Return the most likely pattern
  return `/shared-assets/images/services/${mapping.category}/${commonPatterns[0]}`;
}

/**
 * Extract base name from various image filename patterns
 */
export function extractBaseName(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  
  // Remove common suffixes
  const suffixPatterns = [
    /-\d+-thumb$/,
    /-\d+-large$/,
    /-\d+$/,
    /-thumbnail$/,
    /-card$/,
    /-hero$/,
    /-mobile$/,
  ];
  
  let baseName = nameWithoutExt;
  for (const pattern of suffixPatterns) {
    baseName = baseName.replace(pattern, '');
  }
  
  // Remove 'general-' prefix if present
  baseName = baseName.replace(/^general-/, '');
  
  return baseName;
}