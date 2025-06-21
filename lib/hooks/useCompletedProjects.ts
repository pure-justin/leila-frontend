import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, GeoPoint, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CompletedProject {
  id: string;
  serviceType: string;
  position: { lat: number; lng: number };
  contractor: {
    id: string;
    name: string;
    rating?: number;
    userScore: number;
    leilaScore: number;
    completedJobs: number;
  };
  customer: {
    name: string;
    avatar?: string;
  };
  completionDate: Date;
  duration: string;
  cost: number;
  status: string;
  rating?: number;
  userScore: number;
  leilaScore: number;
  isRecent: boolean;
  description: string;
  photos: Array<{
    id: string;
    url: string;
    type: string;
    aiApproved: boolean;
  }>;
  aiQualityScore: number;
  paymentStatus: string;
}

export function useCompletedProjects(userAddress?: string, radiusKm: number = 5) {
  const [projects, setProjects] = useState<CompletedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // For now, return mock data since we don't have real projects in Firestore yet
        // In production, this would query Firestore for completed projects near the user
        const mockProjects: CompletedProject[] = [];
        
        // TODO: Implement real Firestore query when we have project data
        // const projectsRef = collection(db, 'projects');
        // const q = query(
        //   projectsRef,
        //   where('status', '==', 'completed'),
        //   where('completionDate', '>=', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))
        // );
        // const snapshot = await getDocs(q);
        
        setProjects(mockProjects);
      } catch (err) {
        console.error('Error fetching completed projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userAddress, radiusKm]);

  return { projects, loading, error };
}