import axios from 'axios';

// Pexels API configuration
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY || '';
const PEXELS_API_URL = 'https://api.pexels.com/v1';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

export interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

// Service-specific search queries for better results
export const SERVICE_SEARCH_QUERIES: Record<string, string[]> = {
  // Electrical
  'electrical-repair': ['electrician working', 'electrical repair', 'fixing electrical outlet'],
  'panel-upgrade': ['electrical panel', 'circuit breaker box', 'electrical upgrade'],
  'ev-charger-install': ['electric vehicle charging', 'EV charger installation', 'Tesla charger'],
  'lighting-install': ['lighting installation', 'modern chandelier', 'LED lights installation'],
  'ceiling-fan-install': ['ceiling fan installation', 'modern ceiling fan'],
  
  // Plumbing
  'leak-repair': ['plumber fixing leak', 'water leak repair', 'pipe repair'],
  'drain-cleaning': ['drain cleaning', 'plumber drain', 'unclogging drain'],
  'toilet-repair': ['toilet repair', 'plumber bathroom', 'fixing toilet'],
  'water-heater': ['water heater installation', 'tankless water heater', 'plumber water heater'],
  'faucet-install': ['faucet installation', 'kitchen faucet', 'bathroom faucet install'],
  
  // HVAC
  'ac-repair': ['air conditioner repair', 'HVAC technician', 'AC maintenance'],
  'hvac-maintenance': ['HVAC maintenance', 'air filter replacement', 'AC technician'],
  'furnace-repair': ['furnace repair', 'heating repair', 'HVAC winter'],
  'duct-cleaning': ['air duct cleaning', 'ventilation cleaning', 'HVAC ducts'],
  
  // Cleaning
  'deep-cleaning': ['house deep cleaning', 'professional cleaning', 'spring cleaning'],
  'carpet-cleaning': ['carpet cleaning machine', 'professional carpet cleaning', 'steam cleaning'],
  'window-cleaning': ['window cleaning professional', 'cleaning windows', 'window washer'],
  'move-out-cleaning': ['empty house cleaning', 'move out cleaning', 'end of lease cleaning'],
  'office-cleaning': ['office cleaning', 'commercial cleaning', 'janitor service'],
  
  // Landscaping
  'lawn-mowing': ['lawn mowing service', 'grass cutting', 'lawn care professional'],
  'garden-design': ['landscape design', 'garden planning', 'backyard landscaping'],
  'tree-trimming': ['tree trimming service', 'arborist working', 'tree pruning'],
  'leaf-removal': ['leaf removal', 'fall cleanup', 'raking leaves'],
  'sprinkler-install': ['sprinkler installation', 'irrigation system', 'lawn sprinkler'],
  
  // Handyman
  'furniture-assembly': ['furniture assembly', 'assembling furniture', 'IKEA assembly'],
  'tv-mounting': ['TV wall mount', 'mounting television', 'TV installation'],
  'drywall-repair': ['drywall repair', 'patching wall', 'wall repair'],
  'door-repair': ['door repair', 'fixing door', 'door installation'],
  'gutter-cleaning': ['gutter cleaning', 'cleaning gutters', 'gutter maintenance'],
  
  // Painting
  'interior-painting': ['interior painting', 'painting walls', 'house painter'],
  'exterior-painting': ['exterior house painting', 'painting home exterior', 'house painter outside'],
  'cabinet-painting': ['cabinet painting', 'kitchen cabinet refinishing', 'painting cabinets'],
  'deck-staining': ['deck staining', 'wood stain deck', 'deck refinishing'],
  
  // Personal Care
  'haircut-home': ['mobile hairdresser', 'home haircut', 'personal barber'],
  'massage-therapy': ['massage therapy', 'home massage', 'spa massage'],
  'nail-service': ['nail salon', 'manicure pedicure', 'nail technician'],
  'makeup-service': ['makeup artist', 'wedding makeup', 'professional makeup'],
  
  // Pet Care
  'dog-walking': ['dog walker', 'walking dogs', 'pet walker'],
  'pet-grooming': ['pet grooming', 'dog grooming', 'pet groomer'],
  'pet-sitting': ['pet sitter', 'cat sitting', 'pet care'],
  'pet-training': ['dog training', 'pet trainer', 'obedience training'],
  
  // Automotive
  'car-wash': ['car wash service', 'auto detailing', 'washing car'],
  'oil-change': ['oil change service', 'mechanic oil change', 'car maintenance'],
  'auto-detailing': ['car detailing', 'auto detailing professional', 'car cleaning'],
  'tire-rotation': ['tire rotation', 'tire service', 'mechanic tires'],
  
  // Moving
  'full-service-moving': ['moving company', 'movers truck', 'professional movers'],
  'packing-service': ['packing boxes', 'moving packing', 'professional packers'],
  'furniture-moving': ['furniture movers', 'moving furniture', 'heavy lifting movers'],
  
  // Tech Support
  'computer-repair': ['computer repair', 'laptop repair', 'IT technician'],
  'wifi-setup': ['wifi router setup', 'network installation', 'internet setup'],
  'smart-home': ['smart home installation', 'home automation', 'smart devices'],
  'data-recovery': ['data recovery', 'computer data', 'hard drive recovery'],
  
  // Security
  'camera-install': ['security camera installation', 'CCTV installation', 'surveillance camera'],
  'alarm-system': ['alarm system installation', 'home security', 'security system'],
  'lock-change': ['locksmith service', 'changing locks', 'door lock installation'],
  
  // Pest Control
  'general-pest': ['pest control service', 'exterminator', 'pest removal'],
  'termite-treatment': ['termite treatment', 'termite inspection', 'termite control'],
  'rodent-control': ['rodent control', 'mouse exterminator', 'rat removal'],
  'bee-removal': ['bee removal', 'wasp nest removal', 'bee relocation']
};

