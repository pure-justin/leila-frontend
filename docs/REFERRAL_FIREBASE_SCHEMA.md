# Referral System Firebase Schema

## Collections

### `referral_codes`
Stores all referral codes and their metadata.

```typescript
{
  code: string;              // Unique code (e.g., "C7X9K2")
  ownerId: string;          // User or contractor ID
  ownerType: 'user' | 'contractor';
  created: Timestamp;
  uses: number;             // Current number of uses
  maxUses?: number;         // Optional limit
  expiresAt?: Timestamp;    // Optional expiration
  customReward?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  active: boolean;
}
```

### `referral_tracking`
Tracks all referral relationships and their status.

```typescript
{
  referralId: string;       // Document ID
  referrerId: string;       // Person who shared the code
  refereeId: string;        // Person who used the code
  referralCode: string;     // Code used
  type: 'user' | 'contractor' | 'cross';
  status: 'pending' | 'qualified' | 'paid' | 'expired';
  createdAt: Timestamp;
  qualifiedAt?: Timestamp;
  paidAt?: Timestamp;
  
  // Amounts
  referrerReward: number;
  refereeDiscount: number;
  
  // Milestones for contractor referrals
  milestones?: {
    requirement: string;
    metric: string;
    target: number;
    current: number;
    completed: boolean;
    completedAt?: Timestamp;
  }[];
  
  // Metadata
  refereeInfo: {
    name: string;
    email: string;
    phone?: string;
    type: 'user' | 'contractor';
  };
}
```

### `referral_payouts`
Records all referral payments made.

```typescript
{
  payoutId: string;
  referralId: string;
  recipientId: string;
  recipientType: 'user' | 'contractor';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'credit' | 'bank_transfer' | 'stripe';
  processedAt: Timestamp;
  metadata?: {
    stripeTransferId?: string;
    bankAccount?: string;
    failureReason?: string;
  };
}
```

### User/Contractor Document Updates

Add to existing user/contractor documents:

```typescript
{
  // ... existing fields
  
  referral: {
    code: string;
    referredBy?: string;      // Who referred them
    referredByCode?: string;   // Code they used to sign up
    totalReferrals: number;
    successfulReferrals: number;
    totalEarned: number;
    availableBalance: number;
    tier: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
    lastPayoutAt?: Timestamp;
  };
}
```

## Cloud Functions

### `onUserSignup`
Triggered when a new user signs up.
- Check if referral code was used
- Create referral tracking record
- Apply signup bonus/discount

### `onBookingCompleted`
Triggered when a booking is completed.
- Check if user was referred
- Update referral tracking status
- Calculate and credit referral rewards

### `onContractorJobCompleted`
Triggered when contractor completes a job.
- Update contractor referral milestones
- Check qualification criteria
- Process milestone bonuses

### `processReferralPayouts`
Scheduled function (daily/weekly).
- Aggregate qualified referrals
- Process bulk payouts
- Update user/contractor balances
- Send notification emails

## Security Rules

```javascript
// Referral codes - read only for authenticated users
match /referral_codes/{code} {
  allow read: if request.auth != null;
  allow write: if false; // Only through Cloud Functions
}

// Referral tracking - users can read their own
match /referral_tracking/{trackingId} {
  allow read: if request.auth != null && 
    (request.auth.uid == resource.data.referrerId || 
     request.auth.uid == resource.data.refereeId);
  allow write: if false; // Only through Cloud Functions
}

// Payouts - users can read their own
match /referral_payouts/{payoutId} {
  allow read: if request.auth != null && 
    request.auth.uid == resource.data.recipientId;
  allow write: if false; // Only through Cloud Functions
}
```

## Indexes

1. **referral_codes**
   - ownerId + active
   - code + active

2. **referral_tracking**
   - referrerId + status
   - refereeId + status
   - createdAt + status

3. **referral_payouts**
   - recipientId + status
   - processedAt + status

## Implementation Notes

1. **Code Generation**: Use format `[U/C][6-CHAR-RANDOM]` where U=user, C=contractor
2. **Validation**: Always validate codes are active and not expired
3. **Fraud Prevention**: 
   - Limit codes per user
   - Verify email/phone before qualifying
   - Monitor for suspicious patterns
4. **Notifications**: Send emails/SMS for:
   - Referral signup
   - Qualification milestones
   - Payout processing