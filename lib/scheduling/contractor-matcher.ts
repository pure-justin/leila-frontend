import { getDistance } from 'geolib';

export interface Contractor {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  completedJobs: number;
  certifications: string[];
  specialties: string[];
  availability: {
    [date: string]: TimeSlot[];
  };
  responseTime: number; // average in minutes
  acceptanceRate: number; // percentage
  currentJobs: number;
  maxConcurrentJobs: number;
}

export interface TimeSlot {
  start: string;
  end: string;
  booked: boolean;
}

export interface MatchingRequest {
  serviceId: string;
  customerLocation: {
    lat: number;
    lng: number;
  };
  requestedTime: Date;
  isUrgent: boolean;
  isPremium: boolean; // Service X
}

export interface MatchScore {
  contractor: Contractor;
  score: number;
  distance: number;
  eta: number;
  factors: {
    distance: number;
    rating: number;
    experience: number;
    availability: number;
    responseTime: number;
    certifications: number;
  };
}

// AI-powered matching algorithm
export class ContractorMatcher {
  private static readonly WEIGHTS = {
    distance: 0.3,
    rating: 0.25,
    experience: 0.15,
    availability: 0.15,
    responseTime: 0.1,
    certifications: 0.05,
  };

  private static readonly SERVICE_X_WEIGHTS = {
    distance: 0.35,
    rating: 0.2,
    experience: 0.1,
    availability: 0.05,
    responseTime: 0.25, // Much higher for Service X
    certifications: 0.05,
  };

  static async findBestMatches(
    request: MatchingRequest,
    contractors: Contractor[],
    limit: number = 5
  ): Promise<MatchScore[]> {
    const weights = request.isPremium ? this.SERVICE_X_WEIGHTS : this.WEIGHTS;
    
    const scores = contractors
      .filter(c => this.isAvailable(c, request))
      .map(contractor => this.calculateScore(contractor, request, weights))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores;
  }

  private static isAvailable(contractor: Contractor, request: MatchingRequest): boolean {
    // Check if contractor has capacity
    if (contractor.currentJobs >= contractor.maxConcurrentJobs) {
      return false;
    }

    // For Service X, only select contractors with high acceptance rate
    if (request.isPremium && contractor.acceptanceRate < 0.85) {
      return false;
    }

    const dateKey = request.requestedTime.toISOString().split('T')[0];
    const requestedHour = request.requestedTime.getHours();
    
    const daySlots = contractor.availability[dateKey] || [];
    
    return daySlots.some(slot => {
      const slotStart = parseInt(slot.start.split(':')[0]);
      const slotEnd = parseInt(slot.end.split(':')[0]);
      return !slot.booked && requestedHour >= slotStart && requestedHour < slotEnd;
    });
  }

  private static calculateScore(
    contractor: Contractor,
    request: MatchingRequest,
    weights: typeof ContractorMatcher.WEIGHTS
  ): MatchScore {
    // Calculate distance
    const distance = getDistance(
      request.customerLocation,
      contractor.location
    ) / 1000; // Convert to km

    // Calculate ETA (rough estimate: 2 min/km + 15 min prep)
    const eta = Math.round(distance * 2 + 15);

    // Scoring factors (0-1 scale)
    const factors = {
      // Closer is better, exponential decay
      distance: Math.exp(-distance / 10),
      
      // Rating score (4.0 = 0.6, 5.0 = 1.0)
      rating: Math.max(0, (contractor.rating - 3) / 2),
      
      // Experience score (logarithmic growth)
      experience: Math.min(1, Math.log10(contractor.completedJobs + 1) / 3),
      
      // Availability score (based on current load)
      availability: 1 - (contractor.currentJobs / contractor.maxConcurrentJobs),
      
      // Response time score (faster is better)
      responseTime: Math.exp(-contractor.responseTime / 30),
      
      // Certification bonus
      certifications: Math.min(1, contractor.certifications.length / 5),
    };

    // Apply Service X boost for premium contractors
    if (request.isPremium) {
      if (contractor.rating >= 4.8) factors.rating *= 1.2;
      if (contractor.responseTime < 10) factors.responseTime *= 1.3;
    }

    // Calculate weighted score
    const score = Object.entries(weights).reduce(
      (total, [key, weight]) => total + factors[key as keyof typeof factors] * weight,
      0
    );

    return {
      contractor,
      score,
      distance,
      eta,
      factors,
    };
  }

  // Dispatch algorithm - sends requests to contractors in order
  static async dispatchToContractors(
    matches: MatchScore[],
    timeoutSeconds: number = 30
  ): Promise<{ accepted: boolean; contractor?: Contractor; attemptedCount: number }> {
    let attemptedCount = 0;

    for (const match of matches) {
      attemptedCount++;
      
      // Simulate sending request to contractor
      const accepted = await this.sendRequestToContractor(
        match.contractor,
        timeoutSeconds
      );

      if (accepted) {
        return { accepted: true, contractor: match.contractor, attemptedCount };
      }
    }

    return { accepted: false, attemptedCount };
  }

  // Simulated contractor notification
  private static async sendRequestToContractor(
    contractor: Contractor,
    timeoutSeconds: number
  ): Promise<boolean> {
    // In real implementation, this would send push notification
    // and wait for response
    return new Promise((resolve) => {
      // Simulate contractor response based on their acceptance rate
      const acceptanceProbability = contractor.acceptanceRate;
      const responseDelay = Math.random() * timeoutSeconds * 1000;
      
      setTimeout(() => {
        resolve(Math.random() < acceptanceProbability);
      }, Math.min(responseDelay, timeoutSeconds * 1000));
    });
  }
}