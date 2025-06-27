'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Camera, ThumbsUp, Send, X } from 'lucide-react';
import Image from 'next/image';

interface RatingPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: RatingData) => void;
  contractorName?: string;
  serviceName?: string;
  type: 'user-rates-contractor' | 'contractor-rates-user';
}

interface RatingData {
  rating: number;
  comment: string;
  tags: string[];
  wouldRecommend: boolean;
  photos?: File[];
}

const USER_RATING_TAGS = [
  '⏰ On Time',
  '💰 Fair Price',
  '👌 Quality Work',
  '🗣️ Good Communication',
  '🧹 Clean & Tidy',
  '🎯 Professional',
  '💡 Knowledgeable',
  '🔧 Well Equipped'
];

const CONTRACTOR_RATING_TAGS = [
  '🏠 Easy Access',
  '📱 Responsive',
  '💬 Clear Instructions',
  '⏰ Punctual',
  '💳 Prompt Payment',
  '🤝 Respectful',
  '📋 Organized',
  '😊 Friendly'
];

export default function RatingPrompt({
  isOpen,
  onClose,
  onSubmit,
  contractorName = 'the service provider',
  serviceName = 'the service',
  type
}: RatingPromptProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [step, setStep] = useState<'rating' | 'details' | 'photos'>('rating');

  const tags = type === 'user-rates-contractor' ? USER_RATING_TAGS : CONTRACTOR_RATING_TAGS;

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({
        rating,
        comment,
        tags: selectedTags,
        wouldRecommend: wouldRecommend ?? true,
        photos
      });
      onClose();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 3)); // Max 3 photos
  };

  const renderStep = () => {
    switch (step) {
      case 'rating':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-2">
              How was your experience?
            </h2>
            <p className="text-gray-600 mb-6">
              {type === 'user-rates-contractor' 
                ? `Rate ${contractorName} for ${serviceName}`
                : `Rate your customer`}
            </p>

            {/* Star Rating */}
            <div className="flex justify-center mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => {
                    setRating(star);
                    setTimeout(() => setStep('details'), 300);
                  }}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            {/* Rating Labels */}
            <div className="text-lg font-medium text-gray-700">
              {hoveredRating === 1 && '😞 Poor'}
              {hoveredRating === 2 && '😐 Fair'}
              {hoveredRating === 3 && '🙂 Good'}
              {hoveredRating === 4 && '😊 Great'}
              {hoveredRating === 5 && '🤩 Excellent'}
            </div>
          </motion.div>
        );

      case 'details':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-bold mb-4">Tell us more</h3>

            {/* Selected Rating Display */}
            <div className="flex items-center mb-4 p-3 bg-yellow-50 rounded-lg">
              <div className="flex mr-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : 'Needs improvement'}
              </span>
            </div>

            {/* Tags */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                What went well? (select all that apply)
              </p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <motion.button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${
                      selectedTags.includes(tag)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tag}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add a comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>

            {/* Would Recommend */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Would you recommend {type === 'user-rates-contractor' ? contractorName : 'this customer'}?
              </p>
              <div className="flex space-x-3">
                <motion.button
                  onClick={() => setWouldRecommend(true)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    wouldRecommend === true
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ThumbsUp className="w-5 h-5 inline mr-2" />
                  Yes
                </motion.button>
                <motion.button
                  onClick={() => setWouldRecommend(false)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    wouldRecommend === false
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  No
                </motion.button>
              </div>
            </div>

            {/* Next Button */}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('rating')}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <motion.button
                onClick={() => {
                  if (type === 'user-rates-contractor' && rating >= 4) {
                    setStep('photos');
                  } else {
                    handleSubmit();
                  }
                }}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {type === 'user-rates-contractor' && rating >= 4 ? 'Next' : 'Submit Review'}
              </motion.button>
            </div>
          </motion.div>
        );

      case 'photos':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-bold mb-2">Share photos (optional)</h3>
            <p className="text-gray-600 mb-6">
              Help others see the great work!
            </p>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Click to upload photos</p>
                  <p className="text-sm text-gray-500 mt-1">Max 3 photos</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </label>

              {/* Photo Preview */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <Image
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${idx + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                Back
              </button>
              <motion.button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Review
              </motion.button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-md w-full p-6 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Content */}
            {renderStep()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}