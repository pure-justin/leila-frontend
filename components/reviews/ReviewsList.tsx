'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Filter, ChevronDown, Calendar, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  serviceName: string;
  contractorName: string;
  photos?: string[];
  helpful: number;
  verified: boolean;
  response?: {
    text: string;
    date: Date;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onFilter?: (filter: string) => void;
}

export function ReviewsList({ reviews, averageRating, totalReviews, onFilter }: ReviewsListProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedPhotos, setExpandedPhotos] = useState<string | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const ratingDistribution = {
    5: 65,
    4: 20,
    3: 10,
    2: 3,
    1: 2
  };

  const handleHelpful = (reviewId: string) => {
    setHelpfulReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const filters = [
    { value: 'all', label: 'All Reviews' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
    { value: 'verified', label: 'Verified Only' },
    { value: 'photos', label: 'With Photos' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start mb-2">
              <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Based on {totalReviews} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {Object.entries(ratingDistribution)
              .reverse()
              .map(([rating, percentage]) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-4">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: Number(rating) * 0.1 }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium">Filter Reviews</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setSelectedFilter(filter.value);
                  onFilter?.(filter.value);
                }}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFilter === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {review.userAvatar ? (
                  <img
                    src={review.userAvatar}
                    alt={review.userName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/images/default-avatar.svg';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{review.userName}</h4>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(review.date, 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {review.serviceName} with {review.contractorName}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-gray-800 mb-4">{review.comment}</p>

            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mb-4">
                {review.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setExpandedPhotos(photo)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        console.error('Review photo failed to load:', photo);
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Contractor Response */}
            {review.response && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-primary-500">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Response from {review.contractorName}
                </p>
                <p className="text-gray-700">{review.response.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(review.response.date, 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button
                onClick={() => handleHelpful(review.id)}
                className={`flex items-center gap-2 text-sm ${
                  helpfulReviews.has(review.id)
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-gray-800'
                } transition-colors`}
              >
                <ThumbsUp className={`w-4 h-4 ${
                  helpfulReviews.has(review.id) ? 'fill-current' : ''
                }`} />
                <span>
                  Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                </span>
              </button>
              
              <button className="text-sm text-gray-600 hover:text-gray-800">
                Report
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center mt-8">
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Load More Reviews
        </button>
      </div>

      {/* Photo Modal */}
      {expandedPhotos && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setExpandedPhotos(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={expandedPhotos}
              alt="Expanded review photo"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setExpandedPhotos(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur rounded-full text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}