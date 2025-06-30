'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Shield, Clock, ChevronRight, Smartphone } from 'lucide-react';
import MobileAppPromotion from '@/components/MobileAppPromotion';

export default function MobileLanding() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // If on desktop, redirect to main site
    if (!isMobile && typeof window !== 'undefined') {
      router.push('/');
    }
  }, [router]);

  const features = [
    {
      icon: Clock,
      title: 'Book in Seconds',
      description: 'Find and book verified pros instantly',
    },
    {
      icon: Shield,
      title: 'Trusted Professionals',
      description: 'All contractors are background checked',
    },
    {
      icon: Star,
      title: '5-Star Service',
      description: 'Guaranteed satisfaction on every job',
    },
  ];

  const services = [
    { name: 'Plumbing', emoji: '🔧', color: 'bg-blue-500' },
    { name: 'Electrical', emoji: '⚡', color: 'bg-yellow-500' },
    { name: 'Cleaning', emoji: '🧹', color: 'bg-green-500' },
    { name: 'HVAC', emoji: '❄️', color: 'bg-cyan-500' },
    { name: 'Handyman', emoji: '🔨', color: 'bg-orange-500' },
    { name: 'More', emoji: '➕', color: 'bg-purple-500' },
  ];

  return (
    <>
      {/* Mobile App Promotion Overlay */}
      <MobileAppPromotion />

      {/* Fallback Mobile Web Content */}
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Simplified Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="font-bold text-xl">Leila</span>
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Get App
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Home Services at Your Fingertips
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Download the Leila app for the best experience
          </p>

          {/* App Download CTA */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Get the App</h2>
                <p className="text-purple-100">For a faster, better experience</p>
              </div>
              <ChevronRight className="w-6 h-6" />
            </div>
            <div className="flex gap-3">
              <a
                href="https://apps.apple.com/app/leila-home-services/id6747648334"
                className="flex-1 bg-black/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center font-medium hover:bg-black/30 transition-colors"
              >
                App Store
              </a>
              <button className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-center font-medium hover:bg-white/30 transition-colors">
                Google Play
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Why Choose Leila?</h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Services Grid */}
        <section className="px-4 py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Services</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
              >
                <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <span className="text-2xl">{service.emoji}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{service.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom App Banner */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Leila App</p>
              <p className="text-sm text-gray-600">Better experience in the app</p>
            </div>
            <a
              href="https://apps.apple.com/app/leila-home-services/id6747648334"
              className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium text-sm"
            >
              Open
            </a>
          </div>
        </div>
      </div>
    </>
  );
}