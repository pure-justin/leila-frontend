'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Camera, X, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  bookingId: string;
  serviceName: string;
  contractorName: string;
  onSubmit: (review: ReviewData) => void;
  onCancel: () => void;
}

interface ReviewData {
  rating: number;
  comment: string;
  photos: string[];
  wouldRecommend: boolean;
  categories: {
    quality: number;
    punctuality: number;
    professionalism: number;
    value: number;
  };
}

export function ReviewForm({ 
  bookingId, 
  serviceName, 
  contractorName, 
  onSubmit, 
  onCancel 
}: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [categories, setCategories] = useState({
    quality: 0,
    punctuality: 0,
    professionalism: 0,
    value: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const quickResponses = [
    "Great service! Very professional.",
    "Arrived on time and did excellent work.",
    "Would definitely book again.",
    "Highly recommended!",
    "Good value for money."
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In production, upload to storage
    // For demo, create object URLs
    const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData: ReviewData = {
        rating,
        comment,
        photos,
        wouldRecommend,
        categories
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onSubmit(reviewData);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    size = 'lg' 
  }: { 
    value: number; 
    onChange: (rating: number) => void;
    size?: 'sm' | 'lg';
  }) => {
    const [hovered, setHovered] = useState(0);
    const starSize = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`${starSize} ${
                star <= (hovered || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Rate Your Experience</h2>
      <p className="text-gray-600 mb-6">
        How was your {serviceName} service with {contractorName}?
      </p>

      {/* Overall Rating */}
      <div className="mb-8">
        <label className="block text-lg font-medium mb-3">Overall Rating</label>
        <div className="flex items-center gap-4">
          <StarRating value={rating} onChange={setRating} />
          <span className="text-lg text-gray-600">
            {rating > 0 && (
              rating === 5 ? 'Excellent!' :
              rating === 4 ? 'Great!' :
              rating === 3 ? 'Good' :
              rating === 2 ? 'Fair' :
              'Poor'
            )}
          </span>
        </div>
      </div>

      {/* Category Ratings */}
      <div className="mb-8 space-y-4">
        <h3 className="font-medium text-lg">Rate specific aspects</h3>
        {Object.entries({
          quality: 'Quality of Work',
          punctuality: 'Punctuality',
          professionalism: 'Professionalism',
          value: 'Value for Money'
        }).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-gray-700">{label}</span>
            <StarRating
              value={categories[key as keyof typeof categories]}
              onChange={(value) => setCategories(prev => ({ ...prev, [key]: value }))}
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Written Review */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-3">
          Tell us more (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details about your experience..."
          className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          rows={4}
        />
        
        {/* Quick Responses */}
        <div className="mt-2 flex flex-wrap gap-2">
          {quickResponses.map((response, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setComment(response)}
              className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {response}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-3">
          Add Photos (optional)
        </label>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {photos.length < 5 && (
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <Camera className="w-6 h-6 text-gray-400" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Would Recommend */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wouldRecommend}
            onChange={(e) => setWouldRecommend(e.target.checked)}
            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-gray-700">
            I would recommend {contractorName} to friends and family
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  );
}