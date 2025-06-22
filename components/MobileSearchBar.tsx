'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileSearchBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Show search bar on mobile
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Track scroll for glass effect
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isVisible) return null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/book?search=${encodeURIComponent(searchQuery)}`);
      setIsExpanded(false);
    }
  };

  const glassStyle = scrollY > 50 ? 'bg-white/70 backdrop-blur-lg shadow-lg' : 'bg-white/90 backdrop-blur-md';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-[60px] left-0 right-0 z-[45] transition-all duration-300 ${glassStyle}`}
    >
      <div className="px-4 py-3">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className="w-full"
            >
              <div className="flex items-center gap-3 bg-gray-100/80 backdrop-blur-sm rounded-full px-4 py-3 text-gray-600">
                <Search className="w-5 h-5" />
                <span className="flex-1 text-left text-sm">What service do you need?</span>
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for any service..."
                  className="w-full pl-12 pr-12 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Quick suggestions */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {['House Cleaning', 'Plumber', 'Electrician', 'HVAC', 'Handyman'].map((service) => (
                  <motion.button
                    key={service}
                    onClick={() => {
                      setSearchQuery(service);
                      handleSearch();
                    }}
                    className="flex-shrink-0 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    {service}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Glass effect border */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </motion.div>
  );
}