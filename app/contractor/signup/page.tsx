'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Shield, Clock, DollarSign, Home } from 'lucide-react';

export default function ContractorSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    
    // Business Info
    businessName: '',
    businessType: '',
    yearsInBusiness: '',
    licenseNumber: '',
    insurance: false,
    
    // Services
    services: [] as string[],
    serviceAreas: [] as string[],
    
    // Availability
    availability: {
      monday: { available: true, start: '08:00', end: '18:00' },
      tuesday: { available: true, start: '08:00', end: '18:00' },
      wednesday: { available: true, start: '08:00', end: '18:00' },
      thursday: { available: true, start: '08:00', end: '18:00' },
      friday: { available: true, start: '08:00', end: '18:00' },
      saturday: { available: false, start: '08:00', end: '18:00' },
      sunday: { available: false, start: '08:00', end: '18:00' },
    },
    emergencyAvailable: false,
    
    // Payment
    hourlyRate: '',
    acceptedPayments: [] as string[],
  });

  const services = [
    'Plumbing', 'Electrical', 'HVAC', 'Cleaning',
    'Lawn Care', 'Pest Control', 'Appliance Repair', 'Painting',
    'Carpentry', 'Roofing', 'Flooring', 'Handyman'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('Contractor signup:', formData);
    router.push('/contractor/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link href="/" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Back to Home</span>
              </Link>
              <Link href="/" className="flex items-center">
                <Image src="/leila-logo.png" alt="Leila" width={64} height={64} className="h-12 md:h-16 w-auto" />
              </Link>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  Customer Portal
                </Button>
              </Link>
              <Link href="/contractor/login">
                <Button variant="outline" size="sm">
                  Pro Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Join Leila as a Service Professional
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 mb-6 md:mb-8">
            Connect with customers, grow your business, and manage jobs efficiently
          </p>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
            <div className="flex items-start space-x-3">
              <Users className="w-6 md:w-8 h-6 md:h-8 text-indigo-200 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base md:text-lg">More Customers</h3>
                <p className="text-sm md:text-base text-indigo-100">Access thousands of customers looking for your services</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 md:w-8 h-6 md:h-8 text-indigo-200 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base md:text-lg">Grow Revenue</h3>
                <p className="text-sm md:text-base text-indigo-100">Average contractors increase revenue by 40%</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-6 md:w-8 h-6 md:h-8 text-indigo-200 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-base md:text-lg">Secure Payments</h3>
                <p className="text-sm md:text-base text-indigo-100">Get paid quickly with payment protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
              <span className="text-sm text-gray-500">
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Business Details'}
                {step === 3 && 'Services & Availability'}
                {step === 4 && 'Review & Submit'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Must be at least 8 characters with numbers and letters
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Business Details */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Business Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual/Sole Proprietor</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.yearsInBusiness}
                      onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number (if applicable)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="insurance"
                    className="h-4 w-4 text-primary focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.checked })}
                  />
                  <label htmlFor="insurance" className="ml-2 block text-sm text-gray-900">
                    I have liability insurance
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Services & Availability */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Services & Availability</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Services Offered (select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map((service) => (
                      <label key={service} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-indigo-500 border-gray-300 rounded"
                          checked={formData.services.includes(service)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, services: [...formData.services, service] });
                            } else {
                              setFormData({ ...formData, services: formData.services.filter(s => s !== service) });
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emergency"
                    className="h-4 w-4 text-primary focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.emergencyAvailable}
                    onChange={(e) => setFormData({ ...formData, emergencyAvailable: e.target.checked })}
                  />
                  <label htmlFor="emergency" className="ml-2 block text-sm text-gray-900">
                    Available for emergency calls (higher rates apply)
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-gray-600">{formData.firstName} {formData.lastName}</p>
                    <p className="text-gray-600">{formData.email}</p>
                    <p className="text-gray-600">{formData.phone}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Business Details</h3>
                    <p className="text-gray-600">{formData.businessName}</p>
                    <p className="text-gray-600">{formData.businessType} • {formData.yearsInBusiness} years experience</p>
                    {formData.insurance && <p className="text-green-600">✓ Insured</p>}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">Services</h3>
                    <p className="text-gray-600">{formData.services.join(', ')}</p>
                    <p className="text-gray-600">Hourly Rate: ${formData.hourlyRate}</p>
                    {formData.emergencyAvailable && <p className="text-green-600">✓ Emergency service available</p>}
                  </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• We&apos;ll review your application within 24 hours</li>
                    <li>• Complete a background check</li>
                    <li>• Once approved, you can start accepting jobs immediately</li>
                    <li>• Access to contractor dashboard and mobile app</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
              
              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto bg-gradient-to-r from-indigo-600 to-purple-600"
                >
                  Submit Application
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 md:mt-12 text-center">
          <p className="text-sm md:text-base text-gray-600 mb-4">Trusted by over 10,000 service professionals</p>
          <div className="flex justify-center items-center space-x-6 md:space-x-8">
            <div className="text-center">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <p className="text-xs md:text-sm text-gray-600">Quick Approval</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <p className="text-xs md:text-sm text-gray-600">Secure Platform</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2" />
              <p className="text-xs md:text-sm text-gray-600">Fast Payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}