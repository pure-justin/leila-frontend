'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/lib/services';
import BookingForm from '@/components/BookingForm';
import ChatBot from '@/components/ChatBot';
import { Menu, X, Clock, Calendar, MapPin, User, ChevronRight, Star, Shield, Sparkles, Zap, TrendingUp, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import GoogleMapsLoader from '@/components/GoogleMapsLoader';
import ServiceMap3D from '@/components/ServiceMap3D';
import AddressPrompt from '@/components/AddressPrompt';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, fadeInUp, stagger, scaleIn, pulseAnimation } from '@/lib/animations';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState('popular');
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);

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
    setShowBookingForm(true);
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedService(null);
  };

  const handleAddressSubmit = (address: string) => {
    setUserAddress(address);
    localStorage.setItem('userAddress', address);
    setShowAddressPrompt(false);
  };

  const popularServices = services.slice(0, 4);
  const homeServices = services.filter(s => ['plumbing', 'electrical', 'hvac', 'cleaning'].includes(s.id));
  const maintenanceServices = services.filter(s => ['handyman', 'painting', 'gardening', 'pest-control'].includes(s.id));

  return (
    <GradientBackground variant="animated" className="min-h-screen">
      <GoogleMapsLoader onLoad={() => setMapsLoaded(true)} />
      {/* Animated Header */}
      <motion.header 
        className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-purple-100 dark:border-purple-900 sticky top-0 z-50"
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent ml-2">Leila</h1>
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
              className="md:hidden border-t border-purple-100 dark:border-purple-900 bg-white/95 dark:bg-black/95 backdrop-blur-lg"
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
                    className="text-xl text-gray-600 dark:text-gray-400 mb-8"
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
                              {service.icon}
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
                    <Link href="#services" className="block mt-4">
                      <motion.button 
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Zap className="w-4 h-4 inline mr-2" />
                        View all services
                      </motion.button>
                    </Link>
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
                    <ServiceMap3D 
                      userAddress={userAddress || undefined}
                      selectedService={selectedService || undefined}
                      onContractorSelect={(contractor) => {
                        console.log('Selected contractor:', contractor);
                        // Could trigger booking flow here
                      }}
                    />
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
                      <p className="text-gray-600 dark:text-gray-400">
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
                      {service.icon}
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