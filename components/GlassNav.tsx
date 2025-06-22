'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, Briefcase, Search, Menu, X, ChevronDown,
  MapPin, Calendar, MessageCircle, Settings, 
  TrendingUp, Shield, Award, Sparkles, User
} from 'lucide-react';
import AnimatedLogo from './AnimatedLogo';
import { useAuth } from '@/contexts/AuthContext';
import AuthPromptModal from './AuthPromptModal';
import PropertyProfileManager from './PropertyProfileManager';

export default function GlassNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [viewMode, setViewMode] = useState<'customer' | 'contractor'>('customer');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectTo, setAuthRedirectTo] = useState<'customer' | 'contractor'>('customer');
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<string>();
  
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine current mode based on path
  useEffect(() => {
    if (pathname.startsWith('/contractor')) {
      setViewMode('contractor');
    } else {
      setViewMode('customer');
    }
  }, [pathname]);

  const handleViewToggle = (mode: 'customer' | 'contractor') => {
    // Check if user is authenticated
    if (!user) {
      setAuthRedirectTo(mode);
      setShowAuthModal(true);
      setShowDropdown(false);
      return;
    }

    setViewMode(mode);
    setShowDropdown(false);
    if (mode === 'contractor') {
      router.push('/contractor/dashboard');
    } else {
      router.push('/');
    }
  };

  const customerLinks = [
    { href: '/book', label: 'Book Service', icon: Search },
    { href: '/bookings', label: 'Bookings', icon: Calendar },
    { href: '/how-it-works', label: 'How it works', icon: Sparkles },
  ];

  const contractorLinks = [
    { href: '/contractor/dashboard', label: 'Dashboard', icon: TrendingUp },
    { href: '/contractor/schedule', label: 'Schedule', icon: Calendar },
    { href: '/contractor/earnings', label: 'Earnings', icon: Award },
  ];

  const currentLinks = viewMode === 'customer' ? customerLinks : contractorLinks;

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg' 
            : 'bg-white/50 backdrop-blur-md'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <AnimatedLogo size={40} />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {currentLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    pathname === link.href
                      ? 'bg-purple-100/50 text-purple-700'
                      : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50/30'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Property Selector for Customer View */}
              {user && viewMode === 'customer' && (
                <PropertyProfileManager
                  onSelectProfile={(profile) => {
                    setCurrentPropertyId(profile.id);
                    // Save to context/localStorage
                    localStorage.setItem('currentPropertyId', profile.id);
                  }}
                  currentProfileId={currentPropertyId}
                  isCompact={true}
                />
              )}

              {/* View Mode Toggle */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl rounded-xl border border-white/40 shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    {viewMode === 'customer' ? (
                      <>
                        <Home className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Customer</span>
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">Contractor</span>
                      </>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                    showDropdown ? 'rotate-180' : ''
                  }`} />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl border border-white/40 shadow-xl overflow-hidden"
                    >
                      <button
                        onClick={() => handleViewToggle('customer')}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50/50 transition-colors ${
                          viewMode === 'customer' ? 'bg-purple-50/30' : ''
                        }`}
                      >
                        <Home className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Customer</p>
                          <p className="text-xs text-gray-500">Book services</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleViewToggle('contractor')}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50/50 transition-colors border-t border-gray-100 ${
                          viewMode === 'contractor' ? 'bg-indigo-50/30' : ''
                        }`}
                      >
                        <Briefcase className="w-5 h-5 text-indigo-600" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">Contractor</p>
                          <p className="text-xs text-gray-500">Find work</p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>

      </motion.header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16" />
      
      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        redirectTo={authRedirectTo}
        message={authRedirectTo === 'contractor' 
          ? 'Sign in to access your contractor dashboard and start earning'
          : 'Sign in to book services and manage your properties'
        }
      />
    </>
  );
}