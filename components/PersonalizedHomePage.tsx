'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, MapPin, Clock, Star, TrendingUp, Sparkles,
  Heart, Home, Calendar, ChevronRight, Filter
} from 'lucide-react';
import ServiceCategoryRow from './ServiceCategoryRow';
import { COMPREHENSIVE_SERVICE_CATALOG, ServiceSubcategory } from '@/lib/comprehensive-services-catalog';
import { getCategoryHeroImage, IMAGE_BLUR_DATA_URL } from '@/lib/service-images';
import { useAuth } from '@/contexts/AuthContext';
import { userPreferencesService, ServiceRecommendation } from '@/lib/user-preferences-service';
import StreamlinedBookingForm from './StreamlinedBookingForm';
import QuickActions from './QuickActions';

interface CategorySection {
  id: string;
  title: string;
  icon: string;
  services: ServiceSubcategory[];
  priority: number;
}

export default function PersonalizedHomePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<ServiceRecommendation[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user preferences and recommendations
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Show default categories for non-authenticated users
      loadDefaultCategories();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load user preferences
      const prefs = await userPreferencesService.getUserPreferences(user.uid);
      if (prefs) {
        setFavorites(new Set(prefs.favoriteServices));
        
        // Get personalized recommendations
        const recs = await userPreferencesService.getPersonalizedRecommendations(user.uid);
        setRecommendations(recs);
        
        // Organize categories based on user preferences
        organizeCategoriesByPreferences(prefs.preferredCategories);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      loadDefaultCategories();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultCategories = () => {
    const sections = COMPREHENSIVE_SERVICE_CATALOG.map((category, index) => ({
      id: category.id,
      title: category.name,
      icon: category.icon,
      services: category.subcategories,
      priority: index
    }));
    setCategorySections(sections);
    setIsLoading(false);
  };

  const organizeCategoriesByPreferences = (preferredCategories: string[]) => {
    const categoryMap = new Map<string, CategorySection>();
    
    // First, add preferred categories with high priority
    preferredCategories.forEach((categoryId, index) => {
      const category = COMPREHENSIVE_SERVICE_CATALOG.find(c => c.id === categoryId);
      if (category) {
        categoryMap.set(categoryId, {
          id: category.id,
          title: category.name,
          icon: category.icon,
          services: category.subcategories,
          priority: index
        });
      }
    });

    // Then add remaining categories
    COMPREHENSIVE_SERVICE_CATALOG.forEach((category, index) => {
      if (!categoryMap.has(category.id)) {
        categoryMap.set(category.id, {
          id: category.id,
          title: category.name,
          icon: category.icon,
          services: category.subcategories,
          priority: preferredCategories.length + index
        });
      }
    });

    // Sort by priority and set
    const sortedSections = Array.from(categoryMap.values())
      .sort((a, b) => a.priority - b.priority);
    
    setCategorySections(sortedSections);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowBookingForm(true);
  };

  const handleToggleFavorite = async (serviceId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }
    setFavorites(newFavorites);
  };

  const handleSearch = async () => {
    if (user && searchQuery.trim()) {
      await userPreferencesService.trackSearch(user.uid, searchQuery);
    }
  };

  // Get recommended services based on user activity
  const getRecommendedServices = (): ServiceSubcategory[] => {
    if (!recommendations.length) return [];
    
    const recommendedServices: ServiceSubcategory[] = [];
    recommendations.forEach(rec => {
      COMPREHENSIVE_SERVICE_CATALOG.forEach(category => {
        const service = category.subcategories.find(s => s.id === rec.serviceId);
        if (service) {
          recommendedServices.push(service);
        }
      });
    });
    
    return recommendedServices;
  };

  // Get trending services (mock data for now)
  const getTrendingServices = (): ServiceSubcategory[] => {
    const allServices: ServiceSubcategory[] = [];
    COMPREHENSIVE_SERVICE_CATALOG.forEach(category => {
      allServices.push(...category.subcategories);
    });
    
    // Return services with high popularity scores
    return allServices
      .filter(s => s.popularityScore && s.popularityScore > 0.7)
      .sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
      .slice(0, 10);
  };

  // Get services for "Book Again" section
  const getRepeatServices = (): ServiceSubcategory[] => {
    // In a real app, this would come from booking history
    return [];
  };

  const filteredSections = searchQuery.trim()
    ? categorySections.map(section => ({
        ...section,
        services: section.services.filter(service =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          service.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.services.length > 0)
    : categorySections;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Search */}
        <div className="relative h-96 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=600&fit=crop&q=80"
            alt="Home services hero"
            fill
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
          
          <div className="relative z-10 h-full flex flex-col justify-center px-4 lg:px-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white"
            >
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {user ? `Welcome back, ${user.displayName?.split(' ')[0] || 'there'}!` : 'Your home, perfectly serviced'}
              </h1>
              <p className="text-xl mb-8 text-white/90">
                From cleaning to repairs, we've got you covered
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 px-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={handleSearch}
                      className="flex-1 py-3 outline-none text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-6 text-sm">
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  4.8 average rating
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  15-30 min arrival
                </span>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Available in your area
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Service Sections */}
        <div className="max-w-7xl mx-auto py-8">
          {/* Quick Actions for returning users */}
          {user && !isLoading && (
            <QuickActions onServiceSelect={handleServiceSelect} />
          )}

          <div className="space-y-12">
          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
                  <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j} className="w-72 h-80 bg-gray-200 rounded-xl flex-shrink-0" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Recommended for You (if user is logged in) */}
              {user && getRecommendedServices().length > 0 && (
                <ServiceCategoryRow
                  title="Recommended for You"
                  services={getRecommendedServices()}
                  onServiceSelect={handleServiceSelect}
                  categoryIcon="✨"
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  showViewAll={false}
                />
              )}

              {/* Book Again (if user has booking history) */}
              {user && getRepeatServices().length > 0 && (
                <ServiceCategoryRow
                  title="Book Again"
                  services={getRepeatServices()}
                  onServiceSelect={handleServiceSelect}
                  categoryIcon="🔄"
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  showViewAll={false}
                />
              )}

              {/* Trending Now */}
              <ServiceCategoryRow
                title="Trending Now"
                services={getTrendingServices()}
                onServiceSelect={handleServiceSelect}
                categoryIcon="🔥"
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                viewAllLink="/services?filter=trending"
              />

              {/* Category Sections */}
              {filteredSections.map((section) => (
                <ServiceCategoryRow
                  key={section.id}
                  title={section.title}
                  services={section.services}
                  onServiceSelect={handleServiceSelect}
                  categoryIcon={section.icon}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  viewAllLink={`/services?category=${section.id}`}
                />
              ))}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedService && (
        <StreamlinedBookingForm
          serviceId={selectedService}
          onComplete={() => {
            setShowBookingForm(false);
            setSelectedService(null);
            // Track booking
            if (user) {
              const service = categorySections
                .flatMap(s => s.services)
                .find(s => s.id === selectedService);
              if (service) {
                const category = categorySections.find(c => 
                  c.services.some(s => s.id === selectedService)
                );
                if (category) {
                  userPreferencesService.trackBooking(user.uid, selectedService, category.id);
                }
              }
            }
          }}
          onCancel={() => {
            setShowBookingForm(false);
            setSelectedService(null);
          }}
        />
      )}
    </>
  );
}