'use client';

import { useState, useEffect } from 'react';
import { MapPin, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, fadeInUp, scaleIn } from '@/lib/animations';

interface AddressPromptProps {
  onAddressSubmit: (address: string) => void;
  onClose: () => void;
}

export default function AddressPrompt({ onAddressSubmit, onClose }: AddressPromptProps) {
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');

  const handleGeolocation = () => {
    setIsLocating(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            const formattedAddress = data.results[0].formatted_address;
            setAddress(formattedAddress);
            setIsLocating(false);
          }
        } catch (err) {
          setError('Unable to get your address. Please enter it manually.');
          setIsLocating(false);
        }
      },
      (error) => {
        setError('Unable to access your location. Please enter your address manually.');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onAddressSubmit(address);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          variants={scaleIn}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto"
            >
              <MapPin className="w-8 h-8" />
            </motion.div>
            <motion.h2
              className="text-2xl font-bold text-center mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to Leila!
            </motion.h2>
            <motion.p
              className="text-center text-purple-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Let&apos;s start by finding services in your area
            </motion.p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Service Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your address"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </motion.div>

            {error && (
              <motion.p
                className="text-sm text-red-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <motion.div
              className="mt-6 space-y-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center hover:border-purple-300"
                onClick={handleGeolocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <>
                    <motion.div
                      className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Locating...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    Use My Current Location
                  </>
                )}
              </Button>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                disabled={!address.trim()}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Continue
              </Button>
            </motion.div>

            <motion.button
              type="button"
              onClick={onClose}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Skip for now
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}