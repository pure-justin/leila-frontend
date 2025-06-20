import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Customer, 
  Contractor, 
  Booking, 
  Service, 
  ApiKey,
  Promotion,
  AnalyticsEvent,
  Notification,
  UserRole,
  BookingStatus,
  ServiceCategory
} from '@/lib/types/firestore-models';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BOOKINGS: 'bookings',
  SERVICES: 'services',
  API_KEYS: 'api_keys',
  PROMOTIONS: 'promotions',
  ANALYTICS: 'analytics',
  NOTIFICATIONS: 'notifications'
} as const;

// Generic CRUD operations
class FirestoreService {
  // Convert Firestore timestamps to JS dates
  private convertTimestamps(data: DocumentData): any {
    const converted = { ...data };
    Object.keys(converted).forEach(key => {
      if (converted[key] instanceof Timestamp) {
        converted[key] = converted[key].toDate();
      } else if (typeof converted[key] === 'object' && converted[key] !== null) {
        converted[key] = this.convertTimestamps(converted[key]);
      }
    });
    return converted;
  }

  // Generic get document
  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collection, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...this.convertTimestamps(docSnap.data())
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  }

  // Generic create document
  async createDocument<T extends { id: string }>(
    collectionName: string, 
    data: Omit<T, 'id'>,
    customId?: string
  ): Promise<T> {
    try {
      const id = customId || doc(collection(db, collectionName)).id;
      const docRef = doc(db, collectionName, id);
      
      const timestamp = serverTimestamp();
      const docData = {
        ...data,
        metadata: {
          ...((data as any).metadata || {}),
          createdAt: timestamp,
          updatedAt: timestamp
        }
      };

      await setDoc(docRef, docData);
      
      return {
        id,
        ...data,
        metadata: {
          ...((data as any).metadata || {}),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      } as unknown as T & { id: string };
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  // Generic update document
  async updateDocument<T>(
    collection: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    try {
      const docRef = doc(db, collection, id);
      
      const updateData = {
        ...updates,
        'metadata.updatedAt': serverTimestamp()
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  // Generic delete document
  async deleteDocument(collection: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collection, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  // Generic query documents
  async queryDocuments<T>(
    collectionName: string,
    constraints: QueryConstraint[],
    pageSize: number = 20,
    lastDoc?: DocumentData
  ): Promise<{ data: T[], lastDoc: DocumentData | null }> {
    try {
      let q = query(collection(db, collectionName), ...constraints, limit(pageSize));
      
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const data: T[] = [];
      let lastDocument: DocumentData | null = null;

      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        } as T);
        lastDocument = doc;
      });

      return { data, lastDoc: lastDocument };
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }
}

// User Service
export class UserService extends FirestoreService {
  async getUser(userId: string): Promise<Customer | Contractor | null> {
    return this.getDocument<Customer | Contractor>(COLLECTIONS.USERS, userId);
  }

  async createCustomer(data: Omit<Customer, 'id'>): Promise<Customer> {
    const customerData: Omit<Customer, 'id'> = {
      ...data,
      role: UserRole.CUSTOMER,
      analytics: {
        totalBookings: 0,
        totalSpent: 0,
        averageRating: 0,
        lifetime_value: 0,
        ...data.analytics
      }
    };
    return this.createDocument<Customer>(COLLECTIONS.USERS, customerData);
  }

  async createContractor(data: Omit<Contractor, 'id'>): Promise<Contractor> {
    const contractorData: Omit<Contractor, 'id'> = {
      ...data,
      role: UserRole.CONTRACTOR,
      ratings: {
        overall: 0,
        punctuality: 0,
        quality: 0,
        communication: 0,
        value: 0,
        totalReviews: 0,
        ...data.ratings
      },
      performance: {
        completionRate: 100,
        responseTime: 0,
        acceptanceRate: 100,
        cancellationRate: 0,
        onTimeRate: 100,
        ...data.performance
      }
    };
    return this.createDocument<Contractor>(COLLECTIONS.USERS, contractorData);
  }

  async updateUser(userId: string, updates: Partial<Customer | Contractor>): Promise<void> {
    return this.updateDocument(COLLECTIONS.USERS, userId, updates);
  }

  async getAllUsers(): Promise<(Customer | Contractor)[]> {
    const result = await this.queryDocuments<Customer | Contractor>(COLLECTIONS.USERS, [], 1000);
    return result.data;
  }

  async searchContractors(category?: ServiceCategory, zipCode?: string, pageSize?: number, lastDoc?: DocumentData) {
    const constraints: QueryConstraint[] = [
      where('role', '==', UserRole.CONTRACTOR),
      where('status', '==', 'ACTIVE')
    ];

    if (category) {
      constraints.push(where('services.categories', 'array-contains', category));
    }

    if (zipCode) {
      constraints.push(where('businessInfo.serviceAreas', 'array-contains', zipCode));
    }

    constraints.push(orderBy('ratings.overall', 'desc'));

    return this.queryDocuments<Contractor>(COLLECTIONS.USERS, constraints, pageSize, lastDoc);
  }

  async getUsersByRole(role: UserRole, pageSize?: number, lastDoc?: DocumentData) {
    const constraints = [where('role', '==', role), orderBy('metadata.createdAt', 'desc')];
    return this.queryDocuments<Customer | Contractor>(COLLECTIONS.USERS, constraints, pageSize, lastDoc);
  }

  async searchContractorsByService(
    category: ServiceCategory,
    zipCode?: string,
    pageSize?: number,
    lastDoc?: DocumentData
  ) {
    const constraints = [
      where('role', '==', UserRole.CONTRACTOR),
      where('services.categories', 'array-contains', category),
      where('status', '==', 'ACTIVE'),
      orderBy('ratings.overall', 'desc')
    ];

    return this.queryDocuments<Contractor>(COLLECTIONS.USERS, constraints, pageSize, lastDoc);
  }

  async updateUserAnalytics(userId: string, booking: Booking): Promise<void> {
    const updates = {
      'analytics.totalBookings': increment(1),
      'analytics.totalSpent': increment(booking.pricing.finalAmount || 0),
      'analytics.lastBookingDate': serverTimestamp()
    };
    
    await this.updateDocument(COLLECTIONS.USERS, userId, updates);
  }
}

// Booking Service
export class BookingService extends FirestoreService {
  async createBooking(data: Omit<Booking, 'id'>): Promise<Booking> {
    return this.createDocument<Booking>(COLLECTIONS.BOOKINGS, data);
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    return this.getDocument<Booking>(COLLECTIONS.BOOKINGS, bookingId);
  }

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    return this.updateDocument(COLLECTIONS.BOOKINGS, bookingId, updates);
  }

  async getRecentBookings(limit: number = 10): Promise<Booking[]> {
    const constraints = [orderBy('metadata.createdAt', 'desc')];
    const result = await this.queryDocuments<Booking>(COLLECTIONS.BOOKINGS, constraints, limit);
    return result.data;
  }

  async getBookingsByCustomer(customerId: string, pageSize?: number, lastDoc?: DocumentData) {
    const constraints = [
      where('customerId', '==', customerId),
      orderBy('metadata.createdAt', 'desc')
    ];
    return this.queryDocuments<Booking>(COLLECTIONS.BOOKINGS, constraints, pageSize, lastDoc);
  }

  async getBookingsByContractor(contractorId: string, status?: BookingStatus, pageSize?: number, lastDoc?: DocumentData) {
    const constraints = [
      where('contractorId', '==', contractorId),
      ...(status ? [where('status', '==', status)] : []),
      orderBy('schedule.requestedDate', 'asc')
    ];
    return this.queryDocuments<Booking>(COLLECTIONS.BOOKINGS, constraints, pageSize, lastDoc);
  }

  async getAvailableBookings(category?: ServiceCategory, pageSize?: number, lastDoc?: DocumentData) {
    const constraints = [
      where('status', '==', BookingStatus.PENDING),
      ...(category ? [where('details.category', '==', category)] : []),
      orderBy('details.urgency', 'desc'),
      orderBy('schedule.requestedDate', 'asc')
    ];
    return this.queryDocuments<Booking>(COLLECTIONS.BOOKINGS, constraints, pageSize, lastDoc);
  }

  async assignContractor(bookingId: string, contractorId: string): Promise<void> {
    const updates = {
      contractorId,
      status: BookingStatus.ASSIGNED,
      'schedule.confirmedDate': serverTimestamp()
    };
    return this.updateDocument(COLLECTIONS.BOOKINGS, bookingId, updates);
  }
}

// Service Management
export class ServiceManagement extends FirestoreService {
  async createService(data: Omit<Service, 'id'>): Promise<Service> {
    return this.createDocument<Service>(COLLECTIONS.SERVICES, data);
  }

  async getService(serviceId: string): Promise<Service | null> {
    return this.getDocument<Service>(COLLECTIONS.SERVICES, serviceId);
  }

  async getServicesByCategory(category: ServiceCategory) {
    const constraints = [
      where('category', '==', category),
      where('active', '==', true),
      orderBy('name', 'asc')
    ];
    return this.queryDocuments<Service>(COLLECTIONS.SERVICES, constraints, 100);
  }

  async updateService(serviceId: string, updates: Partial<Service>): Promise<void> {
    return this.updateDocument(COLLECTIONS.SERVICES, serviceId, updates);
  }
}

// API Key Service
export class ApiKeyService extends FirestoreService {
  async createApiKey(data: Omit<ApiKey, 'id' | 'key'>): Promise<{ apiKey: ApiKey, plainKey: string }> {
    // Generate a secure API key
    const plainKey = this.generateApiKey();
    const hashedKey = await this.hashApiKey(plainKey);
    
    const apiKeyData = {
      ...data,
      key: hashedKey,
      usage: {
        totalRequests: 0,
        monthlyRequests: {}
      },
      active: true
    };

    const apiKey = await this.createDocument<ApiKey>(COLLECTIONS.API_KEYS, apiKeyData);
    
    return { apiKey, plainKey };
  }

  async validateApiKey(plainKey: string): Promise<ApiKey | null> {
    const hashedKey = await this.hashApiKey(plainKey);
    const constraints = [
      where('key', '==', hashedKey),
      where('active', '==', true)
    ];
    
    const result = await this.queryDocuments<ApiKey>(COLLECTIONS.API_KEYS, constraints, 1);
    
    if (result.data.length === 0) return null;
    
    const apiKey = result.data[0];
    
    // Check expiration
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }
    
    // Update usage
    await this.incrementApiKeyUsage(apiKey.id);
    
    return apiKey;
  }

  private async incrementApiKeyUsage(apiKeyId: string): Promise<void> {
    const monthKey = new Date().toISOString().slice(0, 7); // "2024-01"
    const updates = {
      'usage.totalRequests': increment(1),
      'usage.lastUsedAt': serverTimestamp(),
      [`usage.monthlyRequests.${monthKey}`]: increment(1)
    };
    
    await this.updateDocument(COLLECTIONS.API_KEYS, apiKeyId, updates);
  }

  private generateApiKey(): string {
    const prefix = 'sk_live_';
    const randomBytes = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');
    return prefix + randomBytes;
  }

  private async hashApiKey(plainKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Promotion Service
export class PromotionService extends FirestoreService {
  async createPromotion(data: Omit<Promotion, 'id'>): Promise<Promotion> {
    return this.createDocument<Promotion>(COLLECTIONS.PROMOTIONS, data);
  }

  async getActivePromotions(userId: string, category?: ServiceCategory): Promise<Promotion[]> {
    const now = new Date();
    const constraints = [
      where('active', '==', true),
      where('validity.startDate', '<=', now),
      where('validity.endDate', '>=', now)
    ];
    
    const result = await this.queryDocuments<Promotion>(COLLECTIONS.PROMOTIONS, constraints, 50);
    
    // Filter by targeting criteria
    return result.data.filter(promo => {
      // Check category if specified
      if (category && promo.targeting.serviceCategories.length > 0 && 
          !promo.targeting.serviceCategories.includes(category)) {
        return false;
      }
      
      // Check usage limits
      if (promo.validity.usageLimit && promo.usage.totalUsed >= promo.validity.usageLimit) {
        return false;
      }
      
      // Check per-user usage
      if (promo.validity.usagePerUser && 
          promo.usage.userIds.filter(id => id === userId).length >= promo.validity.usagePerUser) {
        return false;
      }
      
      return true;
    });
  }

  async applyPromotion(promotionId: string, userId: string): Promise<void> {
    const updates = {
      'usage.totalUsed': increment(1),
      'usage.userIds': [...(await this.getPromotion(promotionId))?.usage.userIds || [], userId]
    };
    
    await this.updateDocument(COLLECTIONS.PROMOTIONS, promotionId, updates);
  }

  private async getPromotion(promotionId: string): Promise<Promotion | null> {
    return this.getDocument<Promotion>(COLLECTIONS.PROMOTIONS, promotionId);
  }
}

// Analytics Service
export class AnalyticsService extends FirestoreService {
  async trackEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<void> {
    await this.createDocument<AnalyticsEvent>(COLLECTIONS.ANALYTICS, event);
  }

  async getUserEvents(userId: string, eventName?: string, pageSize?: number, lastDoc?: DocumentData) {
    const constraints = [
      where('userId', '==', userId),
      ...(eventName ? [where('event', '==', eventName)] : []),
      orderBy('timestamp', 'desc')
    ];
    
    return this.queryDocuments<AnalyticsEvent>(COLLECTIONS.ANALYTICS, constraints, pageSize, lastDoc);
  }
}

// Notification Service
export class NotificationService extends FirestoreService {
  async createNotification(data: Omit<Notification, 'id'>): Promise<Notification> {
    return this.createDocument<Notification>(COLLECTIONS.NOTIFICATIONS, {
      ...data,
      read: false,
      sentAt: new Date()
    });
  }

  async getUserNotifications(userId: string, unreadOnly?: boolean, pageSize?: number, lastDoc?: DocumentData) {
    const constraints = [
      where('userId', '==', userId),
      ...(unreadOnly ? [where('read', '==', false)] : []),
      orderBy('sentAt', 'desc')
    ];
    
    return this.queryDocuments<Notification>(COLLECTIONS.NOTIFICATIONS, constraints, pageSize, lastDoc);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const updates = {
      read: true,
      readAt: serverTimestamp()
    };
    
    await this.updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, updates);
  }
}

// Export service instances
export const userService = new UserService();
export const bookingService = new BookingService();
export const serviceManagement = new ServiceManagement();
export const apiKeyService = new ApiKeyService();
export const promotionService = new PromotionService();
export const analyticsService = new AnalyticsService();
export const notificationService = new NotificationService();