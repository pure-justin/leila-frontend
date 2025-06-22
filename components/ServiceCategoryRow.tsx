'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, Clock, Star, TrendingUp } from 'lucide-react';
import { ServiceSubcategory } from '@/lib/comprehensive-services-catalog';
import { getServiceImageByIndex, IMAGE_BLUR_DATA_URL } from '@/lib/service-images-expanded';
import { formatCurrency } from '@/lib/utils/currency';
import { useAuth } from '@/contexts/AuthContext';
import { userPreferencesService } from '@/lib/user-preferences-service';

interface ServiceCategoryRowProps {
  title: string;
  services: ServiceSubcategory[];
  onServiceSelect: (serviceId: string) => void;
  categoryIcon?: string;
  favorites?: Set<string>;
  onToggleFavorite?: (serviceId: string) => void;
  showViewAll?: boolean;
  viewAllLink?: string;
}

export default function ServiceCategoryRow({
  title,
  services,
  onServiceSelect,
  categoryIcon,
  favorites = new Set(),
  onToggleFavorite,
  showViewAll = true,
  viewAllLink
}: ServiceCategoryRowProps) {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    const scrollElement = scrollRef.current;
    scrollElement?.addEventListener('scroll', checkScroll);
    checkScroll();

    return () => scrollElement?.removeEventListener('scroll', checkScroll);
  }, [services]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleServiceClick = async (serviceId: string) => {
    if (user) {
      await userPreferencesService.trackServiceView(user.uid, serviceId);
    }
    onServiceSelect(serviceId);
  };

  const handleFavoriteClick = async (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (user) {
      await userPreferencesService.toggleFavorite(user.uid, serviceId);
    }
    onToggleFavorite?.(serviceId);
  };

  const getPriceDisplay = (service: ServiceSubcategory) => {
    if (service.priceUnit === 'quote') return 'Get Quote';
    
    const price = formatCurrency(service.basePrice);
    switch (service.priceUnit) {
      case 'hourly': return `${price}/hr`;
      case 'sqft': return `${price}/sqft`;
      case 'perUnit': return `${price}/unit`;
      default: return price;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-blue-100 text-blue-700';
      case 'professional': return 'bg-purple-100 text-purple-700';
      case 'expert': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 lg:px-0">
        <div className="flex items-center gap-3">
          {categoryIcon && <span className="text-2xl">{categoryIcon}</span>}
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500">({services.length})</span>
        </div>
        {showViewAll && viewAllLink && (
          <a 
            href={viewAllLink}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Scrollable Container */}
      <div className="relative">
        {/* Left Arrow */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all hidden lg:block"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Arrow */}
        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-all hidden lg:block"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Service Cards */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 lg:px-0 pb-4"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {services.map((service, index) => {
            const serviceImage = getServiceImageByIndex(service.id, index);
            const isLoading = imageLoading.has(service.id);

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex-shrink-0 w-72 cursor-pointer"
                style={{ scrollSnapAlign: 'start' }}
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group/card">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    {isLoading && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <Image
                      src={serviceImage.url}
                      alt={serviceImage.alt}
                      fill
                      className="object-cover group-hover/card:scale-110 transition-transform duration-500"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                      onLoadingComplete={() => {
                        setImageLoading(prev => {
                          const next = new Set(prev);
                          next.delete(service.id);
                          return next;
                        });
                      }}
                      onLoad={() => {
                        setImageLoading(prev => new Set(prev).add(service.id));
                      }}
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                    
                    {/* Favorite button */}
                    <button
                      onClick={(e) => handleFavoriteClick(e, service.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-all ${
                          favorites.has(service.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-gray-600 hover:text-red-500'
                        }`}
                      />
                    </button>

                    {/* Price badge */}
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md">
                        <p className="text-sm font-bold text-gray-900">{getPriceDisplay(service)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover/card:text-purple-600 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 h-10">
                      {service.description}
                    </p>

                    {/* Service details */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {service.duration}
                        </span>
                        {service.skillLevel && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(service.skillLevel)}`}>
                            {service.skillLevel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        4.8
                      </span>
                      <span>•</span>
                      <span>15-30 min arrival</span>
                      {service.popularityScore && service.popularityScore > 0.7 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-orange-600">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Popular
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}