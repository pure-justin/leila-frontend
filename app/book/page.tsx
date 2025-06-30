'use client';

import { useState } from 'react';
import { COMPREHENSIVE_SERVICE_CATALOG } from '@/lib/comprehensive-services-catalog';

export default function BookPage() {
  const [selectedService, setSelectedService] = useState('');

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-600 mb-8">Book a Service</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMPREHENSIVE_SERVICE_CATALOG.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-2">
                {category.icon} {category.name}
              </h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              
              {category.subcategories.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className="block w-full text-left p-2 hover:bg-purple-50 rounded mb-2"
                >
                  {service.name} - ${service.basePrice}
                </button>
              ))}
            </div>
          ))}
        </div>

        {selectedService && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">
              Service Selected: {selectedService}
            </h3>
            <p className="text-green-600">
              Booking system optimized - ready for full implementation!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}