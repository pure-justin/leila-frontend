'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, Phone, MessageSquare, Calendar,
  Clock, CheckCircle, TrendingUp, MoreVertical,
  X, User,
  Zap
} from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils/currency';

interface Contractor {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  responseTime: string;
  completedJobs: number;
  memberSince: string;
  lastBooked?: string;
  isFavorite: boolean;
  badges: string[];
  avgPrice: number;
  availability: 'available' | 'busy' | 'offline';
}

interface FavoriteContractorsProps {
  contractors: Contractor[];
  onBookNow: (contractorId: string) => void;
  onMessage: (contractorId: string) => void;
  onToggleFavorite: (contractorId: string) => void;
}

export default function FavoriteContractors({
  contractors,
  onBookNow,
  onMessage,
  onToggleFavorite
}: FavoriteContractorsProps) {
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'recent'>('all');

  const filteredContractors = contractors.filter(contractor => {
    if (filter === 'available') return contractor.availability === 'available';
    if (filter === 'recent') return contractor.lastBooked;
    return true;
  });

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available Now';
      case 'busy':
        return 'Busy - Next in 2h';
      case 'offline':
        return 'Offline';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Heart className="w-6 h-6 mr-2 text-red-500 fill-current" />
          Your Favorite Pros
        </h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'available', label: 'Available' },
            { id: 'recent', label: 'Recent' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContractors.map((contractor, idx) => (
          <motion.div
            key={contractor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
          >
            {/* Header with Photo and Status */}
            <div className="relative p-4 pb-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {contractor.photo ? (
                      <Image
                        src={contractor.photo}
                        alt={contractor.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-purple-600" />
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      contractor.availability === 'available' ? 'bg-green-500' : 
                      contractor.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg">{contractor.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium ml-1">{contractor.rating}</span>
                        <span className="text-sm text-gray-500 ml-1">({contractor.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Button */}
                <button
                  onClick={() => setSelectedContractor(contractor)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Availability Badge */}
              <div className="mt-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(contractor.availability)}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {getAvailabilityText(contractor.availability)}
                </span>
              </div>
            </div>

            {/* Specialties */}
            <div className="px-4 py-2">
              <div className="flex flex-wrap gap-1">
                {contractor.specialties.slice(0, 3).map(specialty => (
                  <span key={specialty} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {specialty}
                  </span>
                ))}
                {contractor.specialties.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{contractor.specialties.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="px-4 py-3 bg-gray-50 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-500">Jobs</p>
                <p className="font-semibold text-sm">{contractor.completedJobs}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Response</p>
                <p className="font-semibold text-sm">{contractor.responseTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Price</p>
                <p className="font-semibold text-sm">{formatCurrency(contractor.avgPrice)}</p>
              </div>
            </div>

            {/* Last Booked */}
            {contractor.lastBooked && (
              <div className="px-4 py-2 bg-purple-50 text-center">
                <p className="text-xs text-purple-700">
                  Last booked: {contractor.lastBooked}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 flex space-x-2">
              <button
                onClick={() => onBookNow(contractor.id)}
                disabled={contractor.availability === 'offline'}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  contractor.availability === 'offline'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Book Now
              </button>
              <button
                onClick={() => onMessage(contractor.id)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => onToggleFavorite(contractor.id)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${contractor.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Badges */}
            {contractor.badges.length > 0 && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {contractor.badges.map(badge => (
                  <span key={badge} className="inline-flex items-center text-xs">
                    {badge === 'Top Rated' && <Star className="w-3 h-3 text-yellow-500 mr-1" />}
                    {badge === 'Quick Response' && <Zap className="w-3 h-3 text-blue-500 mr-1" />}
                    {badge === 'Verified' && <CheckCircle className="w-3 h-3 text-green-500 mr-1" />}
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContractors.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No favorite contractors yet</h3>
          <p className="text-gray-500">
            Start booking services and save your favorite pros for quick access
          </p>
        </div>
      )}

      {/* Contractor Detail Modal */}
      <AnimatePresence>
        {selectedContractor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedContractor(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Contractor Options</h3>
                <button
                  onClick={() => setSelectedContractor(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    onBookNow(selectedContractor.id);
                    setSelectedContractor(null);
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center"
                >
                  <Calendar className="w-5 h-5 mr-3 text-purple-600" />
                  <div>
                    <p className="font-medium">Book Appointment</p>
                    <p className="text-sm text-gray-500">Schedule a service</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onMessage(selectedContractor.id);
                    setSelectedContractor(null);
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center"
                >
                  <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium">Send Message</p>
                    <p className="text-sm text-gray-500">Ask questions or discuss service</p>
                  </div>
                </button>

                <button
                  onClick={() => window.open(`tel:1-800-HEYLEILA`)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center"
                >
                  <Phone className="w-5 h-5 mr-3 text-green-600" />
                  <div>
                    <p className="font-medium">Call Support</p>
                    <p className="text-sm text-gray-500">Get help booking</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onToggleFavorite(selectedContractor.id);
                    setSelectedContractor(null);
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center"
                >
                  <Heart className="w-5 h-5 mr-3 text-red-500" />
                  <div>
                    <p className="font-medium">
                      {selectedContractor.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedContractor.isFavorite ? 'Remove from your saved list' : 'Save for quick access'}
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}