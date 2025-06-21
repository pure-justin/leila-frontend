'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { COMPREHENSIVE_SERVICE_CATALOG, getFeaturedCategories, getAllServices } from '@/lib/comprehensive-services-catalog';
import BookingForm from '@/components/BookingForm';
import ChatBot from '@/components/ChatBot';
import { Menu, X, Clock, Calendar, MapPin, User, ChevronRight, Star, Shield, Sparkles, Zap, TrendingUp, Wrench, Phone, Mail, MessageCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import GoogleMapsLoader from '@/components/GoogleMapsLoader';
import ServiceMap3D from '@/components/ServiceMap3D.lazy';
import AddressPrompt from '@/components/AddressPrompt';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, fadeInUp, stagger, scaleIn, pulseAnimation } from '@/lib/animations';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';
import ErrorBoundary from '@/components/ErrorBoundary';
import LiveChat from '@/components/LiveChat';
import ServiceSelector from '@/components/ServiceSelector';
import ServiceXBooking from '@/components/ServiceXBooking';
import ContractorTracker from '@/components/ContractorTracker';
import ReferralBanner from '@/components/ReferralBanner';
import ServiceBrowser from '@/components/ServiceBrowser';

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState('popular');
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [showServiceX, setShowServiceX] = useState(false);
  const [activeContractor, setActiveContractor] = useState<any>(null);
  const [customerCoords, setCustomerCoords] = useState<{lat: number, lng: number} | null>(null);
  const [showServiceBrowser, setShowServiceBrowser] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Check if user has saved address
    const savedAddress = localStorage.getItem('userAddress');
    if (!savedAddress) {
      // Show address prompt after a short delay
      setTimeout(() => setShowAddressPrompt(true), 1000);
    } else {
      setUserAddress(savedAddress);
    }
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowServiceSelector(true);
  };

  const handleStandardBooking = () => {
    setShowServiceSelector(false);
    setShowBookingForm(true);
  };

  const handleServiceXBooking = () => {
    setShowServiceSelector(false);
    setShowServiceX(true);
    // Get user coordinates (in real app, would use geolocation or address)
    if (userAddress) {
      // Mock coordinates - in real app would geocode the address
      setCustomerCoords({ lat: 37.7749, lng: -122.4194 });
    }
  };

  const handleServiceXComplete = (result: any) => {
    setShowServiceX(false);
    setActiveContractor(result.contractor);
    // Additional logic for payment processing would go here
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setShowServiceX(false);
    setSelectedService(null);
  };

  const handleAddressSubmit = (address: string) => {
    setUserAddress(address);
    localStorage.setItem('userAddress', address);
    setShowAddressPrompt(false);
  };

  const featuredCategories = getFeaturedCategories();
  const allServices = getAllServices();
  const totalServices = allServices.length;
  const popularServices = allServices.filter(s => 
    ['lawn-mowing', 'house-cleaning', 'mobile-car-wash', 'dog-walking', 'furniture-assembly', 'mobile-haircut'].includes(s.id)
  ).slice(0, 6);
  
  // Define service categories
  const homeServices = allServices.filter(s => 
    ['house-cleaning', 'electrical-repair', 'plumbing-repair', 'hvac-service', 'appliance-repair', 'furniture-assembly'].includes(s.id)
  ).slice(0, 6);
  
  const maintenanceServices = allServices.filter(s => 
    ['lawn-mowing', 'pressure-washing', 'gutter-cleaning', 'window-cleaning', 'handyman-service', 'painting-interior'].includes(s.id)
  ).slice(0, 6);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
  }, []);

  const savedReferralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') : null;

  return (
    <GradientBackground variant="animated" className="min-h-screen">
      <GoogleMapsLoader onLoad={() => setMapsLoaded(true)} />
      
      {/* Referral Banner */}
      {!showBookingForm && !showServiceX && (
        <ReferralBanner referralCode={savedReferralCode || undefined} />
      )}
      
      {/* Animated Header */}
      <motion.header 
        className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <AnimatedLogo size={48} />
            </motion.div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/services" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  Services
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/how-it-works" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  How it works
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contractor/signup" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  Become a pro
                </Link>
              </motion.div>
              <Link href="/contractor/login">
                <motion.button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Sign in
                </motion.button>
              </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 py-4 space-y-3">
                <Link href="/services" className="block text-base font-medium py-2 hover:text-purple-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Services
                </Link>
                <Link href="/how-it-works" className="block text-base font-medium py-2 hover:text-purple-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  How it works
                </Link>
                <Link href="/contractor/signup" className="block text-base font-medium py-2 hover:text-purple-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Become a pro
                </Link>
                <Link href="/contractor/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-full py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Sign in
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main>
        {!showBookingForm ? (
          <>
            {/* Hero Section - Animated */}
            <motion.section 
              className="px-4 lg:px-8 py-12 lg:py-20 max-w-7xl mx-auto"
              initial="initial"
              animate="animate"
              variants={stagger}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div variants={fadeInUp}>
                  <motion.h2 
                    className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    Home services at the tap of a button
                  </motion.h2>
                  <motion.p 
                    className="text-xl text-gray-600 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    Professional, reliable, and affordable. Book trusted pros for all your home needs.
                  </motion.p>
                  
                  {/* Quick booking card */}
                  <motion.div 
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 max-w-md border border-purple-100"
                    variants={scaleIn}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">What do you need help with?</h3>
                    <motion.div 
                      className="space-y-3"
                      variants={stagger}
                    >
                      {popularServices.map((service, index) => (
                        <motion.button
                          key={service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-all duration-300 group"
                          variants={fadeInUp}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center">
                            <motion.span 
                              className="text-2xl mr-3"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
                            >
                              {service.categoryIcon}
                            </motion.span>
                            <div className="text-left">
                              <h3 className="font-semibold mb-1 text-gray-800">{service.name}</h3>
                              <p className="text-sm text-purple-600">From {formatCurrency(Number(service.basePrice))}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
                        </motion.button>
                      ))}
                    </motion.div>
                    <motion.button 
                      onClick={() => setShowServiceBrowser(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 mt-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Zap className="w-4 h-4 inline mr-2" />
                      Browse all services
                    </motion.button>
                  </motion.div>
                </motion.div>
                
                {/* 3D Map Section */}
                <motion.div 
                  className="hidden lg:block h-[600px] relative"
                  initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                >
                  {mapsLoaded ? (
                    <ErrorBoundary>
                      <ServiceMap3D 
                        userAddress={userAddress || undefined}
                        selectedService={selectedService || undefined}
                        onContractorSelect={(contractor) => {
                          console.log('Selected contractor:', contractor);
                          // Could trigger booking flow here
                        }}
                      />
                    </ErrorBoundary>
                  ) : (
                    <div className="h-[600px] rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20"
                        animate={{
                          background: [
                            "radial-gradient(circle at 20% 80%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)",
                            "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
                            "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)",
                          ],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />
                      <div className="text-center z-10">
                        <motion.div
                          className="bg-white/90 backdrop-blur rounded-full p-8 shadow-2xl mb-4 inline-block"
                          animate={{ 
                            rotate: 360,
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity }
                          }}
                        >
                          <MapPin className="w-16 h-16 text-purple-600" />
                        </motion.div>
                        <motion.h3 
                          className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Loading Epic 3D Map...
                        </motion.h3>
                        <p className="text-gray-600">Discovering pros in your area</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.section>

            {/* How it works - Animated */}
            <motion.section 
              className="bg-white/50 backdrop-blur-sm px-4 lg:px-8 py-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="max-w-7xl mx-auto">
                <motion.h2 
                  className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  How Leila works
                </motion.h2>
                <motion.div 
                  className="grid md:grid-cols-3 gap-8"
                  variants={stagger}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {[
                    { num: 1, title: "Choose a service", desc: "Select from our wide range of home services", icon: "🏠" },
                    { num: 2, title: "Book a pro", desc: "Pick a time that works for you", icon: "📅" },
                    { num: 3, title: "Get it done", desc: "Your pro arrives and completes the job", icon: "✅" }
                  ].map((step, index) => (
                    <motion.div 
                      key={step.num}
                      className="text-center md:text-left"
                      variants={fadeInUp}
                      whileHover={{ y: -10 }}
                    >
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0 shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        {step.num}
                      </motion.div>
                      <motion.span 
                        className="text-3xl mb-3 block"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, delay: index * 0.3, repeat: Infinity }}
                      >
                        {step.icon}
                      </motion.span>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600">
                        {step.desc}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* Services Section - Animated */}
            <motion.section 
              id="services" 
              className="px-4 lg:px-8 py-16 max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                All services
              </motion.h2>
              
              {/* Service categories - Animated Pills */}
              <motion.div 
                className="flex space-x-4 mb-8 overflow-x-auto pb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {['popular', 'home', 'maintenance'].map((category, index) => (
                  <motion.button
                    key={category}
                    onClick={() => setActiveServiceCategory(category)}
                    className={`px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 font-medium ${
                      activeServiceCategory === category 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-white/80 backdrop-blur border border-purple-200 hover:border-purple-400 hover:shadow-md'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category === 'popular' && <Sparkles className="w-4 h-4 inline mr-1" />}
                    {category === 'home' && <Wrench className="w-4 h-4 inline mr-1" />}
                    {category === 'maintenance' && <Shield className="w-4 h-4 inline mr-1" />}
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                    {category === 'home' && ' Repairs'}
                  </motion.button>
                ))}
              </motion.div>
              
              {/* Service grid - Epic Card Animations */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                variants={stagger}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {(activeServiceCategory === 'popular' ? popularServices : 
                  activeServiceCategory === 'home' ? homeServices : maintenanceServices).map((service, index) => (
                  <motion.button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="relative group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 text-left border border-purple-100 hover:border-purple-300 overflow-hidden"
                    variants={fadeInUp}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -10,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Animated gradient background on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-indigo-600/0 group-hover:from-purple-600/10 group-hover:to-indigo-600/10 transition-all duration-500"
                      initial={false}
                    />
                    
                    {/* Sparkle effect */}
                    <motion.div
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      initial={{ scale: 0, rotate: -180 }}
                      whileHover={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </motion.div>
                    
                    {/* Icon with bounce animation */}
                    <motion.div 
                      className="text-4xl mb-4 relative z-10"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay: index * 0.1,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      {service.categoryIcon}
                    </motion.div>
                    
                    {/* Content */}
                    <h3 className="font-bold mb-2 text-gray-800 group-hover:text-purple-700 transition-colors relative z-10">
                      {service.name}
                    </h3>
                    <p className="text-sm text-purple-600 font-medium relative z-10">
                      From {formatCurrency(Number(service.basePrice))}
                    </p>
                    
                    {/* Bottom accent line */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                ))}
              </motion.div>
              
              {/* View All Services Button */}
              <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Link href="/services">
                  <motion.button
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View All {totalServices} Services
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </motion.button>
                </Link>
                <p className="text-sm text-gray-600 mt-3">
                  From professional contractors to summer jobs for teens
                </p>
              </motion.div>
            </motion.section>

            {/* Trust Section - Epic Stats with Animations */}
            <motion.section 
              className="relative bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white px-4 lg:px-8 py-20 overflow-hidden"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              {/* Animated background patterns */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  backgroundImage: [
                    "radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)",
                    "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)",
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              
              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div 
                  className="grid md:grid-cols-3 gap-8 text-center"
                  variants={stagger}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                >
                  {[
                    { value: "10,000+", label: "Verified pros", icon: Shield },
                    { value: "4.8", label: "Average rating", suffix: " ★", icon: Star },
                    { value: "24/7", label: "Customer support", icon: Clock }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      className="relative group"
                    >
                      {/* Glow effect on hover */}
                      <motion.div
                        className="absolute inset-0 bg-white/10 rounded-2xl blur-xl group-hover:bg-white/20 transition-all duration-500"
                        initial={false}
                      />
                      
                      <div className="relative">
                        <motion.div
                          className="inline-block mb-4"
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 3,
                            delay: index * 0.3,
                            repeat: Infinity
                          }}
                        >
                          <stat.icon className="w-12 h-12 mx-auto text-purple-300" />
                        </motion.div>
                        
                        <motion.div 
                          className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ 
                            type: "spring",
                            stiffness: 200,
                            delay: 0.5 + index * 0.1
                          }}
                        >
                          {stat.value}{stat.suffix || ''}
                        </motion.div>
                        <p className="text-purple-200 font-medium">{stat.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* CTA Section - Epic Final Call to Action */}
            <motion.section 
              className="px-4 lg:px-8 py-20 max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-12 lg:p-16 rounded-3xl text-center overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {/* Animated background orbs */}
                <motion.div
                  className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [0, -90, 0],
                  }}
                  transition={{ duration: 15, repeat: Infinity }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 150 }}
                    className="inline-block mb-6"
                  >
                    <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>
                  
                  <motion.h2 
                    className="text-4xl lg:text-5xl font-bold mb-6 text-white"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    Ready to become a pro?
                  </motion.h2>
                  <motion.p 
                    className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    Join thousands of professionals earning more with Leila
                  </motion.p>
                  
                  <Link href="/contractor/signup">
                    <motion.button 
                      className="bg-white text-purple-700 text-lg px-10 py-5 rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="flex items-center">
                        Get started now
                        <motion.span
                          className="ml-2"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ChevronRight className="w-5 h-5 inline" />
                        </motion.span>
                      </span>
                    </motion.button>
                  </Link>
                  
                  {/* Stats below CTA */}
                  <motion.div 
                    className="mt-10 flex justify-center space-x-8 text-purple-100"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      <span>Earn up to $5k/week</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      <span>Instant payouts</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.section>

            {/* Contact Section */}
            <motion.section 
              className="px-4 lg:px-8 py-16 max-w-7xl mx-auto border-t border-purple-100"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Get in Touch
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center md:justify-start">
                      <Phone className="w-5 h-5 mr-3 text-purple-600" />
                      <a href="tel:1-800-HEYLEILA" className="text-gray-700 hover:text-purple-600 transition-colors">
                        1-800-HEYLEILA
                      </a>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <Mail className="w-5 h-5 mr-3 text-purple-600" />
                      <a href="mailto:support@heyleila.com" className="text-gray-700 hover:text-purple-600 transition-colors">
                        support@heyleila.com
                      </a>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <MessageCircle className="w-5 h-5 mr-3 text-purple-600" />
                      <span className="text-gray-700">24/7 Live Chat Support</span>
                    </div>
                  </div>
                </motion.div>

                {/* Business Hours */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Business Hours
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>Monday - Friday: 24/7</p>
                    <p>Saturday - Sunday: 24/7</p>
                    <p className="text-sm text-purple-600 font-medium mt-3">
                      Emergency services available anytime
                    </p>
                  </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Why Choose HeyLeila
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center md:justify-start">
                      <Shield className="w-5 h-5 mr-3 text-green-600" />
                      <span className="text-gray-700">Licensed & Insured Professionals</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <Star className="w-5 h-5 mr-3 text-yellow-500" />
                      <span className="text-gray-700">100% Satisfaction Guarantee</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <DollarSign className="w-5 h-5 mr-3 text-purple-600" />
                      <span className="text-gray-700">Transparent Pricing</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer Bottom */}
              <motion.div 
                className="mt-12 pt-8 border-t border-purple-100 text-center text-sm text-gray-600"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <p>&copy; 2024 HeyLeila. All rights reserved. | 
                  <a href="/terms" className="ml-1 hover:text-purple-600 transition-colors">Terms</a> | 
                  <a href="/privacy" className="ml-1 hover:text-purple-600 transition-colors">Privacy</a>
                </p>
              </motion.div>
            </motion.section>
          </>
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <BookingForm
              serviceId={selectedService!}
              onComplete={handleBookingComplete}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        )}
      </main>

      <ChatBot />
      <LiveChat />
      
      {/* Service Selector Modal */}
      {showServiceSelector && selectedService && (
        <ServiceSelector
          serviceId={selectedService}
          onSelectStandard={handleStandardBooking}
          onSelectServiceX={handleServiceXBooking}
          onCancel={() => {
            setShowServiceSelector(false);
            setSelectedService(null);
          }}
        />
      )}

      {/* Service X Booking */}
      {showServiceX && selectedService && customerCoords && (
        <ServiceXBooking
          serviceId={selectedService}
          serviceName={services.find(s => s.id === selectedService)?.name || ''}
          customerLocation={customerCoords}
          basePrice={services.find(s => s.id === selectedService)?.basePrice || 0}
          onComplete={handleServiceXComplete}
          onCancel={() => {
            setShowServiceX(false);
            setSelectedService(null);
          }}
        />
      )}

      {/* Contractor Tracker */}
      {activeContractor && (
        <ContractorTracker
          contractor={activeContractor}
          customerLocation={customerCoords || { lat: 37.7749, lng: -122.4194 }}
          eta={activeContractor.eta || 30}
          onCall={() => window.open(`tel:${activeContractor.phone || '1-800-HEYLEILA'}`)}
          onMessageSent={(msg) => console.log('Message sent:', msg)}
        />
      )}
      
      {/* Service Browser Modal */}
      {showServiceBrowser && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white shadow-sm p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Browse Services</h2>
            <button
              onClick={() => setShowServiceBrowser(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <ServiceBrowser
            userLocation={userAddress || 'Your area'}
            onServiceSelect={(serviceId) => {
              setSelectedService(serviceId);
              setShowServiceBrowser(false);
              setShowServiceSelector(true);
            }}
            previouslyUsed={[]}
            recentlyViewed={[]}
            favorites={[]}
          />
        </div>
      )}
      
      {/* Address Prompt Modal */}
      {showAddressPrompt && (
        <AddressPrompt
          onAddressSubmit={handleAddressSubmit}
          onClose={() => setShowAddressPrompt(false)}
        />
      )}
    </GradientBackground>
  );
}