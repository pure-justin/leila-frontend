'use client';

import { motion } from 'framer-motion';
import { Users, Sparkles } from 'lucide-react';

interface ScoreDisplayProps {
  userScore: number;
  leilaScore: number;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  className?: string;
}

export default function ScoreDisplay({ 
  userScore, 
  leilaScore, 
  size = 'medium', 
  showLabels = true,
  className = '' 
}: ScoreDisplayProps) {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* User Score */}
      <motion.div 
        className={`flex flex-col items-center p-4 rounded-xl border-2 ${getScoreBackground(userScore)}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Users className={`${iconSizes[size]} text-gray-600`} />
          {showLabels && <span className="text-sm font-medium text-gray-600">User Score</span>}
        </div>
        <div className={`${sizeClasses[size]} font-bold ${getScoreColor(userScore)}`}>
          {userScore}%
        </div>
      </motion.div>

      {/* Leila Score */}
      <motion.div 
        className={`flex flex-col items-center p-4 rounded-xl border-2 ${getScoreBackground(leilaScore)}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className={`${iconSizes[size]} text-purple-600`} />
          {showLabels && <span className="text-sm font-medium text-gray-600">Leila Score</span>}
        </div>
        <div className={`${sizeClasses[size]} font-bold ${getScoreColor(leilaScore)}`}>
          {leilaScore}%
        </div>
      </motion.div>
    </div>
  );
}

export function MiniScoreDisplay({ userScore, leilaScore }: { userScore: number; leilaScore: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4 text-gray-500" />
        <span className={`font-bold ${getScoreColor(userScore)}`}>{userScore}%</span>
      </div>
      <div className="flex items-center gap-1">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <span className={`font-bold ${getScoreColor(leilaScore)}`}>{leilaScore}%</span>
      </div>
    </div>
  );
}

export function ScoreMeter({ score, label, icon: Icon }: { score: number; label: string; icon: any }) {
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#22c55e';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className="w-6 h-6 text-gray-600 mb-1" />
        <span className="text-2xl font-bold">{score}%</span>
      </div>
      <span className="text-sm text-gray-600 mt-2">{label}</span>
    </div>
  );
}