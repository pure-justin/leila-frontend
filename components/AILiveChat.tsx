'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Sparkles, Search, Calendar, Heart, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { userPreferencesService } from '@/lib/user-preferences-service';
import { getServiceById, COMPREHENSIVE_SERVICE_CATALOG } from '@/lib/comprehensive-services-catalog';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  time: string;
  suggestions?: string[];
  actions?: {
    type: 'book' | 'search' | 'viewProfile' | 'schedule';
    label: string;
    data?: any;
  }[];
}

export default function AILiveChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userContext, setUserContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationContext, setConversationContext] = useState<string[]>([]);

  useEffect(() => {
    // Load user context when chat opens
    if (isOpen && user) {
      loadUserContext();
    }
  }, [isOpen, user]);

  useEffect(() => {
    // Show personalized welcome message when chat opens
    if (isOpen && messages.length === 0) {
      const hour = new Date().getHours();
      let greeting = 'Good morning';
      if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
      else if (hour >= 17) greeting = 'Good evening';

      const welcomeMessage = user 
        ? `${greeting}, ${user.displayName?.split(' ')[0] || 'there'}! I'm your personal AI assistant. I can help you book services, answer questions about contractors, find the best deals, or just chat. What can I do for you today?`
        : `${greeting}! I'm your AI-powered assistant. I can help you find the perfect service, answer any questions, or just chat. How can I help you today?`;

      setMessages([{
        id: '1',
        text: welcomeMessage,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: user ? [
          'Book a cleaning service',
          'Check my upcoming bookings',
          'Find a plumber nearby',
          'Tell me about today\'s deals'
        ] : [
          'What services do you offer?',
          'How does Leila work?',
          'Show me popular services',
          'Help me sign up'
        ]
      }]);
    }
  }, [isOpen, messages.length, user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserContext = async () => {
    if (!user) return;

    try {
      // Load user preferences and history
      const preferences = await userPreferencesService.getUserPreferences(user.uid);
      const recentBookings = preferences?.bookedServices.slice(0, 5) || [];
      const favoriteServices = preferences?.favoriteServices || [];
      const viewHistory = preferences?.viewedServices.slice(0, 10) || [];

      // Load property information
      const savedProfiles = localStorage.getItem('userProfiles');
      const properties = savedProfiles ? JSON.parse(savedProfiles) : [];
      const currentPropertyId = localStorage.getItem('currentPropertyId');
      const currentProperty = properties.find((p: any) => p.id === currentPropertyId);

      setUserContext({
        userId: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        recentBookings,
        favoriteServices,
        viewHistory,
        properties,
        currentProperty,
        preferences: preferences?.servicePreferences
      });
    } catch (error) {
      console.error('Error loading user context:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    setIsTyping(true);

    // Keep only last 10 messages for context (to avoid token limits)
    const recentContext = [...conversationContext, message].slice(-10);
    setConversationContext(recentContext);

    try {
      // Call Gemini AI through Firebase Function
      const processChat = httpsCallable(functions, 'processAIChat');
      const result = await processChat({
        message: message,
        userContext: userContext,
        conversationHistory: recentContext,
        timestamp: new Date().toISOString()
      });

      const aiResponse = result.data as any;

      const responseMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse.response,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: aiResponse.suggestions,
        actions: aiResponse.actions
      };

      setMessages(prev => [...prev, responseMessage]);
      setConversationContext([...recentContext, aiResponse.response]);

    } catch (error) {
      console.error('Error processing chat:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: 'I apologize, but I\'m having trouble connecting right now. Let me try to help you anyway. What service are you looking for?',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'House Cleaning',
          'Plumbing Repair',
          'HVAC Service',
          'Electrical Work'
        ]
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    handleSend();
  };

  const handleActionClick = (action: any) => {
    // Handle different action types
    switch (action.type) {
      case 'book':
        // Navigate to booking with pre-filled data
        if (action.data?.serviceId) {
          window.location.href = `/services?book=${action.data.serviceId}`;
        }
        break;
      case 'search':
        // Navigate to search with query
        if (action.data?.query) {
          window.location.href = `/services?search=${encodeURIComponent(action.data.query)}`;
        }
        break;
      case 'viewProfile':
        // Navigate to user profile
        window.location.href = '/profile';
        break;
      case 'schedule':
        // Navigate to bookings
        window.location.href = '/bookings';
        break;
    }
  };

  return (
    <>
      {/* Chat Button with AI Sparkle */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <span className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden ${
              isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
            } transition-all duration-300`}
          >
            {/* Header with AI branding */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold">Your AI Assistant</h3>
                  <p className="text-xs opacity-90">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[420px] bg-gray-50">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            msg.sender === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                              : 'bg-white text-gray-800 shadow-sm'
                          }`}
                        >
                          {msg.sender === 'ai' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-600">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {msg.time}
                          </p>
                        </div>

                        {/* Suggestions */}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {msg.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left px-3 py-2 text-sm bg-white hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.actions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(action)}
                                className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                              >
                                {action.type === 'book' && <Calendar className="w-3 h-3" />}
                                {action.type === 'search' && <Search className="w-3 h-3" />}
                                {action.type === 'viewProfile' && <Home className="w-3 h-3" />}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-600 transition-colors"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isTyping}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    AI-powered by Google Gemini • Your personal assistant
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}