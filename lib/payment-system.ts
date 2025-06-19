import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerId: string;
  contractorId: string;
  bookingId: string;
  platformFee: number;
  contractorPayout: number;
  metadata: Record<string, any>;
}

export interface PayoutSchedule {
  contractorId: string;
  amount: number;
  scheduledDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bankAccount?: string;
}

export interface PlatformFees {
  percentage: number; // Platform percentage (e.g., 0.15 for 15%)
  minimum: number;    // Minimum fee in cents
  maximum?: number;   // Maximum fee in cents (optional)
}

const PLATFORM_FEES: PlatformFees = {
  percentage: 0.15, // 15% platform fee
  minimum: 299,     // $2.99 minimum
  maximum: 5000     // $50.00 maximum
};

// Calculate platform fee and contractor payout
export function calculateFees(totalAmount: number): {
  platformFee: number;
  contractorPayout: number;
  stripeFee: number;
} {
  // Stripe fee: 2.9% + 30¢
  const stripeFee = Math.round(totalAmount * 0.029 + 30);
  
  // Platform fee calculation
  let platformFee = Math.round(totalAmount * PLATFORM_FEES.percentage);
  platformFee = Math.max(platformFee, PLATFORM_FEES.minimum);
  if (PLATFORM_FEES.maximum) {
    platformFee = Math.min(platformFee, PLATFORM_FEES.maximum);
  }
  
  // Contractor gets the rest after all fees
  const contractorPayout = totalAmount - platformFee - stripeFee;
  
  return {
    platformFee,
    contractorPayout,
    stripeFee
  };
}

// Create Stripe Connect account for contractor
export async function createContractorAccount(contractorData: {
  email: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  ssn?: string; // Last 4 digits for verification
  dob?: {
    day: number;
    month: number;
    year: number;
  };
}): Promise<string> {
  try {
    // Create connected account
    const account = await stripe.accounts.create({
      type: 'express',
      country: contractorData.address.country || 'US',
      email: contractorData.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      individual: {
        email: contractorData.email,
        first_name: contractorData.firstName,
        last_name: contractorData.lastName,
        phone: contractorData.phone,
        address: contractorData.address,
        ...(contractorData.ssn && { ssn_last_4: contractorData.ssn }),
        ...(contractorData.dob && { dob: contractorData.dob })
      },
      business_profile: {
        mcc: '7699', // Repair services MCC code
        name: contractorData.businessName || `${contractorData.firstName} ${contractorData.lastName}`,
        product_description: 'Home service and repair contractor',
        support_email: contractorData.email,
        support_phone: contractorData.phone,
        url: `https://heyleila.com/contractor/${contractorData.email}`
      },
      metadata: {
        platform: 'leila',
        contractor_email: contractorData.email
      }
    });
    
    // Store Stripe account ID in database
    await supabase
      .from('contractors')
      .update({ stripe_account_id: account.id })
      .eq('email', contractorData.email);
    
    return account.id;
  } catch (error) {
    console.error('Error creating contractor account:', error);
    throw error;
  }
}

// Generate onboarding link for contractor
export async function getOnboardingLink(
  accountId: string,
  returnUrl: string = 'https://heyleila.com/contractor/dashboard',
  refreshUrl: string = 'https://heyleila.com/contractor/onboarding'
): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding'
  });
  
  return accountLink.url;
}

// Create payment intent for a booking
export async function createPaymentIntent(
  bookingData: {
    bookingId: string;
    customerId: string;
    contractorId: string;
    amount: number; // in cents
    description: string;
    metadata?: Record<string, any>;
  }
): Promise<PaymentIntent> {
  try {
    // Get contractor's Stripe account
    const { data: contractor } = await supabase
      .from('contractors')
      .select('stripe_account_id')
      .eq('id', bookingData.contractorId)
      .single();
    
    if (!contractor?.stripe_account_id) {
      throw new Error('Contractor has not completed payment setup');
    }
    
    // Calculate fees
    const fees = calculateFees(bookingData.amount);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: bookingData.amount,
      currency: 'usd',
      application_fee_amount: fees.platformFee,
      transfer_data: {
        destination: contractor.stripe_account_id
      },
      metadata: {
        booking_id: bookingData.bookingId,
        customer_id: bookingData.customerId,
        contractor_id: bookingData.contractorId,
        platform_fee: fees.platformFee,
        contractor_payout: fees.contractorPayout,
        ...bookingData.metadata
      },
      description: bookingData.description,
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    // Store payment intent in database
    await supabase.from('payments').insert({
      payment_intent_id: paymentIntent.id,
      booking_id: bookingData.bookingId,
      customer_id: bookingData.customerId,
      contractor_id: bookingData.contractorId,
      amount: bookingData.amount,
      platform_fee: fees.platformFee,
      contractor_payout: fees.contractorPayout,
      status: paymentIntent.status,
      created_at: new Date().toISOString()
    });
    
    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      customerId: bookingData.customerId,
      contractorId: bookingData.contractorId,
      bookingId: bookingData.bookingId,
      platformFee: fees.platformFee,
      contractorPayout: fees.contractorPayout,
      metadata: paymentIntent.metadata
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Process refund
export async function processRefund(
  paymentIntentId: string,
  amount?: number, // Optional partial refund amount
  reason?: string
): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount, // If not specified, full refund
      reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
      metadata: {
        platform: 'leila',
        processed_at: new Date().toISOString()
      }
    });
    
    // Update payment status in database
    await supabase
      .from('payments')
      .update({ 
        status: 'refunded',
        refund_amount: refund.amount,
        refunded_at: new Date().toISOString()
      })
      .eq('payment_intent_id', paymentIntentId);
    
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

