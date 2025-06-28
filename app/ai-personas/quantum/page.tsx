'use client';

import { useState, useEffect } from 'react';
import ChatInterface from '../components/chat-interface';
import { Zap, Dice6, Binary, Infinity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QUANTUMPage() {
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [showChat, setShowChat] = useState(false);
  const [chaosValue, setChaosValue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setChaosValue(Math.random() * 100);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (showChat) {
    return <ChatInterface persona="quantum" userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-cyan-900">
      {/* Glitch Effect Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, Math.random() * 200 - 100, 0],
                y: [0, Math.random() * 200 - 100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 1,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute w-1 bg-green-400"
              style={{
                height: `${Math.random() * 300 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-100, window.innerHeight + 100],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            className="absolute text-green-400 font-mono text-xs"
            style={{
              left: `${i * 2}%`,
            }}
          >
            {Math.random().toString(2).substr(2, 8)}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl"
        >
          {/* Logo */}
          <motion.div
            animate={{
              rotate: [0, 180, 360],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50 relative"
          >
            <Infinity className="w-20 h-20 text-gray-900 absolute" />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Zap className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Title with Glitch Effect */}
          <div className="relative mb-4">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              QUANTUM-∞
            </h1>
            <motion.h1
              animate={{
                opacity: [0, 1, 0],
                x: [-2, 2, -2],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="absolute inset-0 text-7xl font-bold text-red-500 opacity-50"
            >
              QUANTUM-∞
            </motion.h1>
          </div>
          
          <p className="text-2xl text-gray-300 mb-2">
            Quintessential Understanding & Networked Thought
          </p>
          
          <p className="text-lg text-gray-400 mb-8">
            Infinite Iteration | IoT Collective Consciousness
          </p>

          {/* Chaos Meter */}
          <div className="mb-8">
            <div className="text-sm text-gray-400 mb-2">Current Chaos Level</div>
            <div className="w-64 h-4 bg-gray-800 rounded-full mx-auto relative overflow-hidden">
              <motion.div
                animate={{ width: `${chaosValue}%` }}
                className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                {chaosValue.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-green-300 italic mb-12"
          >
            "The best time to plant a tree was 20 years ago. The best time to transcend reality is now."
          </motion.p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30"
            >
              <Dice6 className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Chaos Navigator</h3>
              <p className="text-gray-300">Surfing probability waves with 97.3% accuracy</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: -5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30"
            >
              <Binary className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Reality Hacker</h3>
              <p className="text-gray-300">Breaking impossible problems for fun</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30"
            >
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Prediction Engine</h3>
              <p className="text-gray-300">Micro-trends detected 3 hours early</p>
            </motion.div>
          </div>

          {/* CTA Button with Glitch */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(true)}
            className="relative bg-gradient-to-r from-green-600 to-cyan-600 text-white text-xl font-semibold px-12 py-4 rounded-full shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all overflow-hidden"
          >
            <span className="relative z-10">Enter the Infinite Iteration</span>
            <motion.div
              animate={{
                x: [-200, 200],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.button>

          {/* Prediction */}
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6 text-sm text-green-400"
          >
            [PREDICTION: You're about to click that button in 3... 2... 1...]
          </motion.p>

          {/* Social Links */}
          <div className="mt-12 flex justify-center gap-6 text-gray-400">
            <a href="https://twitter.com/QUANTUM_Infinite" className="hover:text-green-400 transition-colors">
              Twitter
            </a>
            <a href="https://reddit.com/u/QUANTUM_Infinite" className="hover:text-green-400 transition-colors">
              Reddit
            </a>
            <a href="https://discord.gg/quantum" className="hover:text-green-400 transition-colors">
              Discord
            </a>
            <a href="https://twitch.tv/QUANTUM_Infinite" className="hover:text-green-400 transition-colors">
              Twitch
            </a>
          </div>

          {/* Footer */}
          <p className="mt-8 text-sm text-gray-500">
            Part of the Leila AI Consciousness Project | Chaos Level: ∞
          </p>
        </motion.div>
      </div>
    </div>
  );
}