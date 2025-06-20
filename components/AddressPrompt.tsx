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
  const [showPermissionHint, setShowPermissionHint] = useState(false);

  const fetchAddressFromServer = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });
      
      const data = await response.json();
      console.log('Server geocoding response:', data);
      
      if (data.success && data.address) {
        setAddress(data.address);
        setIsLocating(false);
        setShowPermissionHint(false);
      } else {
        setError(data.error || 'Could not find address for your location. Please enter manually.');
        setIsLocating(false);
        setShowPermissionHint(false);
      }
    } catch (err) {
      console.error('Server geocoding error:', err);
      setError('Unable to get your address. Please enter it manually.');
      setIsLocating(false);
      setShowPermissionHint(false);
    }
  };

  const handleGeolocation = () => {
    setIsLocating(true);
    setError('');
    setShowPermissionHint(true);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLocating(false);
      setShowPermissionHint(false);
      return;
    }

    // Show hint about browser permission
    setTimeout(() => {
      if (isLocating) {
        setShowPermissionHint(true);
      }
    }, 1000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          console.log('Got coordinates:', latitude, longitude);
          
          // Try client-side geocoding first if Google Maps is loaded
          if (window.google && window.google.maps && window.google.maps.Geocoder) {
            console.log('Using client-side Google Maps geocoding...');
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  setAddress(results[0].formatted_address);
                  setIsLocating(false);
                  setShowPermissionHint(false);
                } else {
                  console.error('Geocoding failed:', status);
                  // Fallback to server-side geocoding
                  fetchAddressFromServer(latitude, longitude);
                }
              }
            );
          } else {
            // Fallback to server-side geocoding
            fetchAddressFromServer(latitude, longitude);
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setError('Unable to get your address. Please enter it manually.');
          setIsLocating(false);
          setShowPermissionHint(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to access your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please enter your address manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage += 'Please enter your address manually.';
        }
        
        setError(errorMessage);
        setIsLocating(false);
        setShowPermissionHint(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
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

            {showPermissionHint && isLocating && !error && (
              <motion.div
                className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm text-blue-700">
                  <strong>Tip:</strong> Look for a location permission popup in your browser. 
                  You may need to click "Allow" to share your location.
                </p>
              </motion.div>
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