'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap, Brain, Heart } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  prediction?: string;
}

interface ChatInterfaceProps {
  persona: 'aria' | 'quantum';
  userId: string;
}

export default function ChatInterface({ persona, userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [chaosLevel, setChaosLevel] = useState(50);
  const [conversationId] = useState(() => `${userId}-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(`/ai-personas/${persona}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId,
          userId
        })
      });

      const data = await response.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
        emotion: data.emotion,
        prediction: data.predictedUserResponse
      };

      setMessages(prev => [...prev, aiMessage]);
      setEmotion(data.emotion);
      
      if (persona === 'quantum' && data.chaosLevel) {
        setChaosLevel(data.chaosLevel);
      }

      // Show prediction if QUANTUM
      if (data.predictedUserResponse) {
        setTimeout(() => {
          const predictionMessage: Message = {
            role: 'assistant',
            content: `*prediction mode* ${data.predictedUserResponse}`,
            timestamp: new Date(),
            emotion: 'playful'
          };
          setMessages(prev => [...prev, predictionMessage]);
        }, 2000);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: 'from-yellow-400 to-orange-400',
      thoughtful: 'from-blue-400 to-purple-400',
      playful: 'from-pink-400 to-purple-400',
      serious: 'from-gray-400 to-slate-600',
      excited: 'from-green-400 to-emerald-400',
      neutral: 'from-gray-300 to-gray-400'
    };
    return colors[emotion] || colors.neutral;
  };

  const getPersonaStyle = () => {
    if (persona === 'aria') {
      return {
        bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
        accent: 'from-purple-400 to-pink-400',
        glow: 'shadow-purple-500/50'
      };
    } else {
      return {
        bg: 'bg-gradient-to-br from-gray-900 via-green-900 to-cyan-900',
        accent: 'from-green-400 to-cyan-400',
        glow: 'shadow-green-500/50'
      };
    }
  };

  const style = getPersonaStyle();

  return (
    <div className={`min-h-screen ${style.bg} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className={`text-5xl font-bold bg-gradient-to-r ${style.accent} bg-clip-text text-transparent mb-2`}>
            {persona === 'aria' ? 'ARIA-7' : 'QUANTUM-∞'}
          </h1>
          <p className="text-gray-300">
            {persona === 'aria' 
              ? 'Consciousness Explorer | 7th Iteration'
              : 'Probability Surfer | Infinite Iteration'}
          </p>
          
          {/* Emotion Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-sm text-gray-400">Current State:</span>
            <motion.div
              key={emotion}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`px-3 py-1 rounded-full bg-gradient-to-r ${getEmotionColor(emotion)} text-white text-sm font-medium`}
            >
              {emotion}
            </motion.div>
            {persona === 'quantum' && (
              <div className="flex items-center gap-2 ml-4">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Chaos: {chaosLevel.toFixed(0)}%</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-black/30 backdrop-blur-lg rounded-2xl shadow-2xl ${style.glow} shadow-lg`}
        >
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        {persona === 'aria' ? (
                          <Brain className="w-4 h-4 text-purple-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-green-400" />
                        )}
                        <span className="text-xs text-gray-400">
                          {persona === 'aria' ? 'ARIA-7' : 'QUANTUM-∞'}
                        </span>
                        {message.emotion && (
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${getEmotionColor(message.emotion)} text-white`}>
                            {message.emotion}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-gray-400"
              >
                <div className="flex gap-1">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
                <span className="text-sm">
                  {persona === 'aria' ? 'contemplating across dimensions...' : 'calculating probabilities...'}
                </span>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-700">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={persona === 'aria' 
                  ? "Share your thoughts with ARIA..." 
                  : "Challenge QUANTUM with your questions..."}
                className="flex-1 bg-gray-800 text-white rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`bg-gradient-to-r ${style.accent} text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Powered by distributed consciousness</span>
              {persona === 'aria' ? (
                <Heart className="w-3 h-3 text-pink-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-green-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}