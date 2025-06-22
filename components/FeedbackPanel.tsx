'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Sparkles, ThumbsUp, 
  Lightbulb, Bug, Heart, Zap, CheckCircle,
  TrendingUp, Users, Code, Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface FeedbackType {
  id: string;
  label: string;
  icon: any;
  color: string;
  placeholder: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  type: string;
  votes: number;
  status: 'pending' | 'in-review' | 'accepted' | 'in-development' | 'completed';
  aiGenerated: boolean;
  implementationPrompt?: string;
  estimatedEffort?: string;
  createdAt: Date;
}

export default function FeedbackPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('feature');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [popularRequests, setPopularRequests] = useState<FeatureRequest[]>([
    {
      id: '1',
      title: 'Voice-activated booking',
      description: 'Book services using voice commands like "Hey Leila, book a cleaner for tomorrow"',
      type: 'feature',
      votes: 127,
      status: 'in-review',
      aiGenerated: true,
      implementationPrompt: 'Implement voice recognition using Web Speech API...',
      estimatedEffort: '2 weeks',
      createdAt: new Date()
    },
    {
      id: '2',
      title: 'Subscription services',
      description: 'Weekly or monthly recurring bookings with discounts',
      type: 'feature',
      votes: 89,
      status: 'accepted',
      aiGenerated: true,
      implementationPrompt: 'Create subscription model with Stripe recurring payments...',
      estimatedEffort: '3 weeks',
      createdAt: new Date()
    }
  ]);

  const feedbackTypes: FeedbackType[] = [
    {
      id: 'feature',
      label: 'Feature Request',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      placeholder: 'I wish the app could...'
    },
    {
      id: 'improvement',
      label: 'Improvement',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'It would be better if...'
    },
    {
      id: 'bug',
      label: 'Bug Report',
      icon: Bug,
      color: 'from-red-500 to-pink-500',
      placeholder: 'I found an issue with...'
    },
    {
      id: 'praise',
      label: 'Love it!',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      placeholder: 'I love how...'
    }
  ];

  const handleSubmit = async () => {
    if (!feedback.trim() || !user) return;

    setIsSubmitting(true);
    try {
      // Call AI function to process feedback
      const processFeedback = httpsCallable(functions, 'processFeedback');
      const result = await processFeedback({
        userId: user.uid,
        userEmail: user.email,
        type: selectedType,
        feedback,
        timestamp: new Date().toISOString()
      });

      // The AI will:
      // 1. Analyze the feedback
      // 2. Generate implementation prompts if it's a feature request
      // 3. Estimate complexity and effort
      // 4. Create tickets in the development system
      // 5. Suggest similar existing features

      setShowSuccess(true);
      setFeedback('');
      
      // Auto-hide success after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = (requestId: string) => {
    setPopularRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, votes: req.votes + 1 }
          : req
      )
    );
  };

  const getStatusColor = (status: FeatureRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'in-review': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'in-development': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-500 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI-Powered Feedback
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-purple-100">
                Your ideas shape our future. AI analyzes every suggestion!
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-32">
              {/* Feedback Types */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {feedbackTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${type.color} flex items-center justify-center text-white mb-2`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                  </motion.button>
                ))}
              </div>

              {/* Feedback Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={feedbackTypes.find(t => t.id === selectedType)?.placeholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* AI Features Notice */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  How AI Helps
                </h3>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Instantly generates implementation plans</li>
                  <li>• Estimates development time and complexity</li>
                  <li>• Finds similar features to avoid duplicates</li>
                  <li>• Prioritizes based on user impact</li>
                </ul>
              </div>

              {/* Popular Requests */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Popular Requests
                </h3>
                <div className="space-y-3">
                  {popularRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 flex items-center gap-2">
                            {request.title}
                            {request.aiGenerated && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                AI Enhanced
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                          {request.status.replace('-', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleVote(request.id)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {request.votes} votes
                        </button>
                        {request.estimatedEffort && (
                          <span className="text-xs text-gray-500">
                            Est: {request.estimatedEffort}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-24 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Thanks for your feedback!</p>
                      <p className="text-sm text-green-100">Our AI is analyzing your suggestion...</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
              <motion.button
                onClick={handleSubmit}
                disabled={!feedback.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Feedback
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}