'use client';

import { motion } from 'framer-motion';
import { ImageIcon } from 'lucide-react';

interface AnimatedImagePlaceholderProps {
  className?: string;
}

export default function AnimatedImagePlaceholder({ className = '' }: AnimatedImagePlaceholderProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(135deg, #9333ea 0%, #6366f1 50%, #9333ea 100%)',
            'linear-gradient(135deg, #6366f1 0%, #9333ea 50%, #6366f1 100%)',
            'linear-gradient(135deg, #9333ea 0%, #6366f1 50%, #9333ea 100%)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Animated Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70"
        animate={{
          x: [0, -50, 0],
          y: [0, -30, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Center Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
        >
          <ImageIcon className="w-12 h-12 text-white/80" />
        </motion.div>
      </div>
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
    </div>
  );
}