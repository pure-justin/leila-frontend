// Real-time AI-Powered Matching Service (Uber-style)
import { db } from './firebase';
import { 
  collection, doc, setDoc, updateDoc, onSnapshot, 
  query, where, orderBy, limit, getDocs, GeoPoint,
  startAfter, Timestamp, getDoc, increment, arrayUnion
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  service: {
    id: string;
    name: string;
    urgency: 'emergency' | 'today' | 'scheduled';
    estimatedDuration: number; // minutes
  };
  requirements: {
    specificSkills?: string[];
    preferredRating?: number;
    maxPrice?: number;
    preferredTime?: Date;
  };
  status: 'searching' | 'matched' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  matchedContractorId?: string;
  createdAt: Date;
  expiresAt: Date;
  matchingMetadata: {
    searchRadius: number; // miles
    contractorsNotified: string[];
    rejectedBy: string[];
  };
}

export interface ContractorAvailability {
  contractorId: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
    lastUpdated: Date;
  };
  currentJob?: {
    jobId: string;
    estimatedCompletion: Date;
  };
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
  };
  acceptanceRate: number;
  averageResponseTime: number; // seconds
  instantAvailability: boolean;
}

export interface Match {
  id: string;
  requestId: string;
  contractorId: string;
  customerId: string;
  score: number; // 0-100
  factors: {
    distance: number; // miles
    estimatedArrival: number; // minutes
    priceEstimate: number;
    contractorRating: number;
    skillMatch: number; // percentage
    availability: number; // percentage
  };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  offeredAt: Date;
  expiresAt: Date;
}

class RealtimeMatchingService {
  private activeSearches: Map<string, any> = new Map();
  private contractorListeners: Map<string, any> = new Map();
  
  // Start a new service request and find matches
  async createServiceRequest(
    customerId: string,
    service: any,
    location: any,
    requirements: any = {}
  ): Promise<ServiceRequest> {
    const request: ServiceRequest = {
      id: doc(collection(db, 'serviceRequests')).id,
      customerId,
      customerLocation: location,
      service,
      requirements,
      status: 'searching',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
      matchingMetadata: {
        searchRadius: 5, // Start with 5 miles
        contractorsNotified: [],
        rejectedBy: []
      }
    };
    
    // Save request to Firestore
    await setDoc(doc(db, 'serviceRequests', request.id), request);
    
    // Start real-time matching
    this.startMatching(request);
    
    return request;
  }
  
  // Real-time matching algorithm
  private async startMatching(request: ServiceRequest) {
    console.log('🔍 Starting real-time matching for request:', request.id);
    
    // Set up real-time listener for this search
    const unsubscribe = onSnapshot(
      doc(db, 'serviceRequests', request.id),
      async (snapshot) => {
        const currentRequest = snapshot.data() as ServiceRequest;
        
        if (currentRequest.status !== 'searching') {
          console.log('✅ Request matched or cancelled, stopping search');
          this.stopMatching(request.id);
          return;
        }
        
        // Find available contractors
        await this.findAndNotifyContractors(currentRequest);
      }
    );
    
    this.activeSearches.set(request.id, unsubscribe);
    
    // Expand search radius every 2 minutes if no match
    this.scheduleSearchExpansion(request.id);
  }
  
  // Find contractors using AI-powered scoring
  private async findAndNotifyContractors(request: ServiceRequest) {
    const { searchRadius, contractorsNotified, rejectedBy } = request.matchingMetadata;
    
    // Get available contractors within radius
    const availableContractors = await this.getAvailableContractors(
      request.customerLocation,
      searchRadius,
      request.service.id,
      [...contractorsNotified, ...rejectedBy] // Exclude already notified/rejected
    );
    
    if (availableContractors.length === 0) {
      console.log('No contractors found in radius:', searchRadius);
      return;
    }
    
    // Score and rank contractors using AI
    const scoredContractors = await this.scoreContractors(
      availableContractors,
      request
    );
    
    // Notify top contractors (max 3 at a time, like Uber)
    const topContractors = scoredContractors.slice(0, 3);
    
    for (const contractor of topContractors) {
      await this.notifyContractor(contractor, request);
    }
    
    // Update notified list
    await updateDoc(doc(db, 'serviceRequests', request.id), {
      'matchingMetadata.contractorsNotified': [
        ...contractorsNotified,
        ...topContractors.map(c => c.contractorId)
      ]
    });
  }
  
