import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';

// Real-time booking listener
export function subscribeToBookings(callback: (bookings: any[]) => void) {
  const q = query(
    collection(db, 'bookings'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(bookings);
  });
}

// Create a new booking
export async function createBooking(bookingData: any) {
  const booking = {
    ...bookingData,
    createdAt: serverTimestamp(),
    status: 'pending'
  };
  
  const docRef = await addDoc(collection(db, 'bookings'), booking);
  return { id: docRef.id, ...booking };
}

// Get contractor list
export async function getContractors(serviceType?: string) {
  let q = collection(db, 'contractors');
  
  if (serviceType) {
    q = query(q, where('services', 'array-contains', serviceType)) as any;
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Cloud Functions
export const calculatePrice = httpsCallable(functions, 'calculatePriceFlash');
export const chatWithAI = httpsCallable(functions, 'chatWithFlash');
export const estimateFromImage = httpsCallable(functions, 'estimateServiceFromImage');
export const verifyDocuments = httpsCallable(functions, 'verifyContractorDocuments');
export const verifyJobCompletion = httpsCallable(functions, 'verifyJobCompletion');
export const getUploadUrl = httpsCallable(functions, 'getUploadUrl');

// Enhanced chat with context
export async function sendChatMessage(message: string, conversationId?: string) {
  const result = await chatWithAI({
    message,
    conversationId,
    userId: 'anonymous' // Replace with actual user ID when auth is implemented
  });
  
  return result.data;
}

// Get service estimate from image
export async function analyzeServiceImage(imageUrl: string, serviceType: string, additionalInfo?: string) {
  const result = await estimateFromImage({
    imageUrl,
    serviceType,
    additionalInfo
  });
  
  return result.data;
}

// Real-time contractor tracking
export function trackContractorLocation(contractorId: string, callback: (location: any) => void) {
  const docRef = doc(db, 'contractors', contractorId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      if (data.currentLocation) {
        callback(data.currentLocation);
      }
    }
  });
}

// Job status updates
export async function updateJobStatus(jobId: string, status: string, notes?: string) {
  const jobRef = doc(db, 'jobs', jobId);
  const updates: any = {
    status,
    lastUpdated: serverTimestamp()
  };
  
  if (notes) {
    updates.statusNotes = notes;
  }
  
  if (status === 'completed') {
    updates.completedAt = serverTimestamp();
  }
  
  await updateDoc(jobRef, updates);
}

// Analytics
export async function getServiceStats() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const bookingsQuery = query(
    collection(db, 'bookings'),
    where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo))
  );
  
  const snapshot = await getDocs(bookingsQuery);
  const bookings = snapshot.docs.map(doc => doc.data());
  
  // Calculate stats
  const stats = {
    totalBookings: bookings.length,
    completedJobs: bookings.filter(b => b.status === 'completed').length,
    averageRating: 0,
    topServices: {} as Record<string, number>
  };
  
  // Count services
  bookings.forEach(booking => {
    if (booking.service) {
      stats.topServices[booking.service] = (stats.topServices[booking.service] || 0) + 1;
    }
  });
  
  return stats;
}

// Legacy API compatibility layer
export const legacyApi = {
  async getBookings() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apiBookings`);
    return response.json();
  },
  
  async createBooking(data: any) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apiBookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async getContractors() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apiContractors`);
    return response.json();
  }
};