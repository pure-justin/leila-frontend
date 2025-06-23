'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import AnimatedServiceCard from './AnimatedServiceCard';
import { SkeletonServiceGrid } from './LoadingSkeleton';
import { Service } from '@/lib/types/firestore-models';
import { services as serviceData } from '@/lib/services';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', name: 'All Services', icon: '🏠' },
  { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
  { id: 'electrical', name: 'Electrical', icon: '⚡' },
  { id: 'hvac', name: 'HVAC', icon: '❄️' },
  { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
  { id: 'landscaping', name: 'Landscaping', icon: '🌿' },
  { id: 'handyman', name: 'Handyman', icon: '🔨' },
  { id: 'painting', name: 'Painting', icon: '🎨' },
  { id: 'moving', name: 'Moving', icon: '📦' }
];

interface OptimizedServiceGridProps {
  onServiceSelect?: (service: Service) => void;
  initialCategory?: string;
}

export default function OptimizedServiceGrid({ 
  onServiceSelect, 
  initialCategory = 'all' 
}: OptimizedServiceGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Simulate loading for demo
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = serviceData;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.searchKeywords?.some(keyword => 
          keyword.toLowerCase().includes(searchLower)
        )
      );
    }

    // Price filter
    filtered = filtered.filter(service => {
      const servicePrice = service.basePrice || 0;
      return servicePrice >= priceRange[0] && servicePrice <= priceRange[1];
    });

    // Sort by popularity and name
    return filtered.sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [selectedCategory, debouncedSearch, priceRange]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  }, []);

  const handleServiceClick = useCallback((service: Service) => {
    onServiceSelect?.(service);
  }, [onServiceSelect]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4"
          >
            <input
              type="text"
              placeholder="Search for any service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>

          {/* Category Pills */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all flex-shrink-0",
                showFilters 
                  ? "bg-blue-600 text-white border-blue-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
            </motion.button>

            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleCategoryChange(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all flex-shrink-0",
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                )}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-200 bg-gray-50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Price Range
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-gray-700 min-w-[100px]">
                        $0 - ${priceRange[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 mb-6"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading services...
            </span>
          ) : (
            <>
              Found <span className="font-semibold">{filteredServices.length}</span> services
              {searchQuery && (
                <> for "<span className="font-semibold">{searchQuery}</span>"</>
              )}
              {selectedCategory !== 'all' && (
                <> in <span className="font-semibold">{categories.find(c => c.id === selectedCategory)?.name}</span></>
              )}
            </>
          )}
        </motion.p>
      </div>

      {/* Service Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <SkeletonServiceGrid count={6} />
        ) : filteredServices.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredServices.map((service, index) => (
              <AnimatedServiceCard
                key={service.id}
                service={service}
                index={index}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}