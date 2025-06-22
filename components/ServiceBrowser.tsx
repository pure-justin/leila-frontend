'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Clock, Star, TrendingUp, ChevronRight, 
  MapPin, Filter, Sparkles, Heart, Info, X
} from 'lucide-react';
import Image from 'next/image';
import { COMPREHENSIVE_SERVICE_CATALOG, ServiceCategory, ServiceSubcategory } from '@/lib/comprehensive-services-catalog';
import { formatCurrency } from '@/lib/utils/currency';
import { getCategoryHeroImage, getServiceImage } from '@/lib/service-images-local';

interface ServiceBrowserProps {
  userLocation?: string;
  onServiceSelect: (serviceId: string) => void;
  previouslyUsed?: string[];
  recentlyViewed?: string[];
  favorites?: string[];
}

// Engaging descriptions for categories
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'electrical': '⚡ Shock-ingly good electricians ready to power up your home',
  'plumbing': '💧 From leaky faucets to major repairs - we\'ve got the flow',
  'cleaning': '✨ Sparkle and shine guaranteed - let us handle the mess',
  'personal-care': '💅 Pamper yourself without leaving home - luxury comes to you',
  'pet-care': '🐾 Tail-wagging good services for your furry family',
  'automotive': '🚗 Your car deserves spa treatment too - we come to you',
  'landscaping': '🌺 Transform your outdoor space into a personal paradise',
  'hvac': '❄️ Keep your cool (or heat) with our climate experts',
  'handyman': '🔧 No job too small - your personal fix-it hero awaits',
  'tech-support': '💻 Tech troubles? Our geeks speak human',
  'moving': '📦 Heavy lifting? We\'ve got the muscle and the hustle',
  'security': '🔐 Peace of mind delivered - secure your sanctuary',
  'pest-control': '🦟 Evict unwanted roommates - permanently',
  'contractor-services': '🏗️ Pro services for pros - level up your business'
};

export default function ServiceBrowser({
  userLocation = 'Your area',
  onServiceSelect,
  previouslyUsed = [],
  recentlyViewed = [],
  favorites = []
}: ServiceBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'residential' | 'commercial'>('residential');
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteServices, setFavoriteServices] = useState<Set<string>>(new Set(favorites));
  const [selectedService, setSelectedService] = useState<ServiceSubcategory | null>(null);

  // Track recently viewed
  useEffect(() => {
    if (selectedService) {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const updated = [selectedService.id, ...viewed.filter((id: string) => id !== selectedService.id)].slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    }
  }, [selectedService]);

  const toggleFavorite = (serviceId: string) => {
    setFavoriteServices(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId);
      } else {
        newFavorites.add(serviceId);
      }
      localStorage.setItem('favoriteServices', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  const filteredCategories = COMPREHENSIVE_SERVICE_CATALOG.filter(cat => 
    cat.availableFor.includes(viewType) || cat.availableFor.includes('both')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Location Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="font-semibold">Delivering to</span>
              <button className="text-purple-600 hover:text-purple-700 font-semibold">
                {userLocation}
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Service Type Toggle */}
          <div className="flex space-x-4">
            <button
              onClick={() => setViewType('residential')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                viewType === 'residential' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              For Home
            </button>
            <button
              onClick={() => setViewType('commercial')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                viewType === 'commercial' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              For Business
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Previously Used Section */}
        {previouslyUsed.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-purple-600" />
              Order Again
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {previouslyUsed.slice(0, 6).map((serviceId, idx) => {
                const service = COMPREHENSIVE_SERVICE_CATALOG.flatMap(c => c.subcategories).find(s => s.id === serviceId);
                if (!service) return null;
                
                return (
                  <motion.div
                    key={serviceId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex-shrink-0 w-48"
                  >
                    <button
                      onClick={() => onServiceSelect(serviceId)}
                      className="w-full bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all p-4 text-left"
                    >
                      <div className="text-3xl mb-2">⚡</div>
                      <h3 className="font-semibold text-sm line-clamp-2">{service.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Last: 2 days ago</p>
                      <p className="text-sm font-bold text-purple-600 mt-2">
                        {formatCurrency(service.basePrice)}
                      </p>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
            All Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category, idx) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedCategory(category.id)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <Image
                    src={getCategoryHeroImage(category.id).url}
                    alt={getCategoryHeroImage(category.id).alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(category.id);
                    }}
                    className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favoriteServices.has(category.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </button>
                  {/* Category Icon */}
                  <div className="absolute bottom-2 left-2 z-20 text-3xl">
                    {category.icon}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {CATEGORY_DESCRIPTIONS[category.id]}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {category.subcategories.length} services
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Popular Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
            Trending Now
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPREHENSIVE_SERVICE_CATALOG.slice(0, 3).flatMap(cat => 
              cat.subcategories.slice(0, 1).map((service, idx) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <ServiceCard
                    service={service}
                    categoryIcon={cat.icon}
                    isFavorite={favoriteServices.has(service.id)}
                    onToggleFavorite={() => toggleFavorite(service.id)}
                    onSelect={() => {
                      setSelectedService(service);
                      onServiceSelect(service.id);
                    }}
                  />
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <CategoryModal
            category={COMPREHENSIVE_SERVICE_CATALOG.find(c => c.id === selectedCategory)!}
            favorites={favoriteServices}
            onToggleFavorite={toggleFavorite}
            onSelectService={(serviceId) => {
              const service = COMPREHENSIVE_SERVICE_CATALOG
                .find(c => c.id === selectedCategory)
                ?.subcategories.find(s => s.id === serviceId);
              if (service) {
                setSelectedService(service);
                onServiceSelect(serviceId);
              }
            }}
            onClose={() => setSelectedCategory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Service Card Component
function ServiceCard({
  service,
  categoryIcon,
  isFavorite,
  onToggleFavorite,
  onSelect
}: {
  service: ServiceSubcategory;
  categoryIcon: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
}) {
  return (
    <motion.button
      onClick={onSelect}
      className="w-full bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden text-left group"
      whileHover={{ y: -4 }}
    >
      <div className="flex">
        {/* Image Section */}
        <div className="w-1/3 relative bg-gradient-to-br from-purple-100 to-indigo-100">
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            {categoryIcon}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{service.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="ml-2"
            >
              <Heart 
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`} 
              />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {service.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500">Starting at</span>
              <p className="font-bold text-purple-600">
                {formatCurrency(service.basePrice)}
                {service.priceUnit !== 'fixed' && `/${service.priceUnit}`}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                <span className="font-medium">4.8</span>
                <span className="text-gray-500 ml-1">(312)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{service.duration}</p>
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-3">
            {service.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// Category Modal Component
function CategoryModal({
  category,
  favorites,
  onToggleFavorite,
  onSelectService,
  onClose
}: {
  category: ServiceCategory;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelectService: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <span className="text-3xl mr-3">{category.icon}</span>
              {category.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {CATEGORY_DESCRIPTIONS[category.id]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Services List */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {category.subcategories.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryIcon={category.icon}
              isFavorite={favorites.has(service.id)}
              onToggleFavorite={() => onToggleFavorite(service.id)}
              onSelect={() => {
                onSelectService(service.id);
                onClose();
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}