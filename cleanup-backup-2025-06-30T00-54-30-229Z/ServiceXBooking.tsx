'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Shield, Star, MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { ContractorMatcher, type MatchScore } from '@/lib/scheduling/contractor-matcher';
import { formatCurrency } from '@/lib/utils/currency';

interface ServiceXBookingProps {
  serviceId: string;
  serviceName: string;
  customerLocation: { lat: number; lng: number };
  basePrice: number;
  onComplete: (contractor: any) => void;
  onCancel: () => void;
}

export default function ServiceXBooking({
  serviceId,
  serviceName,
  customerLocation,
  basePrice,
  onComplete,
  onCancel
}: ServiceXBookingProps) {
  const [status, setStatus] = useState<'searching' | 'found' | 'dispatching' | 'confirmed' | 'failed'>('searching');
  const [matches, setMatches] = useState<MatchScore[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchScore | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [attemptedCount, setAttemptedCount] = useState(0);

  // Service X premium price (1.5x base + $25 priority fee)
  const serviceXPrice = basePrice * 1.5 + 25;

  useEffect(() => {
    // Simulate finding contractors
    const findContractors = async () => {
      // In real app, this would call Firebase
      const mockContractors = generateMockContractors();
      
      const matchRequest = {
        serviceId,
        customerLocation,
        requestedTime: new Date(),
        isUrgent: true,
        isPremium: true
      };

      const results = await ContractorMatcher.findBestMatches(
        matchRequest,
        mockContractors,
        5
      );

      setMatches(results);
      setStatus('found');
      
      // Start dispatching after 2 seconds
      setTimeout(() => startDispatching(results), 2000);
    };

    findContractors();
  }, [serviceId, customerLocation]);

  const startDispatching = async (matchList: MatchScore[]) => {
    setStatus('dispatching');
    let currentIndex = 0;

    for (const match of matchList) {
      setSelectedMatch(match);
      setTimeRemaining(30);
      setAttemptedCount(currentIndex + 1);

      // Countdown timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Simulate contractor response
      const accepted = await new Promise<boolean>((resolve) => {
        const responseTime = Math.random() * 25 + 5; // 5-30 seconds
        setTimeout(() => {
          // 70% acceptance rate for Service X
          resolve(Math.random() < 0.7);
        }, responseTime * 1000);
      });

      clearInterval(timer);

      if (accepted) {
        setStatus('confirmed');
        onComplete({
          contractor: match.contractor,
          price: serviceXPrice,
          eta: match.eta
        });
        return;
      }

      currentIndex++;
    }

    setStatus('failed');
  };

  const renderContent = () => {
    switch (status) {
      case 'searching':
        return (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-6"
            >
              <Zap className="w-16 h-16 text-yellow-400" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Activating Service X</h3>
            <p className="text-gray-600">Finding the best professionals near you...</p>
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-purple-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        );

      case 'found':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold">Found {matches.length} Elite Professionals!</h3>
              <p className="text-gray-600 mt-2">Dispatching your request now...</p>
            </div>
            
            <div className="space-y-3">
              {matches.slice(0, 3).map((match, idx) => (
                <motion.div
                  key={match.contractor.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gray-50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-purple-600">
                        {match.contractor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{match.contractor.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{match.contractor.rating}</span>
                        <span>•</span>
                        <span>{match.distance.toFixed(1)} km away</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">ETA</p>
                    <p className="font-bold text-purple-600">{match.eta} min</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'dispatching':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <motion.div
                  className="absolute inset-0 bg-purple-600 rounded-full opacity-20"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="relative w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {timeRemaining}
                </div>
              </div>
              <h3 className="text-xl font-bold mt-4">Requesting Professional #{attemptedCount}</h3>
              <p className="text-gray-600 mt-2">Waiting for acceptance...</p>
            </div>

            {selectedMatch && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold">{selectedMatch.contractor.name}</h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                        <span className="text-sm font-medium">{selectedMatch.contractor.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm">{selectedMatch.contractor.completedJobs} jobs</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm">{selectedMatch.distance.toFixed(1)} km</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Can arrive in</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedMatch.eta} min</p>
                  </div>
                </div>

                {selectedMatch.contractor.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {selectedMatch.contractor.certifications.map((cert, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-purple-700">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        );

      case 'confirmed':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Service X Activated!</h3>
            <p className="text-gray-600 mb-6">Your professional is on the way</p>
            
            {selectedMatch && (
              <div className="bg-green-50 rounded-xl p-6 text-left max-w-md mx-auto">
                <p className="font-semibold text-green-800 mb-2">
                  {selectedMatch.contractor.name} is heading to you
                </p>
                <div className="space-y-2 text-sm">
                  <p>⏱ ETA: {selectedMatch.eta} minutes</p>
                  <p>💰 Total: {formatCurrency(serviceXPrice)}</p>
                  <p>📍 Tracking available in app</p>
                </div>
              </div>
            )}
          </motion.div>
        );

      case 'failed':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Professionals Available</h3>
            <p className="text-gray-600 mb-6">
              All Service X professionals are busy. Try standard booking?
            </p>
            <button
              onClick={onCancel}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700"
            >
              Try Standard Booking
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Service X</h2>
              <p className="text-purple-100">Premium same-day service</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Estimated cost</p>
            <p className="text-2xl font-bold">{formatCurrency(serviceXPrice)}</p>
          </div>
        </div>
      </div>

      {/* Benefits bar */}
      <div className="bg-purple-50 px-6 py-3 flex items-center justify-around text-sm">
        <div className="flex items-center">
          <Shield className="w-4 h-4 mr-1 text-purple-600" />
          <span>Guaranteed</span>
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1 text-purple-600" />
          <span>Priority</span>
        </div>
        <div className="flex items-center">
          <Star className="w-4 h-4 mr-1 text-purple-600" />
          <span>Top Rated</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Cancel button */}
      {status !== 'confirmed' && (
        <div className="px-6 pb-6">
          <button
            onClick={onCancel}
            className="w-full py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
          >
            Cancel Service X
          </button>
        </div>
      )}
    </div>
  );
}

// Mock data generator
function generateMockContractors() {
  const names = ['Alex Chen', 'Maria Garcia', 'John Smith', 'Sarah Johnson', 'Mike Wilson'];
  const certs = ['Licensed', 'Bonded', 'Insured', 'EPA Certified', 'Master Technician'];
  
  return names.map((name, idx) => ({
    id: `contractor-${idx}`,
    name,
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
    },
    rating: 4.5 + Math.random() * 0.5,
    completedJobs: Math.floor(Math.random() * 500) + 100,
    certifications: certs.slice(0, Math.floor(Math.random() * 3) + 2),
    specialties: ['Plumbing', 'Electrical', 'HVAC'],
    availability: {
      [new Date().toISOString().split('T')[0]]: [
        { start: '08:00', end: '18:00', booked: false }
      ]
    },
    responseTime: Math.floor(Math.random() * 15) + 5,
    acceptanceRate: 0.7 + Math.random() * 0.25,
    currentJobs: Math.floor(Math.random() * 3),
    maxConcurrentJobs: 5,
  }));
}