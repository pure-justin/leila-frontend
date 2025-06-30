'use client';

import { useState } from 'react';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Award, Users } from 'lucide-react';

// Mock data
const mockReviews = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    userAvatar: '/images/users/sarah.jpg',
    rating: 5,
    comment: 'Excellent service! The cleaner was very thorough and professional. My house has never looked better. They paid attention to every detail and even organized some cluttered areas. Highly recommend!',
    date: new Date(Date.now() - 86400000),
    serviceName: 'House Cleaning',
    contractorName: 'Maria Garcia',
    photos: ['/images/reviews/clean-kitchen.jpg', '/images/reviews/clean-bathroom.jpg'],
    helpful: 23,
    verified: true,
    response: {
      text: 'Thank you so much for your kind words, Sarah! It was a pleasure working in your home. We look forward to serving you again!',
      date: new Date(Date.now() - 43200000)
    }
  },
  {
    id: '2',
    userName: 'Michael Chen',
    rating: 4,
    comment: 'Great plumbing service. Fixed my leak quickly and explained everything clearly. Only minor issue was they arrived 15 minutes late, but called ahead to let me know.',
    date: new Date(Date.now() - 172800000),
    serviceName: 'Plumbing',
    contractorName: 'John Smith',
    helpful: 15,
    verified: true
  },
  {
    id: '3',
    userName: 'Emily Davis',
    userAvatar: '/images/users/emily.jpg',
    rating: 5,
    comment: 'Amazing work on our electrical panel upgrade. Very knowledgeable and safety-conscious. Cleaned up perfectly after the job.',
    date: new Date(Date.now() - 259200000),
    serviceName: 'Electrical',
    contractorName: 'Robert Wilson',
    photos: ['/images/reviews/electrical-panel.jpg'],
    helpful: 18,
    verified: false
  },
  {
    id: '4',
    userName: 'James Martinez',
    rating: 3,
    comment: 'Service was okay. The lawn looks good but they forgot to trim around the flower beds as requested. Had to call them back to finish.',
    date: new Date(Date.now() - 345600000),
    serviceName: 'Landscaping',
    contractorName: 'Green Thumb Services',
    helpful: 8,
    verified: true,
    response: {
      text: 'We apologize for the oversight, James. We\'ve updated our checklist to ensure this doesn\'t happen again. Thank you for your patience.',
      date: new Date(Date.now() - 259200000)
    }
  },
  {
    id: '5',
    userName: 'Lisa Thompson',
    userAvatar: '/images/users/lisa.jpg',
    rating: 5,
    comment: 'Fantastic experience! The team was professional, efficient, and went above and beyond. They even helped me move some heavy furniture. Will definitely use again!',
    date: new Date(Date.now() - 432000000),
    serviceName: 'Moving',
    contractorName: 'Swift Movers',
    photos: ['/images/reviews/moving-truck.jpg', '/images/reviews/packed-boxes.jpg'],
    helpful: 31,
    verified: true
  }
];

export default function ReviewsPage() {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [reviews, setReviews] = useState(mockReviews);

  // Mock pending review
  const pendingReview = {
    bookingId: 'BOOK-001',
    serviceName: 'House Cleaning',
    contractorName: 'Sarah Johnson',
    completedDate: new Date(Date.now() - 86400000)
  };

  const stats = {
    averageRating: 4.4,
    totalReviews: 1234,
    responseRate: 78,
    verifiedPercentage: 92
  };

  const handleReviewSubmit = (reviewData: any) => {
    // Add new review to the list
    const newReview = {
      id: Date.now().toString(),
      userName: 'You',
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date(),
      serviceName: pendingReview.serviceName,
      contractorName: pendingReview.contractorName,
      photos: reviewData.photos,
      helpful: 0,
      verified: true
    };

    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-gray-600">
            Real reviews from verified customers using Hey Leila
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{stats.averageRating}</span>
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalReviews}</span>
            </div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.responseRate}%</span>
            </div>
            <p className="text-sm text-gray-600">Response Rate</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{stats.verifiedPercentage}%</span>
            </div>
            <p className="text-sm text-gray-600">Verified Reviews</p>
          </motion.div>
        </div>

        {/* Pending Review Banner */}
        {pendingReview && !showReviewForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  How was your recent {pendingReview.serviceName} service?
                </h3>
                <p className="text-white/80">
                  Share your experience with {pendingReview.contractorName} and help others make informed decisions.
                </p>
              </div>
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Write a Review
              </button>
            </div>
          </motion.div>
        )}

        {/* Review Form */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <ReviewForm
                bookingId={pendingReview.bookingId}
                serviceName={pendingReview.serviceName}
                contractorName={pendingReview.contractorName}
                onSubmit={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviews List */}
        {!showReviewForm && (
          <ReviewsList
            reviews={reviews}
            averageRating={stats.averageRating}
            totalReviews={stats.totalReviews}
            onFilter={(filter) => console.log('Filter:', filter)}
          />
        )}
      </div>
    </div>
  );
}