'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/lib/services';
import BookingForm from '@/components/BookingForm';
import ChatBot from '@/components/ChatBot';
import { Menu, X, Clock, Calendar, MapPin, User, ChevronRight, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import GoogleMapsLoader from '@/components/GoogleMapsLoader';
import Home3DMap from '@/components/Home3DMap';
import AddressPrompt from '@/components/AddressPrompt';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

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
    <div className="min-h-screen bg-white dark:bg-black">
      <GoogleMapsLoader onLoad={() => setMapsLoaded(true)} />
      {/* Uber-style Header */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Leila</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/services" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Services
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium hover:text-gray-600 transition-colors">
                How it works
              </Link>
              <Link href="/contractor/signup" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Become a pro
              </Link>
              <Link href="/contractor/login">
                <button className="uber-button text-sm px-4 py-2">
                  Sign in
                </button>
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="px-4 py-4 space-y-3">
              <Link href="/services" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
              <Link href="/how-it-works" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                How it works
              </Link>
              <Link href="/contractor/signup" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Become a pro
              </Link>
              <Link href="/contractor/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="uber-button w-full">
                  Sign in
                </button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {!showBookingForm ? (
          <>
            {/* Hero Section - Uber Style */}
            <section className="px-4 lg:px-8 py-12 lg:py-20 max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={`${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
                  <h2 className="text-4xl lg:text-6xl font-bold mb-6">
                    Home services at the tap of a button
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Professional, reliable, and affordable. Book trusted pros for all your home needs.
                  </p>
                  
                  {/* Quick booking card */}
                  <div className="uber-card p-6 max-w-md">
                    <h3 className="text-lg font-semibold mb-4">What do you need help with?</h3>
                    <div className="space-y-3">
                      {popularServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{service.icon}</span>
                            <div className="text-left">
                              <h3 className="font-semibold mb-1">{service.name}</h3>
                              <p className="text-sm opacity-70">From {formatCurrency(Number(service.basePrice))}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ))}
                    </div>
                    <Link href="#services" className="block mt-4">
                      <button className="uber-button-secondary w-full">
                        View all services
                      </button>
                    </Link>
                  </div>
                </div>
                
                {/* 3D Map Section */}
                <motion.div 
                  className={`hidden lg:block ${isVisible ? 'animate-fadeIn animation-delay-300' : 'opacity-0'}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {mapsLoaded ? (
                    <Home3DMap 
                      address={userAddress || undefined} 
                      className="h-[500px] rounded-2xl shadow-2xl"
                    />
                  ) : (
                    <div className="h-[500px] rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                      <div className="text-center">
                        <motion.div
                          className="bg-white rounded-full p-6 shadow-lg mb-4 inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <MapPin className="w-12 h-12 text-purple-600" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">Loading map...</h3>
                        <p className="text-gray-600">Finding pros in your area</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </section>

            {/* How it works - Uber Style */}
            <section className="bg-gray-50 dark:bg-gray-900 px-4 lg:px-8 py-16">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-12">How Leila works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Choose a service</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Select from our wide range of home services
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0">
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Book a pro</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Pick a time that works for you
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0">
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Get it done</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your pro arrives and completes the job
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section - Uber Style */}
            <section id="services" className="px-4 lg:px-8 py-16 max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">All services</h2>
              
              {/* Service categories */}
              <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveServiceCategory('popular')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeServiceCategory === 'popular' 
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => setActiveServiceCategory('home')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeServiceCategory === 'home' 
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Home repairs
                </button>
                <button
                  onClick={() => setActiveServiceCategory('maintenance')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeServiceCategory === 'maintenance' 
                      ? 'bg-black text-white dark:bg-white dark:text-black' 
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Maintenance
                </button>
              </div>
              
              {/* Service grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(activeServiceCategory === 'popular' ? popularServices : 
                  activeServiceCategory === 'home' ? homeServices : maintenanceServices).map((service, index) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`service-tile text-left ${
                      selectedService === service.id ? 'service-tile-selected' : ''
                    } animate-fadeIn`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-3xl mb-3">{service.icon}</div>
                    <h3 className="font-semibold mb-1">{service.name}</h3>
                    <p className="text-sm opacity-70">From {formatCurrency(Number(service.basePrice))}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Trust Section - Uber Style */}
            <section className="bg-black text-white dark:bg-white dark:text-black px-4 lg:px-8 py-16">
              <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold mb-2">10,000+</div>
                    <p className="opacity-70">Verified pros</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">4.8 ★</div>
                    <p className="opacity-70">Average rating</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <p className="opacity-70">Customer support</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 lg:px-8 py-16 max-w-7xl mx-auto">
              <div className="uber-card p-8 lg:p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to become a pro?</h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals earning more with Leila
                </p>
                <Link href="/contractor/signup">
                  <button className="uber-button text-lg px-8 py-4">
                    Get started
                  </button>
                </Link>
              </div>
            </section>
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
    </div>
  );
}