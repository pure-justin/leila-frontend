import { findBestMatches, emergencyMatch, batchMatch } from '@/lib/matching-engine';
import type { MatchingCriteria } from '@/lib/matching-engine';

// Mock Supabase
jest.mock('@supabase/supabase-js');

describe('Matching Engine', () => {
  const mockCriteria: MatchingCriteria = {
    service: 'plumbing',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      radius: 10,
    },
    scheduledDate: new Date('2025-06-25T14:00:00'),
    urgency: 'normal',
    budget: {
      min: 50,
      max: 150,
    },
    customerPreferences: {
      minRating: 4.0,
      languages: ['English'],
    },
  };

  describe('findBestMatches', () => {
    it('should return matches sorted by score', async () => {
      const matches = await findBestMatches(mockCriteria, 5);
      
      // Verify matches are sorted in descending order
      for (let i = 1; i < matches.length; i++) {
        expect(matches[i - 1].score).toBeGreaterThanOrEqual(matches[i].score);
      }
    });

    it('should respect the limit parameter', async () => {
      const limit = 3;
      const matches = await findBestMatches(mockCriteria, limit);
      expect(matches.length).toBeLessThanOrEqual(limit);
    });

    it('should calculate all score components', async () => {
      const matches = await findBestMatches(mockCriteria, 1);
      
      if (matches.length > 0) {
        const match = matches[0];
        expect(match.breakdown).toHaveProperty('distance');
        expect(match.breakdown).toHaveProperty('availability');
        expect(match.breakdown).toHaveProperty('rating');
        expect(match.breakdown).toHaveProperty('price');
        expect(match.breakdown).toHaveProperty('experience');
        expect(match.breakdown).toHaveProperty('responseTime');
        expect(match.breakdown).toHaveProperty('matchQuality');
      }
    });

    it('should filter by minimum rating preference', async () => {
      const strictCriteria = {
        ...mockCriteria,
        customerPreferences: {
          minRating: 4.5,
        },
      };
      
      const matches = await findBestMatches(strictCriteria, 10);
      matches.forEach(match => {
        expect(match.contractor.rating).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe('emergencyMatch', () => {
    it('should prioritize nearby contractors for emergency', async () => {
      const emergencyCriteria = {
        ...mockCriteria,
        urgency: 'emergency' as const,
      };
      
      const match = await emergencyMatch(emergencyCriteria);
      
      if (match) {
        // Emergency matches should have reduced radius (10 miles)
        const distance = calculateTestDistance(
          emergencyCriteria.location,
          match.contractor.location
        );
        expect(distance).toBeLessThanOrEqual(10);
      }
    });

    it('should return single best match', async () => {
      const match = await emergencyMatch(mockCriteria);
      expect(match).toBeTruthy();
      expect(match?.score).toBeGreaterThan(0);
    });
  });

  describe('batchMatch', () => {
    it('should handle multiple jobs efficiently', async () => {
      const jobs: MatchingCriteria[] = [
        mockCriteria,
        { ...mockCriteria, service: 'electrical' },
        { ...mockCriteria, service: 'hvac' },
      ];
      
      const results = await batchMatch(jobs);
      
      expect(results.size).toBe(jobs.length);
      results.forEach((matches, index) => {
        expect(matches).toBeInstanceOf(Array);
        expect(matches.length).toBeGreaterThan(0);
      });
    });

    it('should group jobs by service and location', async () => {
      const jobs: MatchingCriteria[] = [
        mockCriteria,
        { ...mockCriteria, location: { lat: 40.7, lng: -74.0 } }, // Same area
        { ...mockCriteria, location: { lat: 41.0, lng: -73.0 } }, // Different area
      ];
      
      const results = await batchMatch(jobs);
      expect(results.size).toBe(jobs.length);
    });
  });

  describe('Score Calculations', () => {
    it('should give higher weight to distance for emergency jobs', async () => {
      const normalMatch = await findBestMatches(mockCriteria, 1);
      const emergencyMatch = await findBestMatches(
        { ...mockCriteria, urgency: 'emergency' },
        1
      );
      
      // Emergency jobs should prioritize closer contractors
      expect(emergencyMatch[0]?.breakdown.distance).toBeDefined();
    });

    it('should calculate price score within budget correctly', async () => {
      const matches = await findBestMatches(mockCriteria, 5);
      
      matches.forEach(match => {
        const rate = match.contractor.hourlyRate;
        const budget = mockCriteria.budget!;
        
        if (rate >= budget.min && rate <= budget.max) {
          expect(match.breakdown.price).toBeGreaterThanOrEqual(70);
        }
      });
    });

    it('should penalize very new contractors on complex jobs', async () => {
      const matches = await findBestMatches(mockCriteria, 10);
      
      const newContractors = matches.filter(
        m => m.contractor.completedJobs < 10
      );
      
      // New contractors should have slightly lower scores
      if (newContractors.length > 0) {
        expect(newContractors[0].score).toBeLessThan(100);
      }
    });
  });
});

// Helper function for testing
function calculateTestDistance(
  loc1: { lat: number; lng: number },
  loc2: { lat: number; lng: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}