'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Calendar, DollarSign, Shield, Star, ChevronRight } from 'lucide-react';
import { services } from '@/lib/services';
import { formatCurrency } from '@/lib/utils/currency';

interface ServiceSelectorProps {
  serviceId: string;
  onSelectStandard: () => void;
  onSelectServiceX: () => void;
  onCancel: () => void;
}

export default function ServiceSelector({ serviceId, onSelectStandard, onSelectServiceX, onCancel }: ServiceSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<'standard' | 'serviceX' | null>(null);
  const service = services.find(s => s.id === serviceId);
  
  if (!service) return null;

  const standardPrice = service.basePrice;
  const serviceXPrice = service.basePrice * 1.5 + 25; // 50% premium + $25 priority fee

  const handleContinue = () => {
    if (selectedOption === 'standard') {
      onSelectStandard();
    } else if (selectedOption === 'serviceX') {
      onSelectServiceX();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Choose Your Service Speed</h2>
          <p className="text-purple-100">Select how quickly you need {service.name}</p>
        </div>

        {/* Options */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* Standard Service */}
          <motion.button
            onClick={() => setSelectedOption('standard')}
            className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
              selectedOption === 'standard' 
                ? 'border-purple-600 bg-purple-50' 
                : 'border-gray-200 hover:border-purple-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {selectedOption === 'standard' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-sm">✓</span>
              </motion.div>
            )}
            
            <div className="mb-4">
              <Calendar className="w-10 h-10 text-purple-600 mb-2" />
              <h3 className="text-xl font-bold">Standard Service</h3>
              <p className="text-gray-600 text-sm mt-1">Book for a future date</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>Schedule within 3 days</span>
              </div>
              <div className="flex items-center text-sm">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <span>Standard rates apply</span>
              </div>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-2 text-gray-400" />
                <span>All available professionals</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Estimated cost</p>
              <p className="text-2xl font-bold text-purple-600">
                From {formatCurrency(standardPrice)}
              </p>
            </div>
          </motion.button>

          {/* Service X */}
          <motion.button
            onClick={() => setSelectedOption('serviceX')}
            className={`relative text-left p-6 rounded-2xl border-2 transition-all overflow-hidden ${
              selectedOption === 'serviceX' 
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-purple-50' 
                : 'border-gray-200 hover:border-yellow-400'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Premium badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
              PREMIUM
            </div>

            {selectedOption === 'serviceX' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 left-4 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
              >
                <span className="text-white text-sm">✓</span>
              </motion.div>
            )}
            
            <div className="mb-4">
              <div className="relative inline-block">
                <Zap className="w-10 h-10 text-yellow-500 mb-2" />
                <motion.div
                  className="absolute -inset-2 bg-yellow-400 rounded-full opacity-20"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h3 className="text-xl font-bold flex items-center">
                Service X
                <span className="ml-2 text-xs bg-black text-yellow-400 px-2 py-1 rounded-full">NEW</span>
              </h3>
              <p className="text-gray-600 text-sm mt-1">Get help within the hour</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm font-medium">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                <span>Same-day priority service</span>
              </div>
              <div className="flex items-center text-sm font-medium">
                <Shield className="w-4 h-4 mr-2 text-yellow-500" />
                <span>100% satisfaction guarantee</span>
              </div>
              <div className="flex items-center text-sm font-medium">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <span>Top-rated pros only (4.8+)</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-1">Premium pricing</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                From {formatCurrency(serviceXPrice)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Includes priority fee</p>
            </div>
          </motion.button>
        </div>

        {/* Action buttons */}
        <div className="p-6 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          
          <motion.button
            onClick={handleContinue}
            disabled={!selectedOption}
            className={`px-8 py-3 rounded-xl font-semibold flex items-center transition-all ${
              selectedOption 
                ? selectedOption === 'serviceX'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={selectedOption ? { scale: 1.05 } : {}}
            whileTap={selectedOption ? { scale: 0.95 } : {}}
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}