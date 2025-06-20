'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/lib/services';
import BookingForm from '@/components/BookingForm';
import ChatBot from '@/components/ChatBot';
import { Menu, X, Clock, Calendar, MapPin, User, ChevronRight, Star, Shield, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState('popular');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowBookingForm(true);
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedService(null);
  };

  const popularServices = services.slice(0, 4);
  const homeServices = services.filter(s => ['plumbing-repair', 'electrical-service', 'hvac-maintenance', 'house-cleaning'].includes(s.id));
  const maintenanceServices = services.filter(s => ['appliance-repair', 'painting', 'lawn-care', 'pest-control'].includes(s.id));

  return (
    <div className="min-h-screen bg-white">
      {/* Uber-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Image 
                src="/logo-new.svg" 
                alt="Leila Logo" 
                width={120} 
                height={40} 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link href="/services" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Services
              </Link>
              <Link href="/solar-analysis" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Solar Analysis
              </Link>
              <Link href="/how-it-works" className="text-sm font-medium hover:text-gray-600 transition-colors">
                How it works
              </Link>
              <Link href="/contractor/signup" className="text-sm font-medium hover:text-gray-600 transition-colors">
                Become a pro
              </Link>
              <Link href="/contractor/login">
                <button className="gradient-button text-sm px-3 sm:px-4 py-2">
                  Sign in
                </button>
              </Link>
            </nav>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <Link href="/services" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Services
              </Link>
              <Link href="/solar-analysis" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Solar Analysis
              </Link>
              <Link href="/how-it-works" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                How it works
              </Link>
              <Link href="/contractor/signup" className="block text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                Become a pro
              </Link>
              <Link href="/contractor/login" onClick={() => setMobileMenuOpen(false)}>
                <button className="gradient-button w-full">
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
                    Home services at the <span className="gradient-text">tap of a button</span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8">
                    Professional, reliable, and affordable. Book trusted pros for all your home needs.
                  </p>
                  
                  {/* Quick booking card */}
                  <div className="border-gradient p-6 max-w-md">
                    <div className="bg-white rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">What do you need help with?</h3>
                    <div className="space-y-3">
                      {popularServices.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service.id)}
                          className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{service.icon}</span>
                            <div className="text-left">
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.priceRange}</p>
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
                </div>
                
                {/* Map/Visual Section */}
                <div className={`hidden lg:block ${isVisible ? 'animate-fadeIn animation-delay-300' : 'opacity-0'}`}>
                  <div className="map-container h-[500px] rounded-2xl p-8 flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-white rounded-full p-6 shadow-lg mb-4 inline-block">
                        <MapPin className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Available in your area</h3>
                      <p className="text-gray-600">Trusted pros ready to help</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Solar Analysis CTA Section */}
            <section className="gradient-secondary px-4 lg:px-8 py-12">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-yellow-500 rounded-full p-3">
                        <Sun className="w-8 h-8 text-white" />
                      </div>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        New Feature
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                      Go Solar & Save Money
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Get a free solar analysis for your home. Discover potential savings, 
                      optimal panel placement, and environmental impact with our advanced AI-powered tool.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/solar-analysis">
                        <button className="gradient-button flex items-center justify-center gap-2 px-6 py-3">
                          <Sun className="w-5 h-5" />
                          Get Free Solar Analysis
                        </button>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-5 h-5" />
                        <span>No commitment required</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 rounded-full p-2">
                            <Star className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Average Savings</p>
                            <p className="text-sm text-gray-600">$1,200 - $2,400 per year</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 rounded-full p-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Analysis Time</p>
                            <p className="text-sm text-gray-600">Get results in under 5 minutes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 rounded-full p-2">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Coverage</p>
                            <p className="text-sm text-gray-600">Available nationwide</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How it works - Uber Style */}
            <section className="bg-gray-50 px-4 lg:px-8 py-16">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-12">How it works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 gradient-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0 animate-float">
                      1
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Choose a service</h3>
                    <p className="text-gray-600">
                      Select from our wide range of home services
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 gradient-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0 animate-float" style={{ animationDelay: '0.2s' }}>
                      2
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Book a pro</h3>
                    <p className="text-gray-600">
                      Pick a time that works for you
                    </p>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="w-16 h-16 gradient-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto md:mx-0 animate-float" style={{ animationDelay: '0.4s' }}>
                      3
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Get it done</h3>
                    <p className="text-gray-600">
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
                      ? 'gradient-primary text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Popular
                </button>
                <button
                  onClick={() => setActiveServiceCategory('home')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeServiceCategory === 'home' 
                      ? 'gradient-primary text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Home repairs
                </button>
                <button
                  onClick={() => setActiveServiceCategory('maintenance')}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeServiceCategory === 'maintenance' 
                      ? 'gradient-primary text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
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
                    <p className="text-sm opacity-70">{service.priceRange}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Trust Section - Uber Style */}
            <section className="bg-purple-600 text-white px-4 lg:px-8 py-16">
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
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join thousands of professionals earning more with our platform
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
    </div>
  );
}