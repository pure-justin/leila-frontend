import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export interface UserPreferences {
  userId: string;
  favoriteServices: string[];
  recentSearches: Array<{
    query: string;
    timestamp: Date;
  }>;
  viewedServices: Array<{
    serviceId: string;
    timestamp: Date;
    viewCount: number;
  }>;
  bookedServices: Array<{
    serviceId: string;
    categoryId: string;
    timestamp: Date;
  }>;
  preferredCategories: string[];
  servicePreferences: {
    preferredTimeSlots: string[];
    priceRange: 'budget' | 'mid' | 'premium' | 'all';
    preferredDays: string[];
  };
  lastUpdated: Date;
}

export interface ServiceRecommendation {
  serviceId: string;
  score: number;
  reason: 'frequently_viewed' | 'recently_searched' | 'similar_to_booked' | 'trending' | 'personalized';
}

class UserPreferencesService {
  private readonly COLLECTION = 'userPreferences';
  private cache: Map<string, UserPreferences> = new Map();

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    // Check cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!;
    }

    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserPreferences;
        this.cache.set(userId, data);
        return data;
      }

      // Create default preferences
      const defaultPrefs: UserPreferences = {
        userId,
        favoriteServices: [],
        recentSearches: [],
        viewedServices: [],
        bookedServices: [],
        preferredCategories: [],
        servicePreferences: {
          preferredTimeSlots: [],
          priceRange: 'all',
          preferredDays: []
        },
        lastUpdated: new Date()
      };

      await this.saveUserPreferences(userId, defaultPrefs);
      return defaultPrefs;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await setDoc(docRef, {
        ...preferences,
        userId,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      // Update cache
      const cached = this.cache.get(userId) || {} as UserPreferences;
      this.cache.set(userId, { ...cached, ...preferences, userId });
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  async trackServiceView(userId: string, serviceId: string): Promise<void> {
    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) return;

      const existingView = prefs.viewedServices.find(v => v.serviceId === serviceId);
      
      if (existingView) {
        existingView.viewCount++;
        existingView.timestamp = new Date();
      } else {
        prefs.viewedServices.push({
          serviceId,
          timestamp: new Date(),
          viewCount: 1
        });
      }

      // Keep only last 50 viewed services
      prefs.viewedServices = prefs.viewedServices
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 50);

      await this.saveUserPreferences(userId, { viewedServices: prefs.viewedServices });
    } catch (error) {
      console.error('Error tracking service view:', error);
    }
  }

  async trackSearch(userId: string, query: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await updateDoc(docRef, {
        recentSearches: arrayUnion({
          query,
          timestamp: new Date()
        })
      });

      // Keep only last 20 searches
      const prefs = await this.getUserPreferences(userId);
      if (prefs && prefs.recentSearches.length > 20) {
        prefs.recentSearches = prefs.recentSearches.slice(-20);
        await this.saveUserPreferences(userId, { recentSearches: prefs.recentSearches });
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  async trackBooking(userId: string, serviceId: string, categoryId: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      await updateDoc(docRef, {
        bookedServices: arrayUnion({
          serviceId,
          categoryId,
          timestamp: new Date()
        })
      });

      // Update preferred categories based on bookings
      const prefs = await this.getUserPreferences(userId);
      if (prefs) {
        const categoryCount = new Map<string, number>();
        prefs.bookedServices.forEach(booking => {
          categoryCount.set(booking.categoryId, (categoryCount.get(booking.categoryId) || 0) + 1);
        });

        // Get top 5 categories
        const topCategories = Array.from(categoryCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([categoryId]) => categoryId);

        await this.saveUserPreferences(userId, { preferredCategories: topCategories });
      }
    } catch (error) {
      console.error('Error tracking booking:', error);
    }
  }

  async toggleFavorite(userId: string, serviceId: string): Promise<boolean> {
    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) return false;

      const index = prefs.favoriteServices.indexOf(serviceId);
      if (index > -1) {
        prefs.favoriteServices.splice(index, 1);
      } else {
        prefs.favoriteServices.push(serviceId);
      }

      await this.saveUserPreferences(userId, { favoriteServices: prefs.favoriteServices });
      return index === -1; // Return true if added, false if removed
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<ServiceRecommendation[]> {
    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) return [];

      const recommendations: Map<string, ServiceRecommendation> = new Map();

      // 1. Recently viewed services (high score)
      prefs.viewedServices
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5)
        .forEach(view => {
          recommendations.set(view.serviceId, {
            serviceId: view.serviceId,
            score: 0.8 + (view.viewCount * 0.02),
            reason: 'frequently_viewed'
          });
        });

      // 2. Services from recent searches
      const recentSearchTerms = prefs.recentSearches
        .slice(-10)
        .map(s => s.query.toLowerCase());

      // This would be enhanced with actual service matching
      // For now, we'll return a placeholder

      // 3. Similar to booked services
      prefs.bookedServices
        .slice(-5)
        .forEach(booking => {
          // In a real implementation, we'd find similar services
          // based on category, price range, etc.
        });

      // 4. Favorite services (highest score)
      prefs.favoriteServices.forEach(serviceId => {
        const existing = recommendations.get(serviceId);
        if (existing) {
          existing.score = Math.min(1, existing.score + 0.3);
        } else {
          recommendations.set(serviceId, {
            serviceId,
            score: 0.9,
            reason: 'frequently_viewed'
          });
        }
      });

      // Sort by score and return top recommendations
      return Array.from(recommendations.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Clear cache when needed
  clearCache(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
    } else {
      this.cache.clear();
    }
  }
}

export const userPreferencesService = new UserPreferencesService();