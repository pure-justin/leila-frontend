'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, X } from 'lucide-react';

interface ModernSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export default function ModernSearchBar({ value, onChange, onSearch, placeholder = "What service do you need?" }: ModernSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleClear = () => {
    onChange('');
  };
  
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`relative bg-white/95 backdrop-blur-xl rounded-2xl transition-all duration-300 ${
          isFocused ? 'shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/50' : 'shadow-xl'
        }`}
        animate={{
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4 p-4 md:p-5">
          {/* Search Icon with Animation */}
          <motion.div
            animate={{ 
              rotate: isFocused ? [0, -10, 10, -10, 0] : 0,
              scale: isFocused ? 1.1 : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <Search className="w-6 h-6 text-purple-600" />
          </motion.div>
          
          {/* Input Field */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
            placeholder={placeholder}
            className="flex-1 text-lg md:text-xl font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          />
          
          {/* Clear Button */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            )}
          </AnimatePresence>
          
          {/* Search Button */}
          <motion.button
            onClick={onSearch}
            className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ x: '100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Button Content */}
            <span className="relative flex items-center gap-2">
              <span className="hidden sm:inline">Search</span>
              <Search className="w-5 h-5 sm:hidden" />
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Sparkles className="w-4 h-4 hidden sm:inline" />
              </motion.div>
            </span>
          </motion.button>
        </div>
        
        {/* Animated Border Gradient */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            background: isFocused
              ? [
                  'linear-gradient(45deg, transparent, transparent)',
                  'linear-gradient(45deg, #9333ea, #6366f1)',
                  'linear-gradient(225deg, #9333ea, #6366f1)',
                  'linear-gradient(45deg, transparent, transparent)',
                ]
              : 'linear-gradient(45deg, transparent, transparent)',
          }}
          transition={{
            duration: 2,
            repeat: isFocused ? Infinity : 0,
            ease: 'linear',
          }}
          style={{
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      </motion.div>
      
      {/* Focus Glow Effect */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 -z-10 blur-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-20 rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}