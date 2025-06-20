'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface AnimatedLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export default function AnimatedLogo({ size = 80, animate = true, className = '' }: AnimatedLogoProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={animate ? { scale: 0, rotate: -180 } : {}}
      animate={animate ? { scale: 1, rotate: 0 } : {}}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        duration: 0.8,
      }}
      whileHover={animate ? {
        scale: 1.1,
        rotate: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-indigo-600 opacity-20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ width: size * 1.5, height: size * 1.5, top: -size * 0.25, left: -size * 0.25 }}
      />
      
      {/* Logo */}
      <Image
        src="/leila-logo.png"
        alt="Leila"
        width={size}
        height={size}
        className="relative z-10"
        priority
      />
      
      {/* Sparkle effects */}
      {animate && (
        <>
          <motion.div
            className="absolute top-0 right-0 w-2 h-2 bg-purple-400 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-2 h-2 bg-indigo-400 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
            }}
          />
          <motion.div
            className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-purple-300 rounded-full"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5,
            }}
          />
        </>
      )}
    </motion.div>
  );
}