// Pexels API client
class PexelsService {
  private apiKey: string;
  private axiosInstance: any;

  constructor() {
    this.apiKey = PEXELS_API_KEY;
    this.axiosInstance = axios.create({
      baseURL: PEXELS_API_URL,
      headers: {
        'Authorization': this.apiKey
      }
    });
  }

  // Search for photos by query
  async searchPhotos(query: string, perPage: number = 10, page: number = 1): Promise<PexelsSearchResponse> {
    try {
      const response = await this.axiosInstance.get('/search', {
        params: {
          query,
          per_page: perPage,
          page,
          orientation: 'landscape' // Better for service images
        }
      });
      return response.data;
    } catch (error) {
      console.error('Pexels API error:', error);
      throw error;
    }
  }

  // Get curated photos
  async getCuratedPhotos(perPage: number = 10, page: number = 1): Promise<PexelsSearchResponse> {
    try {
      const response = await this.axiosInstance.get('/curated', {
        params: {
          per_page: perPage,
          page
        }
      });
      return response.data;
    } catch (error) {
      console.error('Pexels API error:', error);
      throw error;
    }
  }

  // Get photo by ID
  async getPhoto(id: number): Promise<PexelsPhoto> {
    try {
      const response = await this.axiosInstance.get(`/photos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Pexels API error:', error);
      throw error;
    }
  }

  // Search photos for a specific service
  async searchServicePhotos(serviceId: string): Promise<PexelsPhoto[]> {
    const queries = SERVICE_SEARCH_QUERIES[serviceId] || [serviceId.replace('-', ' ')];
    const allPhotos: PexelsPhoto[] = [];

    // Try each query until we get good results
    for (const query of queries) {
      try {
        const response = await this.searchPhotos(query, 5);
        if (response.photos.length > 0) {
          allPhotos.push(...response.photos);
        }
      } catch (error) {
        console.error(`Failed to search for ${query}:`, error);
      }
    }

    // Remove duplicates by ID
    const uniquePhotos = Array.from(
      new Map(allPhotos.map(photo => [photo.id, photo])).values()
    );

    return uniquePhotos;
  }

  // Get best photo for a service
  async getBestServicePhoto(serviceId: string): Promise<PexelsPhoto | null> {
    const photos = await this.searchServicePhotos(serviceId);
    
    if (photos.length === 0) {
      return null;
    }

    // Sort by some quality metrics (you can adjust these)
    const sortedPhotos = photos.sort((a, b) => {
      // Prefer photos with more likes (if available)
      // Prefer landscape orientation
      // Prefer medium to large sizes
      const aScore = (a.liked ? 10 : 0) + (a.width > a.height ? 5 : 0);
      const bScore = (b.liked ? 10 : 0) + (b.width > b.height ? 5 : 0);
      return bScore - aScore;
    });

    return sortedPhotos[0];
  }
}

// Export singleton instance
export const pexelsService = new PexelsService();

// Helper function to get optimized image URL
export function getOptimizedPexelsUrl(photo: PexelsPhoto, size: 'small' | 'medium' | 'large' = 'large'): string {
  return photo.src[size];
}

// Helper function to format photographer credit
export function getPhotographerCredit(photo: PexelsPhoto): string {
  return `Photo by ${photo.photographer} on Pexels`;
}