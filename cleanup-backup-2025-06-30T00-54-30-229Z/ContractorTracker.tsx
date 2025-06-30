'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Phone, MessageSquare, Clock, Send, ChevronDown, ChevronUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'contractor';
  timestamp: Date;
  read: boolean;
}

interface ContractorTrackerProps {
  contractor: {
    id: string;
    name: string;
    phone: string;
    photo?: string;
    rating: number;
    currentLocation: { lat: number; lng: number };
  };
  customerLocation: { lat: number; lng: number };
  eta: number;
  onMessageSent?: (message: string) => void;
  onCall?: () => void;
}

export default function ContractorTracker({
  contractor,
  customerLocation,
  eta: initialEta,
  onMessageSent,
  onCall
}: ContractorTrackerProps) {
  const [currentEta, setCurrentEta] = useState(initialEta);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contractorLocation, setContractorLocation] = useState(contractor.currentLocation);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate real-time location updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate contractor moving towards customer
      setContractorLocation(prev => {
        const latDiff = customerLocation.lat - prev.lat;
        const lngDiff = customerLocation.lng - prev.lng;
        
        // Move 10% closer each update
        return {
          lat: prev.lat + latDiff * 0.1,
          lng: prev.lng + lngDiff * 0.1
        };
      });

      // Update ETA
      setCurrentEta(prev => Math.max(1, prev - 0.5));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [customerLocation]);

  // Simulate incoming messages
  useEffect(() => {
    const timeout = setTimeout(() => {
      const welcomeMessage: Message = {
        id: '1',
        text: `Hi! I'm ${contractor.name}, and I'm on my way to help you. I'll be there in about ${Math.round(currentEta)} minutes.`,
        sender: 'contractor',
        timestamp: new Date(),
        read: false
      };
      setMessages([welcomeMessage]);
      setUnreadCount(1);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [contractor.name, currentEta]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current);
      }
    };
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    onMessageSent?.(newMessage);

    // Clear any existing timeout
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
    }
    
    // Simulate contractor response
    responseTimeoutRef.current = setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Got it! Thanks for letting me know.',
        sender: 'contractor',
        timestamp: new Date(),
        read: false
      };
      setMessages(prev => [...prev, response]);
      if (!isMessagingOpen) {
        setUnreadCount(prev => prev + 1);
      }
      responseTimeoutRef.current = null;
    }, 2000);
  };

  const openMessaging = () => {
    setIsMessagingOpen(true);
    setUnreadCount(0);
    // Mark all messages as read
    setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-2xl rounded-t-3xl max-w-lg mx-auto"
    >
      {/* Map View (simplified) */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-t-3xl overflow-hidden">
        {/* Animated route line */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.line
            x1="20%"
            y1="80%"
            x2="80%"
            y2="20%"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Contractor marker */}
        <motion.div
          className="absolute"
          style={{
            left: '20%',
            top: '70%',
          }}
          animate={{
            left: ['20%', '80%'],
            top: ['80%', '20%'],
          }}
          transition={{ duration: 30, repeat: Infinity }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-purple-600 rounded-full opacity-30"
              animate={{ scale: [1, 2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-purple-600 text-white p-2 rounded-full">
              <Navigation className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Customer marker */}
        <div className="absolute" style={{ right: '20%', top: '20%' }}>
          <div className="bg-green-600 text-white p-2 rounded-full">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* ETA Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="font-semibold">{Math.round(currentEta)} min away</span>
          </div>
        </div>
      </div>

      {/* Contractor Info */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              {contractor.photo ? (
                <img src={contractor.photo} alt={contractor.name} className="w-full h-full rounded-full" />
              ) : (
                <User className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{contractor.name} is on the way</h3>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span>⭐ {contractor.rating}</span>
                <span>•</span>
                <span>ETA: {Math.round(currentEta)} min</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={onCall}
              className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Phone className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              onClick={() => isMessagingOpen ? setIsMessagingOpen(false) : openMessaging()}
              className="relative p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Messaging Section */}
      <AnimatePresence>
        {isMessagingOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 300 }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="h-[240px] overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-800 shadow'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}
                    >
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-600"
                />
                <motion.button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-purple-600 text-white p-2 rounded-full disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Handle */}
      <motion.button
        onClick={() => setIsMessagingOpen(!isMessagingOpen)}
        className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md"
        whileHover={{ scale: 1.1 }}
      >
        {isMessagingOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        )}
      </motion.button>
    </motion.div>
  );
}