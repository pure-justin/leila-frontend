'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/lib/services';
import ServiceCard from '@/components/ServiceCard';
import BookingForm from '@/components/BookingForm';
import ChatBot from '@/components/ChatBot';
import { Briefcase, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowBookingForm(true);
  };

  const handleBookingComplete = () => {
    setShowBookingForm(false);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image src="/leila-logo.png" alt="Leila" width={80} height={80} className="h-20 w-auto mr-4" />
              <div>
                <p className="text-lg text-gray-600">Your AI assistant for home services - just say &ldquo;Hey Leila&rdquo;</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/contractor/signup">
                <Button variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Become a Pro
                </Button>
              </Link>
              <Link href="/contractor/dashboard">
                <Button variant="ghost">
                  Pro Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section for Contractors */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 mb-12 text-primary-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Join the Leila Network</h2>
              <p className="text-lg mb-6 text-primary-foreground/90">
                Connect with thousands of customers. Grow your business with our AI-powered platform.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3" />
                  <span>Get matched with customers instantly</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 mr-3" />
                  <span>Manage jobs efficiently</span>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="w-5 h-5 mr-3" />
                  <span>Grow your revenue by 40%</span>
                </div>
              </div>
              <Link href="/contractor/signup">
                <Button size="lg" variant="secondary">
                  Start Earning Today
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">10,000+</div>
                  <div className="text-lg">Active Service Professionals</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">$2.5M</div>
                    <div className="text-sm">Monthly Earnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.8★</div>
                    <div className="text-sm">Average Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!showBookingForm ? (
          <>
            <h2 className="text-2xl font-semibold mb-8">Select a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onSelect={handleServiceSelect}
                />
              ))}
            </div>
          </>
        ) : (
          <BookingForm
            serviceId={selectedService!}
            onComplete={handleBookingComplete}
            onCancel={() => setShowBookingForm(false)}
          />
        )}
      </main>

      <ChatBot />
    </div>
  );
}