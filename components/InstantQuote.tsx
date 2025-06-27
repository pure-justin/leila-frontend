'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Clock, DollarSign, Info } from 'lucide-react';
import { getServiceById } from '@/lib/comprehensive-services-catalog';
import { formatCurrency } from '@/lib/utils/currency';

interface InstantQuoteProps {
  serviceId: string;
  onQuoteGenerated?: (quote: QuoteDetails) => void;
}

interface QuoteDetails {
  basePrice: number;
  estimatedTotal: number;
  priceRange: string;
  factors: {
    urgency: number;
    complexity: number;
    timeOfDay: number;
  };
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export default function InstantQuote({ serviceId, onQuoteGenerated }: InstantQuoteProps) {
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [jobSize, setJobSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [timeSlot, setTimeSlot] = useState<'business' | 'evening' | 'weekend'>('business');
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const service = getServiceById(serviceId);
  if (!service) return null;

  const calculateQuote = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const basePrice = service.basePrice || 100; // Default fallback
      
      // Calculate multipliers
      const urgencyMultiplier = urgency === 'emergency' ? 1.5 : urgency === 'urgent' ? 1.25 : 1;
      const sizeMultiplier = jobSize === 'large' ? 1.4 : jobSize === 'small' ? 0.8 : 1;
      const timeMultiplier = timeSlot === 'weekend' ? 1.3 : timeSlot === 'evening' ? 1.15 : 1;
      
      // Calculate total
      const laborCost = basePrice * sizeMultiplier;
      const urgencyFee = laborCost * (urgencyMultiplier - 1);
      const timeFee = laborCost * (timeMultiplier - 1);
      const serviceFee = laborCost * 0.1; // 10% service fee
      
      const estimatedTotal = laborCost + urgencyFee + timeFee + serviceFee;
      
      const quoteDetails: QuoteDetails = {
        basePrice,
        estimatedTotal,
        priceRange: service.priceUnit === 'quote' 
          ? 'Custom Quote Required'
          : service.priceUnit === 'hourly'
          ? `${formatCurrency(basePrice)}/hr - ${formatCurrency(basePrice * 3)}/hr`
          : service.priceUnit === 'sqft'
          ? `${formatCurrency(basePrice)} - ${formatCurrency(basePrice * 5)} per sqft`
          : service.priceUnit === 'perUnit'
          ? `${formatCurrency(basePrice)} - ${formatCurrency(basePrice * 3)} per unit`
          : `${formatCurrency(basePrice)} - ${formatCurrency(basePrice * 3)}`,
        factors: {
          urgency: urgencyMultiplier,
          complexity: sizeMultiplier,
          timeOfDay: timeMultiplier
        },
        breakdown: [
          { label: 'Labor Cost', amount: laborCost },
          ...(urgencyFee > 0 ? [{ label: 'Urgency Fee', amount: urgencyFee }] : []),
          ...(timeFee > 0 ? [{ label: 'After Hours Fee', amount: timeFee }] : []),
          { label: 'Service Fee', amount: serviceFee }
        ]
      };
      
      setQuote(quoteDetails);
      onQuoteGenerated?.(quoteDetails);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Calculator className="w-6 h-6 mr-3 text-purple-600" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Instant Quote Calculator
        </h2>
      </div>

      <div className="space-y-6">
        {/* Service Info */}
        <div className="bg-purple-50 rounded-xl p-4">
          <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
          <p className="text-gray-600 text-sm">{service.description}</p>
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>Typically {service.duration}</span>
          </div>
        </div>

        {/* Quote Parameters */}
        <div className="space-y-4">
          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When do you need service?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['normal', 'urgent', 'emergency'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setUrgency(level)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    urgency === level
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium capitalize">{level}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {level === 'normal' && 'Within 3 days'}
                    {level === 'urgent' && 'Within 24 hours'}
                    {level === 'emergency' && 'ASAP'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Job Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job complexity
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setJobSize(size)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    jobSize === size
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium capitalize">{size}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {size === 'small' && 'Quick fix'}
                    {size === 'medium' && 'Standard job'}
                    {size === 'large' && 'Complex project'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred time
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['business', 'evening', 'weekend'] as const).map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    timeSlot === slot
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="font-medium capitalize">
                    {slot === 'business' ? 'Business Hours' : slot}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {slot === 'business' && '9AM - 5PM'}
                    {slot === 'evening' && '5PM - 9PM'}
                    {slot === 'weekend' && 'Sat/Sun'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Get Quote Button */}
        <motion.button
          onClick={calculateQuote}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Calculating...' : 'Get Instant Quote'}
        </motion.button>

        {/* Quote Display */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 space-y-4"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Estimated Total</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {formatCurrency(quote.estimatedTotal)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Typical range: {quote.priceRange}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2">
              {quote.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>

            {/* Info Note */}
            <div className="flex items-start space-x-2 bg-blue-50 p-3 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">
                This is an estimate based on typical jobs. Final price may vary based on actual
                requirements and on-site assessment.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}