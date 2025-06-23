'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getServiceById, COMPREHENSIVE_SERVICE_CATALOG } from '@/lib/comprehensive-services-catalog';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Star, Shield, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import GlassNav from '@/components/GlassNav';
import StreamlinedBookingForm from '@/components/StreamlinedBookingForm';
import AuthPromptModal from '@/components/AuthPromptModal';
import { getServiceImage } from '@/lib/service-images-local';
import { formatCurrency } from '@/lib/utils/currency';

interface BookingPageContentProps {
  // Add any props if needed in the future
}

function BookingPageContent({}: BookingPageContentProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price' | 'rating'>('popular');

  // Get service from URL params
  useEffect(() => {
    const serviceId = searchParams.get('service');
    const searchQuery = searchParams.get('search');
    const categoryFilter = searchParams.get('category');
    const filterType = searchParams.get('filter');
    
    if (serviceId) {
      const service = getServiceById(serviceId);
      if (service) {
        setSelectedService(service);
        setShowBookingForm(true);
      }
    }
    
    if (searchQuery) {
      setSearchQuery(searchQuery);
    }
    
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
    
    if (filterType === 'trending') {
      setSortBy('popular');
    }
  }, [searchParams]);

  // Filter services based on search and category
  const filteredServices = COMPREHENSIVE_SERVICE_CATALOG.flatMap(category => 
    category.subcategories.map(service => ({
      ...service,
      category: category.id,
      categoryName: category.name
    }))
  ).filter((service) => {
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.basePrice - b.basePrice;
      case 'rating':
        return (b.rating || 4.5) - (a.rating || 4.5);
      case 'popular':
      default:
        return (b.popularityScore || 0.5) - (a.popularityScore || 0.5);
    }
  });

  const handleServiceSelect = (service: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedService(service);
    setShowBookingForm(true);
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedService(null);
    // Add any success handling here
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
    setSelectedService(null);
  };

  const categories = COMPREHENSIVE_SERVICE_CATALOG.map(cat => cat.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <GlassNav />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book Your{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Perfect Service
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from hundreds of services. Get matched with verified pros. Book in seconds.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid md:grid-cols-12 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'popular' | 'price' | 'rating')}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Search Action */}
              <div className="md:col-span-2">
                <button 
                  onClick={() => {
                    // Optional: Add a search action here
                  }}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Quick Service Categories */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['House Cleaning', 'Plumbing', 'Electrical', 'HVAC', 'Handyman'].map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {sortedServices.map((service, index) => {
                const serviceImage = getServiceImage(service.id);
                
                return (
                  <motion.div
                    key={service.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => handleServiceSelect(service)}
                  >
                    {/* Service Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={serviceImage.url}
                        alt={serviceImage.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {service.popularityScore && service.popularityScore > 0.7 && (
                          <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Popular
                          </span>
                        )}
                        {service.includesSupplies && (
                          <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                            Supplies Included
                          </span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5">
                          <p className="text-lg font-bold text-gray-900">
                            {service.priceUnit === 'quote' ? 'Get Quote' : formatCurrency(service.basePrice)}
                          </p>
                          {service.priceUnit !== 'quote' && service.priceUnit !== 'fixed' && (
                            <p className="text-xs text-gray-600">/{service.priceUnit}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          {service.rating || 4.8}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-green-500" />
                          Insured
                        </span>
                      </div>

                      {/* Book Button */}
                      <motion.button
                        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceSelect(service);
                        }}
                      >
                        Book Now
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {sortedServices.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingForm && selectedService && (
          <StreamlinedBookingForm
            serviceId={selectedService}
            onComplete={handleBookingComplete}
            onCancel={handleBookingCancel}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AuthPromptModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            redirectTo="customer"
          />
        )}
      </AnimatePresence>

      {/* Mobile Tab Bar */}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}