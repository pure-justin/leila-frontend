// Service images mapping for Firebase Storage
// This will be populated after migration

interface ServiceImage {
  url: string;
  alt: string;
  thumbnail?: string;
  card?: string;
  hero?: string;
}

// Temporary fallback to local images until migration is complete
const LOCAL_IMAGE_BASE = '/images/services';

// This will be replaced with Firebase Storage URLs after migration
export const SERVICE_IMAGES: Record<string, ServiceImage> = {
  // Plumbing
  'drain-cleaning': {
    url: `${LOCAL_IMAGE_BASE}/plumbing/drain-cleaning-1.webp`,
    alt: 'Professional drain cleaning service',
    thumbnail: `${LOCAL_IMAGE_BASE}/plumbing/drain-cleaning-1-thumb.webp`,
    card: `${LOCAL_IMAGE_BASE}/plumbing/drain-cleaning-1.webp`,
    hero: `${LOCAL_IMAGE_BASE}/plumbing/drain-cleaning-hero.jpg`
  },
  'pipe-repair': {
    url: `${LOCAL_IMAGE_BASE}/plumbing/pipe-repair-1.webp`,
    alt: 'Pipe repair and maintenance',
    thumbnail: `${LOCAL_IMAGE_BASE}/plumbing/pipe-repair-1-thumb.webp`,
    card: `${LOCAL_IMAGE_BASE}/plumbing/pipe-repair-1.webp`,
    hero: `${LOCAL_IMAGE_BASE}/plumbing/pipe-installation-hero.jpg`
  },
  // ... Add more services
};

// Function to get Firebase Storage URL with CDN optimization
export function getFirebaseImageUrl(path: string, variant?: 'thumbnail' | 'card' | 'hero'): string {
  // This will be updated to use actual Firebase Storage URLs
  // For now, return local path
  return path;
}

// Get service image with fallback
export function getServiceImage(serviceId: string): ServiceImage {
  return SERVICE_IMAGES[serviceId] || {
    url: `${LOCAL_IMAGE_BASE}/placeholder.jpg`,
    alt: 'Service image',
    thumbnail: `${LOCAL_IMAGE_BASE}/placeholder.jpg`,
    card: `${LOCAL_IMAGE_BASE}/placeholder.jpg`,
    hero: `${LOCAL_IMAGE_BASE}/placeholder.jpg`
  };
}

// Preload critical service images
export function getPreloadImages(): string[] {
  return [
    `${LOCAL_IMAGE_BASE}/placeholder.jpg`,
    // Add other critical images
  ];
}