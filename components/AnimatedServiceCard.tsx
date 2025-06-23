'use client';

import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Service } from '@/lib/types/firestore-models';
import { ServiceImage } from './ServiceImage';
import { Clock, DollarSign, Star, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedServiceCardProps {
  service: Service;
  onClick?: () => void;
  index?: number;
}

export default function AnimatedServiceCard({ service, onClick, index = 0 }: AnimatedServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  const handleHover = () => {
    setIsHovered(true);
    controls.start({
      scale: 1.02,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    });
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    controls.start({
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    });
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const glowVariants = {
    initial: { opacity: 0 },
    hover: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const contentVariants = {
    initial: { y: 0 },
    hover: { 
      y: -5,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onHoverStart={handleHover}
      onHoverEnd={handleHoverEnd}
      onClick={onClick}
      className="relative cursor-pointer group"
      style={{ perspective: 1000 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl blur-xl"
        variants={glowVariants}
        initial="initial"
        animate={isHovered ? "hover" : "initial"}
      />

      <motion.div
        animate={controls}
        className={cn(
          "relative bg-white rounded-2xl shadow-lg overflow-hidden",
          "border border-gray-100 hover:border-gray-200",
          "transform-gpu transition-all duration-300"
        )}
      >
        {/* Popular badge */}
        {service.popular && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="absolute top-4 right-4 z-10"
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              Popular
            </div>
          </motion.div>
        )}

        {/* Image with parallax effect */}
        <div className="relative h-48 overflow-hidden">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <ServiceImage
              serviceName={service.name}
              category={service.category}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
          
          {/* Price tag */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="absolute bottom-4 left-4"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-bold text-lg text-gray-900">
                  {service.priceRange ? 
                    `${service.priceRange.min}-${service.priceRange.max}` : 
                    service.basePrice
                  }
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <motion.div 
          className="p-6"
          variants={contentVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {service.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {service.description}
          </p>

          {/* Service details */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{service.estimatedDuration} min</span>
            </div>
            
            {service.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{service.rating}</span>
              </div>
            )}
          </div>

          {/* Book now button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
              Book Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)',
            transform: 'translateX(-100%)'
          }}
          animate={isHovered ? { transform: 'translateX(100%)' } : {}}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}