/**
 * Proprietary Pricing Algorithm
 * This file contains sensitive business logic that will be obfuscated
 */

import { serverConfig } from '../config/secure-config';

// Proprietary constants (will be obfuscated)
const _BASE_RATE_MULTIPLIER = 1.35;
const _DEMAND_SURGE_FACTOR = 0.25;
const _QUALITY_SCORE_WEIGHT = 0.15;
const _DISTANCE_PENALTY_RATE = 0.08;
const _TIME_OF_DAY_MODIFIERS = {
  peak: 1.2,     // 7-9 AM, 5-7 PM
  standard: 1.0, // 9 AM - 5 PM
  evening: 1.1,  // 7 PM - 10 PM
  night: 1.3,    // 10 PM - 7 AM
  weekend: 1.15,
};

// Proprietary service complexity scores
const _SERVICE_COMPLEXITY = {
  'plumbing': { base: 85, skillFactor: 1.2 },
  'electrical': { base: 95, skillFactor: 1.3 },
  'hvac': { base: 120, skillFactor: 1.4 },
  'cleaning': { base: 45, skillFactor: 0.9 },
  'handyman': { base: 65, skillFactor: 1.0 },
  'painting': { base: 70, skillFactor: 1.1 },
  'landscaping': { base: 60, skillFactor: 0.95 },
  'moving': { base: 80, skillFactor: 1.15 },
};

/**
 * Calculate dynamic pricing based on multiple factors
 * This is our secret sauce - heavily obfuscated in production
 */
export function calculateDynamicPrice(params: {
  serviceType: string;
  estimatedDuration: number;
  distance: number;
  urgency: 'standard' | 'urgent' | 'emergency';
  contractorScore: number;
  demandLevel: number;
  timeSlot: Date;
}): {
  basePrice: number;
  finalPrice: number;
  breakdown: Record<string, number>;
} {
  const {
    serviceType,
    estimatedDuration,
    distance,
    urgency,
    contractorScore,
    demandLevel,
    timeSlot,
  } = params;

  // Get service complexity
  const complexity = _SERVICE_COMPLEXITY[serviceType as keyof typeof _SERVICE_COMPLEXITY] || 
    { base: 75, skillFactor: 1.0 };

  // Calculate base price using proprietary formula
  let basePrice = complexity.base * _BASE_RATE_MULTIPLIER;
  
  // Apply duration factor
  const durationHours = estimatedDuration / 60;
  basePrice *= Math.pow(durationHours, 0.85); // Non-linear scaling

  // Apply distance penalty
  const distancePenalty = distance * _DISTANCE_PENALTY_RATE;
  basePrice += distancePenalty;

  // Apply contractor quality bonus
  const qualityMultiplier = 1 + ((contractorScore - 3) * _QUALITY_SCORE_WEIGHT);
  basePrice *= qualityMultiplier;

  // Apply time of day modifier
  const hour = timeSlot.getHours();
  const dayOfWeek = timeSlot.getDay();
  let timeModifier = _TIME_OF_DAY_MODIFIERS.standard;
  
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    timeModifier = _TIME_OF_DAY_MODIFIERS.weekend;
  } else if (hour >= 22 || hour < 7) {
    timeModifier = _TIME_OF_DAY_MODIFIERS.night;
  } else if ((hour >= 7 && hour < 9) || (hour >= 17 && hour < 19)) {
    timeModifier = _TIME_OF_DAY_MODIFIERS.peak;
  } else if (hour >= 19 && hour < 22) {
    timeModifier = _TIME_OF_DAY_MODIFIERS.evening;
  }
  
  basePrice *= timeModifier;

  // Apply urgency multiplier
  const urgencyMultipliers = {
    standard: 1.0,
    urgent: 1.5,
    emergency: 2.2,
  };
  basePrice *= urgencyMultipliers[urgency];

  // Apply demand surge pricing
  const demandMultiplier = 1 + (demandLevel * _DEMAND_SURGE_FACTOR);
  const finalPrice = basePrice * demandMultiplier;

  // Apply skill factor
  const skillAdjustedPrice = finalPrice * complexity.skillFactor;

  // Round to nearest $5
  const roundedPrice = Math.round(skillAdjustedPrice / 5) * 5;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    finalPrice: roundedPrice,
    breakdown: {
      base: complexity.base,
      duration: durationHours * complexity.base * 0.6,
      distance: distancePenalty,
      quality: (qualityMultiplier - 1) * basePrice,
      timeOfDay: (timeModifier - 1) * basePrice,
      urgency: (urgencyMultipliers[urgency] - 1) * basePrice,
      demand: (demandMultiplier - 1) * basePrice,
      skill: (complexity.skillFactor - 1) * finalPrice,
    },
  };
}

/**
 * Calculate contractor payout using proprietary algorithm
 */
export function calculateContractorPayout(params: {
  totalPrice: number;
  contractorTier: string;
  performanceScore: number;
  completionTime: number;
  customerRating: number;
}): {
  payoutAmount: number;
  platformFee: number;
  bonuses: Record<string, number>;
} {
  const {
    totalPrice,
    contractorTier,
    performanceScore,
    completionTime,
    customerRating,
  } = params;

  // Base platform fee by tier (proprietary rates)
  const tierFees = {
    starter: 0.30,
    growing: 0.25,
    established: 0.20,
    professional: 0.15,
    enterprise: 0.10,
  };

  const baseFeeRate = tierFees[contractorTier as keyof typeof tierFees] || 0.25;
  let platformFee = totalPrice * baseFeeRate;

  // Performance bonuses (secret formula)
  const bonuses: Record<string, number> = {};
  
  // Excellence bonus
  if (performanceScore > 0.95) {
    bonuses.excellence = totalPrice * 0.05;
  }
  
  // Speed bonus
  const expectedTime = 120; // baseline
  if (completionTime < expectedTime * 0.8) {
    bonuses.speed = totalPrice * 0.03;
  }
  
  // Customer satisfaction bonus
  if (customerRating >= 4.8) {
    bonuses.satisfaction = totalPrice * 0.04;
  }

  // Calculate total bonus
  const totalBonus = Object.values(bonuses).reduce((sum, bonus) => sum + bonus, 0);
  
  // Adjust platform fee based on performance
  if (performanceScore > 0.9) {
    platformFee *= 0.9; // 10% platform fee reduction for top performers
  }

  const payoutAmount = totalPrice - platformFee + totalBonus;

  return {
    payoutAmount: Math.round(payoutAmount * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    bonuses,
  };
}

/**
 * Predict optimal pricing using ML-like algorithm
 * This contains our most valuable IP
 */
export function _predictOptimalPrice(historicalData: Array<{
  price: number;
  conversionRate: number;
  profitMargin: number;
}>): number {
  // Proprietary optimization algorithm
  const weights = { conversion: 0.4, profit: 0.6 };
  
  let optimalPrice = 0;
  let maxScore = 0;
  
  historicalData.forEach(data => {
    const score = (data.conversionRate * weights.conversion) + 
                  (data.profitMargin * weights.profit);
    
    if (score > maxScore) {
      maxScore = score;
      optimalPrice = data.price;
    }
  });
  
  // Apply secret adjustment factors
  const marketAdjustment = 1.08;
  const competitionFactor = 0.95;
  
  return optimalPrice * marketAdjustment * competitionFactor;
}