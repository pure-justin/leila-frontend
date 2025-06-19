export interface ContractorProfile {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  services: string[];
  rating: number;
  completedJobs: number;
  responseTime: number; // minutes
  availability: {
    [key: string]: {
      available: boolean;
      start: string;
      end: string;
    };
  };
  emergencyAvailable: boolean;
  hourlyRate: number;
}

export interface ServiceRequest {
  id: string;
  service: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  date: string;
  time: string;
  urgent: boolean;
  estimatedDuration: number; // hours
  priceRange: {
    min: number;
    max: number;
  };
}

export interface MatchScore {
  contractorId: string;
  score: number;
  factors: {
    distance: number;
    availability: number;
    rating: number;
    experience: number;
    price: number;
    responseTime: number;
  };
  estimatedArrival: number; // minutes
  price: number;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Check if contractor is available at requested time
function checkAvailability(contractor: ContractorProfile, date: string, time: string): boolean {
  const requestDate = new Date(date);
  const dayOfWeek = requestDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const availability = contractor.availability[dayOfWeek];
  
  if (!availability || !availability.available) return false;
  
  const requestTime = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1]);
  const startTime = parseInt(availability.start.split(':')[0]) * 60 + parseInt(availability.start.split(':')[1]);
  const endTime = parseInt(availability.end.split(':')[0]) * 60 + parseInt(availability.end.split(':')[1]);
  
  return requestTime >= startTime && requestTime <= endTime;
}

// Main job matching algorithm
export function matchContractorsToJob(
  request: ServiceRequest,
  contractors: ContractorProfile[],
  maxResults: number = 10
): MatchScore[] {
  const scores: MatchScore[] = [];
  
  for (const contractor of contractors) {
    // Filter out contractors who don't offer the service
    if (!contractor.services.includes(request.service)) continue;
    
    // Check availability (urgent jobs bypass normal availability)
    if (!request.urgent && !checkAvailability(contractor, request.date, request.time)) {
      if (!contractor.emergencyAvailable) continue;
    }
    
    // Calculate distance
    const distance = calculateDistance(
      request.location.lat,
      request.location.lng,
      contractor.location.lat,
      contractor.location.lng
    );
    
    // Skip if too far (>25 miles for normal, >50 for urgent)
    if (distance > (request.urgent ? 50 : 25)) continue;
    
    // Calculate individual scoring factors (0-1 scale)
    const factors = {
      // Closer is better (exponential decay)
      distance: Math.exp(-distance / 10),
      
      // Available contractors score higher
      availability: checkAvailability(contractor, request.date, request.time) ? 1 : 
                    (contractor.emergencyAvailable ? 0.7 : 0),
      
      // Higher ratings are better
      rating: contractor.rating / 5,
      
      // More experience is better (logarithmic growth)
      experience: Math.min(Math.log(contractor.completedJobs + 1) / Math.log(100), 1),
      
      // Price within range scores higher
      price: contractor.hourlyRate <= request.priceRange.max && 
             contractor.hourlyRate >= request.priceRange.min ? 1 : 0.5,
      
      // Faster response time is better
      responseTime: Math.exp(-contractor.responseTime / 30)
    };
    
    // Weight factors based on job type
    const weights = request.urgent ? {
      distance: 0.25,
      availability: 0.15,
      rating: 0.15,
      experience: 0.10,
      price: 0.10,
      responseTime: 0.25
    } : {
      distance: 0.20,
      availability: 0.20,
      rating: 0.25,
      experience: 0.15,
      price: 0.15,
      responseTime: 0.05
    };
    
    // Calculate weighted score
    const score = Object.entries(factors).reduce((total, [key, value]) => {
      return total + value * weights[key as keyof typeof weights];
    }, 0);
    
    // Estimate arrival time (average speed of 30mph in city)
    const estimatedArrival = Math.round(distance / 30 * 60);
    
    // Calculate price for the job
    const price = contractor.hourlyRate * request.estimatedDuration * 
                  (request.urgent && !checkAvailability(contractor, request.date, request.time) ? 1.5 : 1);
    
    scores.push({
      contractorId: contractor.id,
      score,
      factors,
      estimatedArrival,
      price
    });
  }
  
  // Sort by score descending and return top matches
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// Real-time matching for new jobs
export function findBestMatches(
  request: ServiceRequest,
  contractors: ContractorProfile[]
): ContractorProfile[] {
  const matches = matchContractorsToJob(request, contractors, 20);
  
  // Get contractor details for top matches
  return matches.map(match => 
    contractors.find(c => c.id === match.contractorId)!
  ).filter(Boolean);
}

// Geo-fencing for efficient matching
export function getContractorsInRadius(
  center: { lat: number; lng: number },
  contractors: ContractorProfile[],
  radiusMiles: number
): ContractorProfile[] {
  return contractors.filter(contractor => {
    const distance = calculateDistance(
      center.lat,
      center.lng,
      contractor.location.lat,
      contractor.location.lng
    );
    return distance <= radiusMiles;
  });
}