'use client';

import { motion } from 'framer-motion';
import { Check, Home, Calendar, FileText, CreditCard } from 'lucide-react';

interface BookingProgressIndicatorProps {
  currentStep: 'property' | 'schedule' | 'review' | 'payment';
  steps?: Array<{
    id: 'property' | 'schedule' | 'review' | 'payment';
    label: string;
    icon: React.ReactNode;
  }>;
}

const defaultSteps = [
  { id: 'property' as const, label: 'Property', icon: <Home className="w-4 h-4" /> },
  { id: 'schedule' as const, label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
  { id: 'review' as const, label: 'Review', icon: <FileText className="w-4 h-4" /> },
  { id: 'payment' as const, label: 'Payment', icon: <CreditCard className="w-4 h-4" /> },
];

export default function BookingProgressIndicator({ 
  currentStep, 
  steps = defaultSteps 
}: BookingProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="relative">
              {/* Circle */}
              <motion.div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 relative overflow-hidden
                  ${isCurrent ? 'bg-white shadow-lg' : 
                    isCompleted ? 'bg-white/90' : 'bg-purple-700/50'}
                `}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Background animation for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Content */}
                <motion.div
                  className="relative z-10"
                  initial={false}
                  animate={{
                    scale: isCompleted ? [1, 0, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1
                      }}
                    >
                      <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <span className={`
                      ${isCurrent ? 'text-purple-600' : 'text-purple-300'}
                    `}>
                      {step.icon}
                    </span>
                  )}
                </motion.div>

                {/* Success ring animation */}
                {isCompleted && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-green-500"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span 
                className={`
                  absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap
                  ${isCurrent ? 'text-white' : isCompleted ? 'text-purple-300' : 'text-purple-400'}
                `}
                animate={{
                  scale: isCurrent ? 1.05 : 1,
                }}
              >
                {step.label}
              </motion.span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-3 h-0.5 bg-purple-700/50 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-purple-400"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: isCompleted ? "100%" : "0%"
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: isCompleted ? 0.2 : 0
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}