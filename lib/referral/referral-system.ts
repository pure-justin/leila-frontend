// Referral Program Structure - Based on successful marketplace models

export interface ReferralProgram {
  // User Referrals (Customer to Customer)
  userReferral: {
    referrerReward: number; // $20 credit after referee's first booking
    refereeDiscount: number; // $20 off first service
    validityDays: number; // 90 days to use
    minimumBookingAmount: number; // $100 minimum service
  };

  // Contractor Referrals (Contractor to Contractor)
  contractorReferral: {
    referrerBonus: number; // $500 after referee completes 10 jobs
    refereeBonus: number; // $100 after completing first job
    milestoneBonuses: {
      jobs: number;
      bonus: number;
    }[];
  };

  // Cross Referrals (User refers Contractor or vice versa)
  crossReferral: {
    userToContractor: {
      userReward: number; // $50 when contractor completes 5 jobs
      contractorBonus: number; // $100 sign-on bonus
    };
    contractorToUser: {
      contractorReward: number; // $10 per user who books
      userDiscount: number; // 15% off first service
    };
  };
}

export const REFERRAL_TIERS = {
  bronze: {
    referralsNeeded: 3,
    perks: ['5% bonus on all referral rewards'],
    color: '#CD7F32'
  },
  silver: {
    referralsNeeded: 10,
    perks: ['10% bonus on all referral rewards', 'Priority support'],
    color: '#C0C0C0'
  },
  gold: {
    referralsNeeded: 25,
    perks: ['20% bonus on all referral rewards', 'VIP support', 'Early access to features'],
    color: '#FFD700'
  },
  platinum: {
    referralsNeeded: 50,
    perks: ['30% bonus on all referral rewards', 'Personal account manager', 'Custom referral codes'],
    color: '#E5E4E2'
  }
};

export interface ReferralCode {
  code: string;
  ownerId: string;
  ownerType: 'user' | 'contractor';
  created: Date;
  uses: number;
  maxUses?: number;
  expiresAt?: Date;
  customReward?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}

export interface ReferralTracking {
  referralId: string;
  referrerId: string;
  refereeId: string;
  type: 'user' | 'contractor' | 'cross';
  status: 'pending' | 'qualified' | 'paid' | 'expired';
  createdAt: Date;
  qualifiedAt?: Date;
  paidAt?: Date;
  amount: number;
  milestones: {
    requirement: string;
    completed: boolean;
    completedAt?: Date;
  }[];
}

export class ReferralManager {
  private static readonly DEFAULT_PROGRAM: ReferralProgram = {
    userReferral: {
      referrerReward: 20,
      refereeDiscount: 20,
      validityDays: 90,
      minimumBookingAmount: 100
    },
    contractorReferral: {
      referrerBonus: 500,
      refereeBonus: 100,
      milestoneBonuses: [
        { jobs: 10, bonus: 100 },
        { jobs: 25, bonus: 250 },
        { jobs: 50, bonus: 500 },
        { jobs: 100, bonus: 1000 }
      ]
    },
    crossReferral: {
      userToContractor: {
        userReward: 50,
        contractorBonus: 100
      },
      contractorToUser: {
        contractorReward: 10,
        userDiscount: 15
      }
    }
  };

  static generateReferralCode(userId: string, type: 'user' | 'contractor'): string {
    const prefix = type === 'user' ? 'U' : 'C';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${random}`;
  }

  static calculateReferralTier(referralCount: number): string {
    if (referralCount >= 50) return 'platinum';
    if (referralCount >= 25) return 'gold';
    if (referralCount >= 10) return 'silver';
    if (referralCount >= 3) return 'bronze';
    return 'none';
  }

  static calculateTierBonus(baseAmount: number, tier: string): number {
    const bonuses: Record<string, number> = {
      bronze: 0.05,
      silver: 0.10,
      gold: 0.20,
      platinum: 0.30
    };
    return baseAmount * (1 + (bonuses[tier] || 0));
  }

  static validateReferralCode(code: ReferralCode): { valid: boolean; reason?: string } {
    // Check expiration
    if (code.expiresAt && new Date() > code.expiresAt) {
      return { valid: false, reason: 'Code has expired' };
    }

    // Check usage limit
    if (code.maxUses && code.uses >= code.maxUses) {
      return { valid: false, reason: 'Code has reached maximum uses' };
    }

    return { valid: true };
  }

  static calculateReferralReward(
    tracking: ReferralTracking,
    program: ReferralProgram = this.DEFAULT_PROGRAM
  ): number {
    switch (tracking.type) {
      case 'user':
        return program.userReferral.referrerReward;
      
      case 'contractor':
        // Check milestones for contractor referrals
        const completedMilestones = tracking.milestones.filter(m => m.completed).length;
        const milestone = program.contractorReferral.milestoneBonuses[completedMilestones - 1];
        return milestone?.bonus || program.contractorReferral.referrerBonus;
      
      case 'cross':
        // Depends on the specific cross-referral type
        return program.crossReferral.userToContractor.userReward;
      
      default:
        return 0;
    }
  }

  static getReferralShareMessage(code: string, type: 'user' | 'contractor'): {
    sms: string;
    email: string;
    social: string;
  } {
    const baseUrl = 'https://heyleila.com';
    const link = `${baseUrl}/r/${code}`;

    if (type === 'user') {
      return {
        sms: `Get $20 off your first home service with HeyLeila! Use my code ${code} or sign up here: ${link}`,
        email: `I've been using HeyLeila for home services and thought you'd love it too! Get $20 off your first booking with my referral code: ${code}. Sign up at ${link}`,
        social: `Need a plumber, electrician, or cleaner? 🏠 Get $20 off your first service with @HeyLeila using my code ${code}! Same-day service available ⚡ ${link}`
      };
    } else {
      return {
        sms: `Join HeyLeila as a contractor and earn $100 after your first job! Use my referral code ${code}: ${link}`,
        email: `I'm earning great money as a HeyLeila contractor. You can too! Get a $100 bonus after completing your first job. Apply with my code ${code} at ${link}`,
        social: `Contractors! 🔧 Join me on @HeyLeila and earn $100 bonus after your first job. Flexible hours, instant payouts, great customers. Use code ${code} ${link}`
      };
    }
  }

  static async trackReferralConversion(
    referralCode: string,
    refereeId: string,
    conversionType: 'signup' | 'first_booking' | 'job_completed'
  ): Promise<void> {
    // In real implementation, this would update Firebase
    console.log(`Tracking conversion: ${conversionType} for referee ${refereeId} with code ${referralCode}`);
  }
}