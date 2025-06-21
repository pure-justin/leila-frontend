import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
let _stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!_stripePromise) {
    _stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
    );
  }
  return _stripePromise;
};

// Export stripePromise for direct use
export const stripePromise = getStripe();

// Stripe configuration
export const STRIPE_CONFIG = {
  isLive: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('pk_live') || false,
  currency: 'usd',
};

// Stripe Elements appearance
export const STRIPE_ELEMENTS_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary: '#7c3aed',
    colorBackground: '#ffffff',
    colorText: '#1f2937',
    colorDanger: '#ef4444',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};

// Tiered Platform Fee Configuration Based on Monthly Sales Volume
export interface CommissionTier {
  name: string;
  monthlyVolumeMin: number;
  monthlyVolumeMax: number | null;
  feePercentage: number;
  description: string;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  {
    name: 'Starter',
    monthlyVolumeMin: 0,
    monthlyVolumeMax: 1000,
    feePercentage: 0.30, // 30%
    description: 'New contractors getting started'
  },
  {
    name: 'Growing',
    monthlyVolumeMin: 1001,
    monthlyVolumeMax: 5000,
    feePercentage: 0.25, // 25%
    description: 'Building your client base'
  },
  {
    name: 'Established',
    monthlyVolumeMin: 5001,
    monthlyVolumeMax: 15000,
    feePercentage: 0.20, // 20%
    description: 'Steady business growth'
  },
  {
    name: 'Professional',
    monthlyVolumeMin: 15001,
    monthlyVolumeMax: 50000,
    feePercentage: 0.15, // 15%
    description: 'High-volume contractor'
  },
  {
    name: 'Enterprise',
    monthlyVolumeMin: 50001,
    monthlyVolumeMax: null,
    feePercentage: 0.10, // 10%
    description: 'Top-tier contractor'
  }
];

export const MINIMUM_PLATFORM_FEE = 1.00; // $1 minimum fee

// Function to calculate commission fee based on contractor's monthly volume
export function calculateCommissionFee(monthlyVolume: number): CommissionTier {
  const tier = COMMISSION_TIERS.find(tier => 
    monthlyVolume >= tier.monthlyVolumeMin && 
    (tier.monthlyVolumeMax === null || monthlyVolume <= tier.monthlyVolumeMax)
  );
  
  return tier || COMMISSION_TIERS[0]; // Default to starter tier
}

// Function to calculate platform fee for a specific transaction
export function calculatePlatformFee(amount: number, contractorMonthlyVolume: number): {
  feeAmount: number;
  feePercentage: number;
  tierName: string;
  netAmount: number;
} {
  const tier = calculateCommissionFee(contractorMonthlyVolume);
  const calculatedFee = amount * tier.feePercentage;
  const feeAmount = Math.max(calculatedFee, MINIMUM_PLATFORM_FEE);
  
  return {
    feeAmount,
    feePercentage: tier.feePercentage,
    tierName: tier.name,
    netAmount: amount - feeAmount
  };
}

// Stripe Connect configuration
export const STRIPE_CONNECT_CONFIG = {
  // Account type for contractors
  accountType: 'express' as const,
  
  // Capabilities to request
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  
  // Business type
  business_type: 'individual' as const,
  
  // Platform name for branding
  platform_name: 'Leila Home Services',
};

// Payment hold period (funds held until service completion + 1 day)
export const ESCROW_HOLD_DAYS = 1;

// Supported payment methods
export const SUPPORTED_PAYMENT_METHODS = [
  'card',
  'apple_pay',
  'google_pay',
];

// Currency
export const DEFAULT_CURRENCY = 'usd';

// Stripe webhook events we handle
export const STRIPE_WEBHOOK_EVENTS = {
  // Payment events
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
  
  // Connect account events
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_APPLICATION_AUTHORIZED: 'account.application.authorized',
  ACCOUNT_APPLICATION_DEAUTHORIZED: 'account.application.deauthorized',
  
  // Transfer events
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_PAID: 'transfer.paid',
  TRANSFER_FAILED: 'transfer.failed',
  
  // Payout events
  PAYOUT_CREATED: 'payout.created',
  PAYOUT_PAID: 'payout.paid',
  PAYOUT_FAILED: 'payout.failed',
  
  // Refund events
  CHARGE_REFUNDED: 'charge.refunded',
};