// Get contractor balance and pending payouts
export async function getContractorBalance(
  stripeAccountId: string
): Promise<{
  available: number;
  pending: number;
  currency: string;
}> {
  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeAccountId
  });
  
  const available = balance.available.reduce((sum: number, b: any) => sum + b.amount, 0);
  const pending = balance.pending.reduce((sum: number, b: any) => sum + b.amount, 0);
  
  return {
    available,
    pending,
    currency: balance.available[0]?.currency || 'usd'
  };
}

// Create payout to contractor's bank
export async function createPayout(
  stripeAccountId: string,
  amount?: number // If not specified, pays out full available balance
): Promise<Stripe.Payout> {
  try {
    const payout = await stripe.payouts.create(
      {
        amount: amount,
        currency: 'usd',
        method: 'standard', // or 'instant' for instant payouts
        metadata: {
          platform: 'leila',
          initiated_at: new Date().toISOString()
        }
      },
      {
        stripeAccount: stripeAccountId
      }
    );
    
    // Record payout in database
    await supabase.from('payouts').insert({
      payout_id: payout.id,
      stripe_account_id: stripeAccountId,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
      created_at: new Date().toISOString()
    });
    
    return payout;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw error;
  }
}

// Handle Stripe webhooks
export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Invalid webhook signature');
  }
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
      break;
      
    case 'account.updated':
      await handleAccountUpdate(event.data.object as Stripe.Account);
      break;
      
    case 'payout.paid':
      await handlePayoutPaid(event.data.object as Stripe.Payout);
      break;
      
    case 'payout.failed':
      await handlePayoutFailed(event.data.object as Stripe.Payout);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Handle successful payment
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.booking_id;
  
  // Update payment status
  await supabase
    .from('payments')
    .update({ 
      status: 'succeeded',
      succeeded_at: new Date().toISOString()
    })
    .eq('payment_intent_id', paymentIntent.id);
  
  // Update booking status
  await supabase
    .from('bookings')
    .update({ 
      payment_status: 'paid',
      status: 'confirmed'
    })
    .eq('id', bookingId);
  
  // Notify contractor and customer
  // Implementation depends on notification system
}

// Handle failed payment
async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingId = paymentIntent.metadata.booking_id;
  
  // Update payment status
  await supabase
    .from('payments')
    .update({ 
      status: 'failed',
      failed_at: new Date().toISOString(),
      failure_reason: paymentIntent.last_payment_error?.message
    })
    .eq('payment_intent_id', paymentIntent.id);
  
  // Update booking status
  await supabase
    .from('bookings')
    .update({ 
      payment_status: 'failed',
      status: 'payment_required'
    })
    .eq('id', bookingId);
}

// Handle contractor account updates
async function handleAccountUpdate(account: Stripe.Account): Promise<void> {
  // Update contractor verification status
  await supabase
    .from('contractors')
    .update({
      stripe_charges_enabled: account.charges_enabled,
      stripe_payouts_enabled: account.payouts_enabled,
      stripe_details_submitted: account.details_submitted,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_account_id', account.id);
}

// Handle successful payout
async function handlePayoutPaid(payout: Stripe.Payout): Promise<void> {
  await supabase
    .from('payouts')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString()
    })
    .eq('payout_id', payout.id);
}

// Handle failed payout
async function handlePayoutFailed(payout: Stripe.Payout): Promise<void> {
  await supabase
    .from('payouts')
    .update({
      status: 'failed',
      failure_reason: payout.failure_message,
      failed_at: new Date().toISOString()
    })
    .eq('payout_id', payout.id);
}

// Customer payment methods
export async function savePaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<void> {
  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId
  });
  
  // Set as default if it's the first one
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card'
  });
  
  if (paymentMethods.data.length === 1) {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
  }
}

// Get customer's saved payment methods
export async function getCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card'
  });
  
  return paymentMethods.data;
}