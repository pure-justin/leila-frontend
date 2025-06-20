import { db } from './firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';

export interface MatchingCriteria {
  service: string;
  location: {
    lat: number;
    lng: number;
    radius?: number; // in miles
  };
  scheduledDate: Date;
  urgency: 'normal' | 'urgent' | 'emergency';
  budget?: {
    min: number;
    max: number;
  };
  customerPreferences?: {
    minRating?: number;
    preferredContractors?: string[];
    languages?: string[];
  };
}

export interface Contractor {
  id: string;
  name: string;
  services: string[];
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  availability: AvailabilitySlot[];
  skills: Skill[];
  languages: string[];
  responseTime: number; // average in minutes
  completionRate: number; // percentage
  customerSatisfaction: number; // 0-100
}

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  booked: boolean;
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  yearsExperience: number;
  certifications?: string[];
}

export interface MatchScore {
  contractor: Contractor;
  score: number;
  breakdown: {
    distance: number;
    availability: number;
    rating: number;
    price: number;
    experience: number;
    responseTime: number;
    matchQuality: number;
  };
  estimatedArrival?: Date;
  estimatedCost?: number;
  confidence: number;
}

// Haversine formula for distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate time-based availability score
function calculateAvailabilityScore(
  contractor: Contractor,
  requestedDate: Date,
  urgency: string
): number {
  const now = new Date();
  const requestedDateStr = requestedDate.toISOString().split('T')[0];
  
  // Check if contractor has availability on requested date
  const dayAvailability = contractor.availability.filter(
    slot => slot.date === requestedDateStr && !slot.booked
  );
  
  if (dayAvailability.length === 0) {
    return urgency === 'emergency' ? 0 : 20; // Some score for potential rescheduling
  }
  
  // For emergency, prioritize immediate availability
  if (urgency === 'emergency') {
    const timeDiff = requestedDate.getTime() - now.getTime();
    const hoursUntil = timeDiff / (1000 * 60 * 60);
    
    if (hoursUntil <= 2) {
      return 100; // Can respond immediately
    } else if (hoursUntil <= 4) {
      return 80;
    } else {
      return 60;
    }
  }
  
  // For normal requests, check if preferred time is available
  const preferredTimeAvailable = dayAvailability.some(slot => {
    const slotStart = new Date(`${slot.date} ${slot.startTime}`);
    const slotEnd = new Date(`${slot.date} ${slot.endTime}`);
    return requestedDate >= slotStart && requestedDate <= slotEnd;
  });
  
  return preferredTimeAvailable ? 100 : 70;
}

// Calculate price match score
function calculatePriceScore(
  contractor: Contractor,
  budget?: { min: number; max: number }
): number {
  if (!budget) return 70; // Neutral score if no budget specified
  
  const rate = contractor.hourlyRate;
  
  if (rate >= budget.min && rate <= budget.max) {
    // Perfect match - closer to middle is better
    const middle = (budget.min + budget.max) / 2;
    const deviation = Math.abs(rate - middle) / (budget.max - budget.min);
    return 100 - (deviation * 30); // 70-100 score range
  } else if (rate < budget.min) {
    // Below budget - might indicate lower quality
    return 60;
  } else {
    // Above budget
    const overBudgetPercent = (rate - budget.max) / budget.max;
    return Math.max(0, 50 - (overBudgetPercent * 100));
  }
}

// Calculate experience score for the specific service
function calculateExperienceScore(
  contractor: Contractor,
  service: string
): number {
  const relevantSkill = contractor.skills.find(
    skill => skill.name.toLowerCase() === service.toLowerCase()
  );
  
  if (!relevantSkill) return 0;
  
  let score = 0;
  
  // Skill level scoring
  switch (relevantSkill.level) {
    case 'expert':
      score += 40;
      break;
    case 'intermediate':
      score += 25;
      break;
    case 'beginner':
      score += 10;
      break;
  }
  
  // Years of experience scoring (max 30 points)
  score += Math.min(30, relevantSkill.yearsExperience * 3);
  
  // Certification bonus (max 30 points)
  if (relevantSkill.certifications && relevantSkill.certifications.length > 0) {
    score += Math.min(30, relevantSkill.certifications.length * 10);
  }
  
  return score;
}

