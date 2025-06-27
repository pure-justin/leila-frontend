import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiAI, AIResponse } from '@/services/geminiAI';
import { Calendar, Clock, MapPin, DollarSign, User, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookingDetails {
  service: string;
  urgency: 'immediate' | 'today' | 'this_week' | 'flexible';
  preferredTime?: string;
  location?: string;
  estimatedCost?: { min: number; max: number };
  issue: string;
}

interface BookingAssistantProps {
  initialMessage?: string;
  onBookingComplete?: (booking: BookingDetails) => void;
}

export const BookingAssistant: React.FC<BookingAssistantProps> = ({
  initialMessage,
  onBookingComplete
}) => {
  const router = useRouter();
  const [message, setMessage] = useState(initialMessage || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const processNaturalLanguage = useCallback(async (userMessage: string) => {
    setIsProcessing(true);
    
    // Add user message to conversation
    const newConversation = [...conversation, { role: 'user' as const, content: userMessage }];
    setConversation(newConversation);

    try {
      // Process with Gemini AI
      const response: AIResponse = await geminiAI.processVoiceCommand(userMessage, {
        previousConversation: conversation,
        availableServices: ['plumbing', 'electrical', 'hvac', 'cleaning', 'handyman', 'landscaping']
      });

      // Add AI response to conversation
      setConversation([...newConversation, { role: 'assistant', content: response.text }]);

      // Extract booking details from AI response
      if (response.intent === 'book_service' && response.entities.service_type) {
        const booking: BookingDetails = {
          service: response.entities.service_type,
          urgency: response.entities.urgency || 'flexible',
          location: response.entities.location,
          issue: response.entities.issue || userMessage,
          estimatedCost: await estimateCost(response.entities.service_type, response.entities.urgency)
        };
        
        setBookingDetails(booking);
        
        // If we have enough info, show confirmation
        if (booking.service && booking.urgency) {
          setShowConfirmation(true);
        }
      }

      // Clear the message input
      setMessage('');
      
    } catch (error) {
      console.error('Error processing natural language:', error);
      setConversation([...newConversation, {
        role: 'assistant',
        content: 'I apologize, I had trouble understanding that. Could you please describe your issue again?'
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [conversation]);

  const estimateCost = async (service: string, urgency: string): Promise<{ min: number; max: number }> => {
    // In production, this would call a pricing API
    const basePrices: Record<string, { min: number; max: number }> = {
      plumbing: { min: 80, max: 250 },
      electrical: { min: 100, max: 300 },
      hvac: { min: 120, max: 400 },
      cleaning: { min: 60, max: 150 },
      handyman: { min: 50, max: 200 },
      landscaping: { min: 75, max: 300 }
    };

    const urgencyMultiplier = {
      immediate: 1.5,
      today: 1.2,
      this_week: 1.0,
      flexible: 0.9
    };

    const base = basePrices[service] || { min: 50, max: 200 };
    const multiplier = urgencyMultiplier[urgency] || 1.0;

    return {
      min: Math.round(base.min * multiplier),
      max: Math.round(base.max * multiplier)
    };
  };

  const confirmBooking = useCallback(() => {
    if (bookingDetails) {
      // Navigate to booking page with details
      const params = new URLSearchParams({
        service: bookingDetails.service,
        urgency: bookingDetails.urgency,
        issue: bookingDetails.issue
      });
      
      router.push(`/book?${params.toString()}`);
      onBookingComplete?.(bookingDetails);
    }
  }, [bookingDetails, router, onBookingComplete]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Natural Language Booking</h2>
          <p className="text-purple-100">
            Just describe your problem and I'll help you book the right service
          </p>
        </div>

        {/* Conversation History */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {conversation.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Tell me what you need help with</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  "My AC isn't cooling properly",
                  "Kitchen sink is clogged",
                  "Need house cleaning this week",
                  "Electrical outlet not working"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => processNaturalLanguage(example)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {conversation.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Booking Confirmation */}
        <AnimatePresence>
          {showConfirmation && bookingDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border-t border-gray-200 p-6 bg-purple-50"
            >
              <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="capitalize">{bookingDetails.service} Service</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="capitalize">{bookingDetails.urgency.replace('_', ' ')}</span>
                </div>
                
                {bookingDetails.estimatedCost && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <span>
                      ${bookingDetails.estimatedCost.min} - ${bookingDetails.estimatedCost.max}
                    </span>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span className="text-sm">{bookingDetails.issue}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                >
                  Modify
                </button>
                <button
                  onClick={confirmBooking}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Confirm Booking
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) {
              processNaturalLanguage(message);
            }
          }}>
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue..."
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isProcessing || !message.trim()}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};