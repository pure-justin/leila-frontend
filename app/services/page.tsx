'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Star, Clock, Shield, TrendingUp,
  ChevronRight, Heart, Info, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import {
  COMPREHENSIVE_SERVICE_CATALOG,
  ServiceCategory,
  ServiceSubcategory,
  getEntryLevelServices,
  getProfessionalServices
} from '@/lib/comprehensive-services-catalog';
import { formatCurrency } from '@/lib/utils/currency';
import BookingForm from '@/components/BookingForm';
import ServiceSelector from '@/components/ServiceSelector';

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'entry' | 'professional'>('all');
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const filteredCategories = COMPREHENSIVE_SERVICE_CATALOG.filter(category => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        category.name.toLowerCase().includes(query) ||
        category.description.toLowerCase().includes(query) ||
        category.subcategories.some(sub =>
          sub.name.toLowerCase().includes(query) ||
          sub.description.toLowerCase().includes(query)
        )
      );
    }
    return true;
  });

  const getFilteredServices = (category: ServiceCategory): ServiceSubcategory[] => {
    let services = category.subcategories;

    if (filterLevel === 'entry') {
      services = services.filter(s => s.skillLevel === 'entry');
    } else if (filterLevel === 'professional') {
      services = services.filter(s => s.skillLevel === 'professional' || s.skillLevel === 'expert');
    }

    if (priceRange === 'budget') {
      services = services.filter(s => s.priceUnit === 'quote' || s.basePrice <= 50);
    } else if (priceRange === 'mid') {
      services = services.filter(s => s.priceUnit === 'quote' || (s.basePrice > 50 && s.basePrice <= 150));
    } else if (priceRange === 'premium') {
      services = services.filter(s => s.priceUnit === 'quote' || s.basePrice > 150);
    }

    if (searchQuery && selectedCategory === category.id) {
      const query = searchQuery.toLowerCase();
      services = services.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    return services;
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowServiceSelector(true);
  };

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.has(serviceId) ? newFavorites.delete(serviceId) : newFavorites.add(serviceId);
      return newFavorites;
    });
  };

  const totalServices = COMPREHENSIVE_SERVICE_CATALOG.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  const entryLevelCount = getEntryLevelServices().length;
  const professionalCount = getProfessionalServices().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                All Services
              </h1>
              <p className="text-gray-600 mt-2">
                {totalServices} services available • From teens to professionals
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services (e.g., 'lawn mowing', 'haircut', 'plumbing')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Skill Level</label>
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value as any)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="entry">Entry Level ({entryLevelCount})</option>
                      <option value="professional">Professional ({professionalCount})</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Price Range</label>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value as any)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Prices</option>
                      <option value="budget">Budget (Under $50)</option>
                      <option value="mid">Mid ($50-$150)</option>
                      <option value="premium">Premium ($150+)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl shadow-sm p-6 text-center"
          >
            <div className="text-3xl mb-2">{COMPREHENSIVE_SERVICE_CATALOG[0].icon}</div>
            <h3 className="font-bold text-lg">Professional Services</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{professionalCount}</p>
            <p className="text-sm text-gray-600">Licensed & Expert</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl shadow-sm p-6 text-center"
          >
            <div className="text-3xl mb-2">🎒</div>
            <h3 className="font-bold text-lg">Entry Level Jobs</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{entryLevelCount}</p>
            <p className="text-sm text-gray-600">Perfect for teens</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl shadow-sm p-6 text-center"
          >
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-bold text-lg">Categories</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{COMPREHENSIVE_SERVICE_CATALOG.length}</p>
            <p className="text-sm text-gray-600">Service types</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl shadow-sm p-6 text-center"
          >
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="font-bold text-lg">Total Services</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{totalServices}</p>
            <p className="text-sm text-gray-600">And growing!</p>
          </motion.div>
        </div>

        {/* Service Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => {
            const filteredServices = getFilteredServices(category);
            if (filteredServices.length === 0 && (filterLevel !== 'all' || priceRange !== 'all')) {
              return null;
            }

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{category.icon}</span>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <p className="text-xs text-purple-600 mt-1">
                        {filteredServices.length} services available
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-6 h-6 text-gray-400 transform transition-transform ${
                      selectedCategory === category.id ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {selectedCategory === category.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pt-2">
                        {filteredServices.map((service, serviceIndex) => (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: serviceIndex * 0.05 }}
                            className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => handleServiceSelect(service.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {service.name}
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(service.id);
                                }}
                                className="p-1 rounded-full hover:bg-white transition-colors"
                              >
                                <Heart 
                                  className={`w-4 h-4 ${
                                    favorites.has(service.id) 
                                      ? 'fill-red-500 text-red-500' 
                                      : 'text-gray-400'
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                            
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center text-gray-500">
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  Price:
                                </span>
                                <span className="font-medium text-gray-900">
                                  {service.priceUnit === 'quote' 
                                    ? 'Get Quote'
                                    : service.priceUnit === 'hourly'
                                    ? `${formatCurrency(service.basePrice)}/hr`
                                    : service.priceUnit === 'sqft'
                                    ? `${formatCurrency(service.basePrice)}/sqft`
                                    : service.priceUnit === 'perUnit'
                                    ? `${formatCurrency(service.basePrice)}/unit`
                                    : formatCurrency(service.basePrice)
                                  }
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Duration:
                                </span>
                                <span className="font-medium text-gray-900">{service.duration}</span>
                              </div>
                              {service.requiresLicense && (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center text-gray-500">
                                    <Shield className="w-3 h-3 mr-1" />
                                    License:
                                  </span>
                                  <span className="font-medium text-green-600">{service.licenseType}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="flex items-center text-gray-500">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Level:
                                </span>
                                <span className={`font-medium ${
                                  service.skillLevel === 'entry' ? 'text-green-600' :
                                  service.skillLevel === 'intermediate' ? 'text-blue-600' :
                                  service.skillLevel === 'professional' ? 'text-purple-600' :
                                  'text-red-600'
                                }`}>
                                  {service.skillLevel.charAt(0).toUpperCase() + service.skillLevel.slice(1)}
                                </span>
                              </div>
                              {service.ageRequirement && (
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center text-gray-500">
                                    <Info className="w-3 h-3 mr-1" />
                                    Min Age:
                                  </span>
                                  <span className="font-medium text-gray-900">{service.ageRequirement}+</span>
                                </div>
                              )}
                            </div>

                            <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all group-hover:shadow-md">
                              Book Now
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Service Selector Modal */}
      {showServiceSelector && selectedService && (
        <ServiceSelector
          serviceId={selectedService}
          onCancel={() => {
            setShowServiceSelector(false);
            setSelectedService(null);
          }}
          onSelectStandard={() => {
            setShowServiceSelector(false);
            setShowBookingForm(true);
          }}
          onSelectServiceX={() => {
            // Handle ServiceX booking
            setShowServiceSelector(false);
          }}
        />
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <BookingForm
              serviceId={selectedService}
              onComplete={() => {
                setShowBookingForm(false);
                setSelectedService(null);
              }}
              onCancel={() => {
                setShowBookingForm(false);
                setSelectedService(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}