  // Get available contractors within radius
  private async getAvailableContractors(
    customerLocation: any,
    radiusMiles: number,
    serviceType: string,
    excludeIds: string[]
  ): Promise<ContractorAvailability[]> {
    // Calculate bounding box for initial filtering
    const bounds = this.calculateBounds(customerLocation, radiusMiles);
    
    // Query contractors
    const contractorsQuery = query(
      collection(db, 'contractorAvailability'),
      where('status', '==', 'available'),
      where('services', 'array-contains', serviceType),
      where('currentLocation.lat', '>=', bounds.south),
      where('currentLocation.lat', '<=', bounds.north)
    );
    
    const snapshot = await getDocs(contractorsQuery);
    const contractors: ContractorAvailability[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data() as ContractorAvailability;
      
      // Additional filtering
      if (excludeIds.includes(data.contractorId)) return;
      
      // Check if within actual radius (not just bounding box)
      const distance = this.calculateDistance(
        customerLocation,
        data.currentLocation
      );
      
      if (distance <= radiusMiles) {
        contractors.push({
          ...data,
          contractorId: doc.id
        });
      }
    });
    
    return contractors;
  }
  
  // AI-powered contractor scoring
  private async scoreContractors(
    contractors: ContractorAvailability[],
    request: ServiceRequest
  ): Promise<any[]> {
    const scoredContractors = await Promise.all(
      contractors.map(async (contractor) => {
        // Calculate individual factors
        const distance = this.calculateDistance(
          request.customerLocation,
          contractor.currentLocation
        );
        
        const estimatedArrival = this.estimateArrivalTime(
          distance,
          contractor.currentJob
        );
        
        // Get contractor profile for additional data
        const profile = await this.getContractorProfile(contractor.contractorId);
        
        // AI scoring based on multiple factors
        const factors = {
          distance,
          estimatedArrival,
          priceEstimate: await this.estimatePrice(request.service, distance),
          contractorRating: profile?.rating || 4.0,
          skillMatch: this.calculateSkillMatch(
            profile?.skills || [],
            request.requirements.specificSkills || []
          ),
          availability: this.calculateAvailabilityScore(contractor, request)
        };
        
        // Calculate composite score using AI weights
        const score = await this.calculateCompositeScore(factors, request);
        
        return {
          ...contractor,
          score,
          factors
        };
      })
    );
    
    // Sort by score (highest first)
    return scoredContractors.sort((a, b) => b.score - a.score);
  }
  
  // Calculate composite score using AI
  private async calculateCompositeScore(
    factors: any,
    request: ServiceRequest
  ): Promise<number> {
    // Weights based on urgency and requirements
    let weights = {
      distance: 0.3,
      estimatedArrival: 0.25,
      price: 0.15,
      rating: 0.15,
      skillMatch: 0.1,
      availability: 0.05
    };
    
    // Adjust weights based on urgency
    if (request.service.urgency === 'emergency') {
      weights = {
        distance: 0.2,
        estimatedArrival: 0.4, // Arrival time most important
        price: 0.05,
        rating: 0.15,
        skillMatch: 0.15,
        availability: 0.05
      };
    }
    
    // Normalize factors to 0-100 scale
    const normalized = {
      distance: Math.max(0, 100 - (factors.distance * 10)), // Closer is better
      estimatedArrival: Math.max(0, 100 - (factors.estimatedArrival * 2)), // Faster is better
      price: Math.max(0, 100 - (factors.priceEstimate / 10)), // Cheaper is better
      rating: factors.contractorRating * 20, // 5-star scale to 100
      skillMatch: factors.skillMatch,
      availability: factors.availability
    };
    
    // Calculate weighted score
    let score = 0;
    score += normalized.distance * weights.distance;
    score += normalized.estimatedArrival * weights.estimatedArrival;
    score += normalized.price * weights.price;
    score += normalized.rating * weights.rating;
    score += normalized.skillMatch * weights.skillMatch;
    score += normalized.availability * weights.availability;
    
    return Math.round(score);
  }
  
  // Send real-time notification to contractor
  private async notifyContractor(
    contractorData: any,
    request: ServiceRequest
  ): Promise<void> {
    const match: Match = {
      id: doc(collection(db, 'matches')).id,
      requestId: request.id,
      contractorId: contractorData.contractorId,
      customerId: request.customerId,
      score: contractorData.score,
      factors: contractorData.factors,
      status: 'pending',
      offeredAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 1000) // 60 second response time
    };
    
    // Save match offer
    await setDoc(doc(db, 'matches', match.id), match);
    
    // Send push notification to contractor
    await this.sendPushNotification(contractorData.contractorId, {
      title: `New ${request.service.name} Request`,
      body: `${contractorData.factors.distance.toFixed(1)} miles away • $${contractorData.factors.priceEstimate}`,
      data: {
        matchId: match.id,
        requestId: request.id,
        urgency: request.service.urgency
      },
      priority: request.service.urgency === 'emergency' ? 'high' : 'normal'
    });
    
    // Set up auto-expire timer
    setTimeout(async () => {
      const currentMatch = await getDoc(doc(db, 'matches', match.id));
      if (currentMatch.exists() && currentMatch.data().status === 'pending') {
        await updateDoc(doc(db, 'matches', match.id), {
          status: 'expired'
        });
        
        // Try next contractor
        console.log('Match expired, trying next contractor');
      }
    }, 60 * 1000);
  }
  
  // Contractor accepts a match
  async acceptMatch(matchId: string, contractorId: string): Promise<void> {
    const matchDoc = await getDoc(doc(db, 'matches', matchId));
    if (!matchDoc.exists()) throw new Error('Match not found');
    
    const match = matchDoc.data() as Match;
    
    // Verify contractor and status
    if (match.contractorId !== contractorId) {
      throw new Error('Unauthorized');
    }
    
    if (match.status !== 'pending') {
      throw new Error('Match no longer available');
    }
    
    // Update match status
    await updateDoc(doc(db, 'matches', matchId), {
      status: 'accepted',
      acceptedAt: Timestamp.now()
    });
    
    // Update request status
    await updateDoc(doc(db, 'serviceRequests', match.requestId), {
      status: 'matched',
      matchedContractorId: contractorId,
      matchedAt: Timestamp.now()
    });
    
    // Update contractor availability
    await updateDoc(doc(db, 'contractorAvailability', contractorId), {
      status: 'busy',
      currentJob: {
        jobId: match.requestId,
        estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours default
      }
    });
    
    // Notify customer
    await this.notifyCustomerOfMatch(match.customerId, contractorId, match);
    
    // Cancel other pending matches for this request
    await this.cancelOtherMatches(match.requestId, matchId);
  }
  
  // Update contractor location in real-time
  async updateContractorLocation(
    contractorId: string,
    location: { lat: number; lng: number }
  ): Promise<void> {
    await updateDoc(doc(db, 'contractorAvailability', contractorId), {
      currentLocation: {
        lat: location.lat,
        lng: location.lng,
        lastUpdated: Timestamp.now()
      }
    });
    
    // If contractor is on a job, update customer with ETA
    const availability = await getDoc(doc(db, 'contractorAvailability', contractorId));
    if (availability.exists() && availability.data().currentJob) {
      await this.updateCustomerETA(
        availability.data().currentJob.jobId,
        location
      );
    }
  }
  
  // Set contractor availability
  async setContractorAvailability(
    contractorId: string,
    available: boolean,
    location?: { lat: number; lng: number }
  ): Promise<void> {
    const update: any = {
      status: available ? 'available' : 'offline',
      lastStatusChange: Timestamp.now()
    };
    
    if (location) {
      update.currentLocation = {
        ...location,
        lastUpdated: Timestamp.now()
      };
    }
    
    await updateDoc(doc(db, 'contractorAvailability', contractorId), update);
  }
  
  // Track contractor performance metrics
  async updateContractorMetrics(
    contractorId: string,
    metrics: {
      responseTime?: number;
      accepted?: boolean;
      jobCompleted?: boolean;
      rating?: number;
    }
  ): Promise<void> {
    const updates: any = {};
    
    if (metrics.responseTime !== undefined) {
      // Update average response time
      updates.totalResponseTime = increment(metrics.responseTime);
      updates.responseCount = increment(1);
    }
    
    if (metrics.accepted !== undefined) {
      updates.acceptanceCount = increment(metrics.accepted ? 1 : 0);
      updates.offerCount = increment(1);
    }
    
    if (metrics.jobCompleted) {
      updates.completedJobs = increment(1);
    }
    
    if (metrics.rating !== undefined) {
      updates.totalRating = increment(metrics.rating);
      updates.ratingCount = increment(1);
    }
    
    await updateDoc(doc(db, 'contractorMetrics', contractorId), updates);
  }
  
  // Helper methods
  private calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const lat1 = this.toRad(point1.lat);
    const lat2 = this.toRad(point2.lat);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * 
              Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }
  
  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  private calculateBounds(
    center: { lat: number; lng: number },
    radiusMiles: number
  ): { north: number; south: number; east: number; west: number } {
    const lat = center.lat;
    const lng = center.lng;
    
    // Rough approximation (1 degree latitude ≈ 69 miles)
    const latDelta = radiusMiles / 69;
    const lngDelta = radiusMiles / (69 * Math.cos(this.toRad(lat)));
    
    return {
      north: lat + latDelta,
      south: lat - latDelta,
      east: lng + lngDelta,
      west: lng - lngDelta
    };
  }
  
  private estimateArrivalTime(distance: number, currentJob?: any): number {
    // Base travel time (average 30 mph in urban areas)
    let travelTime = (distance / 30) * 60; // minutes
    
    // Add time if contractor is on another job
    if (currentJob && currentJob.estimatedCompletion) {
      const remainingJobTime = Math.max(
        0,
        (new Date(currentJob.estimatedCompletion).getTime() - Date.now()) / 60000
      );
      travelTime += remainingJobTime;
    }
    
    // Add buffer time (5-10 minutes)
    travelTime += 5 + Math.random() * 5;
    
    return Math.round(travelTime);
  }
  
  private async estimatePrice(service: any, distance: number): Promise<number> {
    // Base price from service
    let basePrice = 100; // Default
    
    // Add distance-based fee (like Uber)
    const distanceFee = distance * 2; // $2 per mile
    
    // Urgency multiplier
    const urgencyMultiplier = service.urgency === 'emergency' ? 1.5 : 1;
    
    return Math.round((basePrice + distanceFee) * urgencyMultiplier);
  }
  
  private calculateSkillMatch(
    contractorSkills: string[],
    requiredSkills: string[]
  ): number {
    if (requiredSkills.length === 0) return 100;
    
    const matches = requiredSkills.filter(skill => 
      contractorSkills.includes(skill)
    ).length;
    
    return (matches / requiredSkills.length) * 100;
  }
  
  private calculateAvailabilityScore(
    contractor: ContractorAvailability,
    request: ServiceRequest
  ): number {
    let score = 100;
    
    // Reduce score if contractor is currently busy
    if (contractor.currentJob) {
      score -= 30;
    }
    
    // Check working hours
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(contractor.workingHours.start.split(':')[0]);
    const endHour = parseInt(contractor.workingHours.end.split(':')[0]);
    
    if (currentHour < startHour || currentHour >= endHour) {
      score -= 20; // Outside normal hours
    }
    
    // Boost score for instant availability
    if (contractor.instantAvailability) {
      score += 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  private async getContractorProfile(contractorId: string): Promise<any> {
    const contractorDoc = await getDoc(doc(db, 'contractors', contractorId));
    return contractorDoc.exists() ? contractorDoc.data() : null;
  }
  
  private async sendPushNotification(
    contractorId: string,
    notification: any
  ): Promise<void> {
    // Call Firebase Cloud Function to send push notification
    const sendNotification = httpsCallable(functions, 'sendPushNotification');
    await sendNotification({
      userId: contractorId,
      notification
    });
  }
  
  private async notifyCustomerOfMatch(
    customerId: string,
    contractorId: string,
    match: Match
  ): Promise<void> {
    // Get contractor details
    const contractor = await this.getContractorProfile(contractorId);
    
    // Send notification to customer
    await this.sendPushNotification(customerId, {
      title: 'Contractor Matched!',
      body: `${contractor.name} is on the way. ETA: ${match.factors.estimatedArrival} minutes`,
      data: {
        contractorId,
        matchId: match.id,
        eta: match.factors.estimatedArrival
      }
    });
  }
  
  private async updateCustomerETA(
    jobId: string,
    contractorLocation: { lat: number; lng: number }
  ): Promise<void> {
    // Get job details
    const job = await getDoc(doc(db, 'serviceRequests', jobId));
    if (!job.exists()) return;
    
    const jobData = job.data();
    const distance = this.calculateDistance(
      jobData.customerLocation,
      contractorLocation
    );
    
    const newETA = this.estimateArrivalTime(distance);
    
    // Update job with new ETA
    await updateDoc(doc(db, 'serviceRequests', jobId), {
      contractorETA: newETA,
      contractorLocation,
      lastETAUpdate: Timestamp.now()
    });
  }
  
  private async cancelOtherMatches(requestId: string, acceptedMatchId: string): Promise<void> {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('requestId', '==', requestId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(matchesQuery);
    
    const updates = snapshot.docs
      .filter(doc => doc.id !== acceptedMatchId)
      .map(doc => 
        updateDoc(doc.ref, { status: 'cancelled' })
      );
    
    await Promise.all(updates);
  }
  
  private scheduleSearchExpansion(requestId: string): void {
    // Expand search radius every 2 minutes
    const expansionInterval = setInterval(async () => {
      const request = await getDoc(doc(db, 'serviceRequests', requestId));
      
      if (!request.exists() || request.data().status !== 'searching') {
        clearInterval(expansionInterval);
        return;
      }
      
      const currentRadius = request.data().matchingMetadata.searchRadius;
      if (currentRadius < 20) { // Max 20 miles
        await updateDoc(doc(db, 'serviceRequests', requestId), {
          'matchingMetadata.searchRadius': currentRadius + 5
        });
        
        console.log(`Expanded search radius to ${currentRadius + 5} miles`);
      }
    }, 2 * 60 * 1000); // 2 minutes
  }
  
  private stopMatching(requestId: string): void {
    const unsubscribe = this.activeSearches.get(requestId);
    if (unsubscribe) {
      unsubscribe();
      this.activeSearches.delete(requestId);
    }
  }
  
  // Subscribe to real-time updates for customer
  subscribeToRequest(
    requestId: string,
    onUpdate: (request: ServiceRequest) => void
  ): () => void {
    return onSnapshot(
      doc(db, 'serviceRequests', requestId),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as ServiceRequest);
        }
      }
    );
  }
  
  // Subscribe to contractor opportunities
  subscribeToOpportunities(
    contractorId: string,
    onNewMatch: (match: Match) => void
  ): () => void {
    return onSnapshot(
      query(
        collection(db, 'matches'),
        where('contractorId', '==', contractorId),
        where('status', '==', 'pending'),
        orderBy('offeredAt', 'desc')
      ),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            onNewMatch({
              ...change.doc.data() as Match,
              id: change.doc.id
            });
          }
        });
      }
    );
  }
}

// Export singleton instance
export const matchingService = new RealtimeMatchingService();