// ML-based match quality prediction
function calculateMatchQuality(
  contractor: Contractor,
  criteria: MatchingCriteria,
  historicalData?: any
): number {
  let quality = 50; // Base score
  
  // Customer satisfaction weight
  quality += (contractor.customerSatisfaction / 100) * 20;
  
  // Completion rate weight
  quality += (contractor.completionRate / 100) * 15;
  
  // Response time factor (faster is better)
  const responseScore = Math.max(0, 100 - contractor.responseTime) / 100;
  quality += responseScore * 15;
  
  // Historical performance with similar jobs
  if (historicalData) {
    // This would use ML model in production
    // For now, using a simplified calculation
    quality += 10;
  }
  
  return Math.min(100, quality);
}

// Main matching algorithm
export async function findBestMatches(
  criteria: MatchingCriteria,
  limit: number = 5
): Promise<MatchScore[]> {
  // Fetch available contractors
  const contractorsRef = collection(db, 'users');
  const q = query(
    contractorsRef,
    where('role', '==', 'contractor'),
    where('services', 'array-contains', criteria.service),
    where('active', '==', true)
  );
  const snapshot = await getDocs(q);
  const contractors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contractor));
  
  if (!contractors || contractors.length === 0) {
    return [];
  }
  
  // Calculate scores for each contractor
  const scoredContractors: MatchScore[] = contractors.map(contractor => {
    // Distance score (0-100)
    const distance = calculateDistance(
      criteria.location.lat,
      criteria.location.lng,
      contractor.location.lat,
      contractor.location.lng
    );
    
    const maxRadius = criteria.location.radius || 25; // Default 25 miles
    const distanceScore = distance <= maxRadius
      ? 100 - (distance / maxRadius) * 100
      : 0;
    
    // Availability score (0-100)
    const availabilityScore = calculateAvailabilityScore(
      contractor,
      criteria.scheduledDate,
      criteria.urgency
    );
    
    // Rating score (0-100)
    const ratingScore = (contractor.rating / 5) * 100;
    
    // Price score (0-100)
    const priceScore = calculatePriceScore(contractor, criteria.budget);
    
    // Experience score (0-100)
    const experienceScore = calculateExperienceScore(contractor, criteria.service);
    
    // Response time score (0-100)
    const responseTimeScore = Math.max(0, 100 - (contractor.responseTime * 2));
    
    // Match quality prediction (0-100)
    const matchQuality = calculateMatchQuality(contractor, criteria);
    
    // Weighted total score
    const weights = {
      distance: criteria.urgency === 'emergency' ? 0.25 : 0.15,
      availability: criteria.urgency === 'emergency' ? 0.25 : 0.20,
      rating: 0.15,
      price: criteria.budget ? 0.15 : 0.10,
      experience: 0.15,
      responseTime: criteria.urgency === 'emergency' ? 0.15 : 0.10,
      matchQuality: 0.15
    };
    
    const totalScore =
      distanceScore * weights.distance +
      availabilityScore * weights.availability +
      ratingScore * weights.rating +
      priceScore * weights.price +
      experienceScore * weights.experience +
      responseTimeScore * weights.responseTime +
      matchQuality * weights.matchQuality;
    
    // Calculate estimated arrival time
    const travelTime = (distance / 30) * 60; // Assuming 30mph average
    const estimatedArrival = new Date(
      criteria.scheduledDate.getTime() + travelTime * 60 * 1000
    );
    
    // Calculate estimated cost
    const estimatedHours = 2; // Default estimate
    const estimatedCost = contractor.hourlyRate * estimatedHours;
    
    return {
      contractor,
      score: totalScore,
      breakdown: {
        distance: distanceScore,
        availability: availabilityScore,
        rating: ratingScore,
        price: priceScore,
        experience: experienceScore,
        responseTime: responseTimeScore,
        matchQuality
      },
      estimatedArrival,
      estimatedCost,
      confidence: totalScore / 100
    };
  });
  
  // Sort by score and apply additional filtering
  const topMatches = scoredContractors
    .filter(match => {
      // Apply minimum score threshold
      if (criteria.urgency === 'emergency' && match.score < 40) return false;
      if (criteria.urgency === 'normal' && match.score < 50) return false;
      
      // Apply customer preferences
      if (criteria.customerPreferences?.minRating &&
          match.contractor.rating < criteria.customerPreferences.minRating) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Apply ML-based reranking if available
  const rerankedMatches = await applyMLReranking(topMatches, criteria);
  
  return rerankedMatches;
}

// ML-based reranking (placeholder for actual ML implementation)
async function applyMLReranking(
  matches: MatchScore[],
  criteria: MatchingCriteria
): Promise<MatchScore[]> {
  // In production, this would call an ML model
  // For now, we'll add some intelligent adjustments
  
  return matches.map(match => {
    let adjustedScore = match.score;
    
    // Boost score for contractors with high satisfaction in similar jobs
    if (match.contractor.customerSatisfaction > 90) {
      adjustedScore *= 1.1;
    }
    
    // Boost for perfect availability match
    if (match.breakdown.availability === 100) {
      adjustedScore *= 1.05;
    }
    
    // Penalty for very new contractors on complex jobs
    if (match.contractor.completedJobs < 10 && criteria.urgency !== 'emergency') {
      adjustedScore *= 0.9;
    }
    
    return {
      ...match,
      score: Math.min(100, adjustedScore)
    };
  }).sort((a, b) => b.score - a.score);
}

// Real-time matching for urgent requests
export async function emergencyMatch(
  criteria: MatchingCriteria
): Promise<MatchScore | null> {
  const urgentCriteria = {
    ...criteria,
    urgency: 'emergency' as const,
    location: {
      ...criteria.location,
      radius: 10 // Reduce radius for faster response
    }
  };
  
  const matches = await findBestMatches(urgentCriteria, 1);
  return matches[0] || null;
}

// Batch matching for scheduled jobs
export async function batchMatch(
  jobs: MatchingCriteria[]
): Promise<Map<string, MatchScore[]>> {
  const results = new Map<string, MatchScore[]>();
  
  // Group jobs by service type and area for efficiency
  const groupedJobs = jobs.reduce((acc, job, index) => {
    const key = `${job.service}-${Math.floor(job.location.lat)}-${Math.floor(job.location.lng)}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ job, index: index.toString() });
    return acc;
  }, {} as Record<string, { job: MatchingCriteria; index: string }[]>);
  
  // Process each group
  for (const group of Object.values(groupedJobs)) {
    const contractors = await fetchContractorsForGroup(group[0].job);
    
    for (const { job, index } of group) {
      const matches = await scoreContractorsForJob(job, contractors);
      results.set(index, matches);
    }
  }
  
  return results;
}

// Helper function to fetch contractors for a group
async function fetchContractorsForGroup(
  sampleJob: MatchingCriteria
): Promise<Contractor[]> {
  // TODO: Implement Firebase query for contractors
  // For now, return empty array to avoid errors
  console.warn('fetchContractorsForGroup: Firebase implementation needed');
  return [];
}

// Helper function to score contractors for a specific job
async function scoreContractorsForJob(
  job: MatchingCriteria,
  contractors: Contractor[]
): Promise<MatchScore[]> {
  // Reuse the main scoring logic
  const scores = await Promise.all(
    contractors.map(async contractor => {
      // Calculate individual scores
      const distance = calculateDistance(
        job.location.lat,
        job.location.lng,
        contractor.location.lat,
        contractor.location.lng
      );
      
      // ... rest of scoring logic
      return {} as MatchScore; // Simplified for brevity
    })
  );
  
  return scores.sort((a, b) => b.score - a.score).slice(0, 5);
}