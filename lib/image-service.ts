import { storage } from './firebase';
import { ref, getDownloadURL, listAll } from 'firebase/storage';

// Image service types
export interface ServiceImage {
  id: string;
  url: string;
  thumbnail?: string;
  card?: string;
  hero?: string;
  original?: string;
  category: string;
  updatedAt?: Date;
}

// Cache configuration
const CACHE_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

// Firebase Storage base path
const STORAGE_BASE_PATH = 'images/services';

// Local storage cache key
const LOCAL_CACHE_KEY = 'leila-image-urls';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

class ImageService {
  private static instance: ImageService;
  private imageCache: Map<string, ServiceImage> = new Map();
  private firebaseUrls: Record<string, any> = {};
  
  static getInstance(): ImageService {
    if (!this.instance) {
      this.instance = new ImageService();
    }
    return this.instance;
  }
  
  constructor() {
    this.loadLocalCache();
  }
  
  // Load cached URLs from localStorage
  private loadLocalCache() {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          this.firebaseUrls = data;
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }
  
  // Save URLs to localStorage
  private saveLocalCache() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify({
        data: this.firebaseUrls,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }
  
  // Get image URL with variants
  async getServiceImage(serviceId: string): Promise<ServiceImage | null> {
    // Check memory cache first
    if (this.imageCache.has(serviceId)) {
      return this.imageCache.get(serviceId)!;
    }
    
    // Check localStorage cache
    if (this.firebaseUrls[serviceId]) {
      const cached = this.firebaseUrls[serviceId];
      const image: ServiceImage = {
        id: serviceId,
        url: cached.card || cached.original || cached.thumbnail,
        thumbnail: cached.thumbnail,
        card: cached.card,
        hero: cached.hero,
        original: cached.original,
        category: this.getCategoryFromId(serviceId),
        updatedAt: new Date(cached.updatedAt || Date.now())
      };
      this.imageCache.set(serviceId, image);
      return image;
    }
    
    // Fetch from Firebase
    try {
      const image = await this.fetchImageFromFirebase(serviceId);
      if (image) {
        this.imageCache.set(serviceId, image);
        this.firebaseUrls[serviceId] = {
          thumbnail: image.thumbnail,
          card: image.card,
          hero: image.hero,
          original: image.original,
          updatedAt: Date.now()
        };
        this.saveLocalCache();
      }
      return image;
    } catch (error) {
      console.error(`Error fetching image for ${serviceId}:`, error);
      return null;
    }
  }
  
  // Fetch image from Firebase Storage
  private async fetchImageFromFirebase(serviceId: string): Promise<ServiceImage | null> {
    const category = this.getCategoryFromId(serviceId);
    const basePath = `${STORAGE_BASE_PATH}/${category}`;
    
    try {
      const variants = {
        thumbnail: null as string | null,
        card: null as string | null,
        hero: null as string | null,
        original: null as string | null,
      };
      
      // Try to get each variant
      const variantPromises = [
        { key: 'thumbnail', suffix: '-thumb' },
        { key: 'card', suffix: '' },
        { key: 'hero', suffix: '-hero' },
        { key: 'original', suffix: '' }
      ].map(async ({ key, suffix }) => {
        try {
          const extensions = ['.webp', '.jpg', '.jpeg', '.png'];
          for (const ext of extensions) {
            const path = `${basePath}/${serviceId}${suffix}${ext}`;
            const imageRef = ref(storage, path);
            try {
              const url = await getDownloadURL(imageRef);
              variants[key] = url;
              break;
            } catch (e) {
              // Try next extension
            }
          }
        } catch (error) {
          // Variant not found
        }
      });
      
      await Promise.all(variantPromises);
      
      // Return if we found at least one variant
      if (Object.values(variants).some(v => v !== null)) {
        return {
          id: serviceId,
          url: variants.card || variants.original || variants.thumbnail || '',
          ...variants,
          category,
          updatedAt: new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching Firebase image for ${serviceId}:`, error);
      return null;
    }
  }
  
  // Get category from service ID
  private getCategoryFromId(serviceId: string): string {
    const categoryMap: Record<string, string[]> = {
      plumbing: ['drain-cleaning', 'pipe-repair', 'water-heater', 'faucet-repair', 'toilet-repair', 'sewer-line', 'emergency-plumbing', 'water-pressure'],
      electrical: ['lighting-installation', 'outlet-repair', 'panel-upgrade', 'ceiling-fan', 'smart-home', 'electrical-inspection', 'emergency-electrical', 'landscape-lighting'],
      hvac: ['ac-installation', 'furnace-repair', 'duct-cleaning', 'system-installation', 'refrigerant-recharge', 'air-quality', 'emergency-hvac'],
      cleaning: ['house-cleaning', 'deep-cleaning', 'carpet-cleaning', 'window-cleaning', 'pressure-washing', 'gutter-cleaning', 'post-construction', 'green-eco', 'garage-cleaning', 'attic-basement'],
      handyman: ['furniture-assembly', 'tv-mounting', 'picture-hanging', 'shelving', 'door-window', 'drywall', 'caulking', 'deck-patio', 'home-maintenance'],
      landscaping: ['lawn-mowing', 'tree-trimming', 'leaf-removal', 'fertilization', 'sod-installation', 'mulching', 'hardscaping', 'sprinkler-repair', 'landscape-lighting'],
      moving: ['local-moving', 'piano-moving', 'office-relocation', 'loading-unloading', 'moving-supplies'],
      'pest-control': ['ant-control', 'rodent-control', 'bed-bug', 'mosquito-control', 'wildlife-removal', 'general-inspection'],
      automotive: ['oil-change', 'brake-services', 'tire-services', 'battery-replacement', 'engine-diagnostics', 'transmission', 'ac-service', 'general-maintenance', 'car-wash', 'interior-detailing', 'paint-protection', 'emergency-roadside', 'wheel-alignment'],
      appliance: ['refrigerator-repair', 'washer-repair', 'dryer-repair', 'dishwasher-repair', 'oven-repair']
    };
    
    for (const [category, services] of Object.entries(categoryMap)) {
      if (services.some(s => serviceId.includes(s))) {
        return category;
      }
    }
    
    return 'general';
  }
  
  // Preload critical images
  async preloadCriticalImages(serviceIds: string[]) {
    const promises = serviceIds.map(id => this.getServiceImage(id));
    await Promise.all(promises);
  }
  
  // Clear cache
  clearCache() {
    this.imageCache.clear();
    this.firebaseUrls = {};
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_CACHE_KEY);
    }
  }
  
  // Get all cached images
  getCachedImages(): ServiceImage[] {
    return Array.from(this.imageCache.values());
  }
}

export const imageService = ImageService.getInstance();

// SWR configuration for image fetching
export const IMAGE_SWR_CONFIG = {
  ...CACHE_CONFIG,
  fetcher: async (serviceId: string) => {
    const image = await imageService.getServiceImage(serviceId);
    if (!image) {
      throw new Error(`Image not found for service: ${serviceId}`);
    }
    return image;
  }
};