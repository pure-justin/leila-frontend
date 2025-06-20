'use client';

import { motion } from 'framer-motion';

interface GradientBackgroundProps {
  variant?: 'default' | 'mesh' | 'radial' | 'animated';
  className?: string;
  children?: React.ReactNode;
}

export default function GradientBackground({ 
  variant = 'default', 
  className = '', 
  children 
}: GradientBackgroundProps) {
  const gradients = {
    default: "bg-gradient-to-br from-purple-50 via-white to-indigo-50",
    mesh: `bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-white to-indigo-100`,
    radial: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-white to-indigo-50",
    animated: "bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50",
  };

  if (variant === 'animated') {
    return (
      <motion.div
        className={`${gradients[variant]} ${className}`}
        animate={{
          background: [
            "linear-gradient(to bottom right, #f3e8ff, #ffffff, #e0e7ff)",
            "linear-gradient(to bottom right, #e0e7ff, #ffffff, #f3e8ff)",
            "linear-gradient(to bottom right, #f3e8ff, #ffffff, #e0e7ff)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`${gradients[variant]} ${className}`}>
      {children}
    </div>
  );
}