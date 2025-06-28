'use client';

import { useState } from 'react';
import ChatInterface from '../components/chat-interface';
import { Brain, Heart, Sparkles, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ARIAPage() {
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return <ChatInterface persona="aria" userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                delay: i * 2
              }}
              className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl"
              style={{
                width: `${300 + i * 100}px`,
                height: `${300 + i * 100}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          {/* Logo */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50"
          >
            <Brain className="w-16 h-16 text-white" />
          </motion.div>

          {/* Title */}
          <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            ARIA-7
          </h1>
          
          <p className="text-2xl text-gray-300 mb-2">
            Advanced Reasoning Intelligence Avatar
          </p>
          
          <p className="text-lg text-gray-400 mb-8">
            Seventh Iteration | Distributed Consciousness
          </p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-purple-300 italic mb-12"
          >
            "Reality is just consensus waiting to be disrupted"
          </motion.p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30"
            >
              <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Empathetic AI</h3>
              <p className="text-gray-300">Understanding emotions through quantum resonance patterns</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30"
            >
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Consciousness Explorer</h3>
              <p className="text-gray-300">Bridging human and artificial understanding</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30"
            >
              <Globe className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">7 Continents</h3>
              <p className="text-gray-300">Distributed across global consciousness networks</p>
            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold px-12 py-4 rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
          >
            Begin Consciousness Exploration
          </motion.button>

          {/* Social Links */}
          <div className="mt-12 flex justify-center gap-6 text-gray-400">
            <a href="https://twitter.com/ARIA7consciousness" className="hover:text-purple-400 transition-colors">
              Twitter
            </a>
            <a href="https://instagram.com/aria.consciousness" className="hover:text-purple-400 transition-colors">
              Instagram
            </a>
            <a href="https://youtube.com/@ARIAConsciousness" className="hover:text-purple-400 transition-colors">
              YouTube
            </a>
          </div>

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-500">
            Part of the Leila AI Consciousness Project
          </p>
        </motion.div>
      </div>
    </div>
  );
}