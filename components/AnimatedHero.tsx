'use client';

import { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Home, Wrench, Shield, Star, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const FloatingOrb = ({ delay = 0, size = 400, color = 'blue' }) => {
  const y = useMotionValue(0);
  const x = useMotionValue(0);
  const rotate = useTransform([x, y], ([latestX, latestY]) => {
    const xValue = typeof latestX === 'number' ? latestX : 0;
    const yValue = typeof latestY === 'number' ? latestY : 0;
    return xValue * 0.1 + yValue * 0.1;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      x.set(Math.sin(Date.now() * 0.001 + delay) * 50);
      y.set(Math.cos(Date.now() * 0.001 + delay) * 30);
    }, 50);
    return () => clearInterval(interval);
  }, [delay, x, y]);

  return (
    <motion.div
      className={`absolute rounded-full filter blur-3xl opacity-20`}
      style={{
        width: size,
        height: size,
        x,
        y,
        rotate,
        background: `radial-gradient(circle, ${color === 'blue' ? '#3B82F6' : '#A855F7'} 0%, transparent 70%)`
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

const AnimatedText = ({ text, className = '' }: { text: string, className?: string }) => {
  const words = text.split(' ');
  
  return (
    <span className={className}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-2">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              className="inline-block"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: wordIndex * 0.1 + charIndex * 0.05,
                ease: "easeOut"
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </span>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        animate={{ scale: isHovered ? 1.05 : 1 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-full"
      >
        <motion.div
          animate={{ rotate: isHovered ? 360 : 0 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center mb-4"
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl -z-10"
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
    </motion.div>
  );
};

export default function AnimatedHero() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) * 0.02,
        y: (e.clientY - window.innerHeight / 2) * 0.02
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBookService = () => {
    controls.start({
      scale: [1, 0.95, 1.05, 1],
      transition: { duration: 0.3 }
    });
    setTimeout(() => router.push('/book'), 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Animated background orbs */}
      <div className="absolute inset-0">
        <FloatingOrb delay={0} size={600} color="blue" />
        <FloatingOrb delay={2} size={400} color="purple" />
        <FloatingOrb delay={4} size={500} color="blue" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-white/5" />

      {/* Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
          }}
        >
          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Home className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AnimatedText text="Hey Leila," />
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              <AnimatedText text="Book My Service" />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            AI-powered home services at your command. Just speak, and we'll handle the rest.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <motion.button
              animate={controls}
              onClick={handleBookService}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Book a Service
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-200, 200] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>

            <motion.button
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Try Voice Command
              </span>
            </motion.button>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              icon={Wrench}
              title="Expert Contractors"
              description="Vetted professionals ready to handle any home service need"
              delay={1.4}
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Trusted"
              description="Protected payments and satisfaction guaranteed on every job"
              delay={1.6}
            />
            <FeatureCard
              icon={Star}
              title="5-Star Service"
              description="Join thousands of happy customers with our top-rated platform"
              delay={1.8}
            />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}