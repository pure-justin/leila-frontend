'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit as firestoreLimit, orderBy } from 'firebase/firestore';

export interface Contractor {
  id: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  email: string;
  phone?: string;
  photoURL?: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  responseTime: number;
  hourlyRate: number;
  services: string[];
  serviceAreas: string[];
  verified: boolean;
  insured: boolean;
  licensed: boolean;
  bio?: string;
  location?: {
    lat: number;
    lng: number;
  };
  stats?: {
    onTimeArrival: number;
    completionRate: number;
    repeatCustomers: number;
  };
}

export function useContractors(service?: string, limit?: number) {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        let q = query(
          collection(db, 'contractors'),
          orderBy('rating', 'desc')
        );

        if (service) {
          q = query(
            collection(db, 'contractors'),
            where('services', 'array-contains', service),
            orderBy('rating', 'desc')
          );
        }

        if (limit) {
          q = query(q, firestoreLimit(limit));
        }

        const snapshot = await getDocs(q);
        const contractorData: Contractor[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          contractorData.push({
            id: doc.id,
            firstName: data.firstName || 'Unknown',
            lastName: data.lastName || '',
            businessName: data.businessName || data.businessInfo?.companyName || '',
            email: data.email || '',
            phone: data.phone || '',
            photoURL: data.photoURL || data.photo || '',
            rating: data.rating || 4.5,
            totalReviews: data.totalReviews || 0,
            completedJobs: data.completedJobs || 0,
            responseTime: data.responseTime || 30,
            hourlyRate: data.pricing?.hourlyRate || data.hourlyRate || 100,
            services: data.services || [],
            serviceAreas: data.serviceAreas || [],
            verified: data.verified || false,
            insured: data.insurance?.verified || data.insured || false,
            licensed: data.license?.verified || data.licensed || false,
            bio: data.bio || '',
            location: data.location || null,
            stats: data.stats || {
              onTimeArrival: 95,
              completionRate: 98,
              repeatCustomers: 40
            }
          });
        });

        // If no contractors found, return some default data
        if (contractorData.length === 0) {
          contractorData.push(
            {
              id: '1',
              firstName: 'Mike',
              lastName: 'Johnson',
              businessName: "Mike's Plumbing",
              email: 'mike@example.com',
              rating: 4.8,
              totalReviews: 156,
              completedJobs: 289,
              responseTime: 15,
              hourlyRate: 125,
              services: ['Plumbing', 'Emergency Plumbing'],
              serviceAreas: ['Downtown', 'Westside'],
              verified: true,
              insured: true,
              licensed: true,
              stats: {
                onTimeArrival: 98,
                completionRate: 99.5,
                repeatCustomers: 45
              }
            },
            {
              id: '2',
              firstName: 'Sarah',
              lastName: 'Williams',
              businessName: 'Quick Electric Pro',
              email: 'sarah@example.com',
              rating: 4.9,
              totalReviews: 234,
              completedJobs: 412,
              responseTime: 20,
              hourlyRate: 150,
              services: ['Electrical', 'Emergency Electrical'],
              serviceAreas: ['Northside', 'Eastside'],
              verified: true,
              insured: true,
              licensed: true,
              stats: {
                onTimeArrival: 97,
                completionRate: 99,
                repeatCustomers: 52
              }
            },
            {
              id: '3',
              firstName: 'David',
              lastName: 'Chen',
              businessName: 'Green Lawn Care',
              email: 'david@example.com',
              rating: 4.7,
              totalReviews: 189,
              completedJobs: 567,
              responseTime: 30,
              hourlyRate: 75,
              services: ['Lawn Care', 'Landscaping'],
              serviceAreas: ['All Areas'],
              verified: true,
              insured: true,
              licensed: false,
              stats: {
                onTimeArrival: 96,
                completionRate: 98.5,
                repeatCustomers: 68
              }
            }
          );
        }

        setContractors(contractorData);
        setError(null);
      } catch (err) {
        console.error('Error fetching contractors:', err);
        setError('Failed to load contractors');
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, [service, limit]);

  return { contractors, loading, error };
}

// Hook to get a single contractor
export function useContractor(contractorId: string) {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractor = async () => {
      if (!contractorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const contractorDoc = await getDocs(
          query(collection(db, 'contractors'), where('__name__', '==', contractorId))
        );

        if (!contractorDoc.empty) {
          const data = contractorDoc.docs[0].data();
          setContractor({
            id: contractorDoc.docs[0].id,
            firstName: data.firstName || 'Unknown',
            lastName: data.lastName || '',
            businessName: data.businessName || data.businessInfo?.companyName || '',
            email: data.email || '',
            phone: data.phone || '',
            photoURL: data.photoURL || data.photo || '',
            rating: data.rating || 4.5,
            totalReviews: data.totalReviews || 0,
            completedJobs: data.completedJobs || 0,
            responseTime: data.responseTime || 30,
            hourlyRate: data.pricing?.hourlyRate || data.hourlyRate || 100,
            services: data.services || [],
            serviceAreas: data.serviceAreas || [],
            verified: data.verified || false,
            insured: data.insurance?.verified || data.insured || false,
            licensed: data.license?.verified || data.licensed || false,
            bio: data.bio || '',
            location: data.location || null,
            stats: data.stats || {
              onTimeArrival: 95,
              completionRate: 98,
              repeatCustomers: 40
            }
          });
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching contractor:', err);
        setError('Failed to load contractor');
      } finally {
        setLoading(false);
      }
    };

    fetchContractor();
  }, [contractorId]);

  return { contractor, loading, error };
}