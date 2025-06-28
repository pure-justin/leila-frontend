import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { serverConfig } from '@/lib/config/secure-config';

// Initialize Stripe with secure config
const stripe = new Stripe(serverConfig.stripe.secretKey, {
  apiVersion: '2025-05-28.basil',
});

// Disable body parsing for webhooks
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] No signature found in headers');
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Webhook secret not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('[Stripe Webhook] Error verifying webhook signature:', err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('[Stripe Webhook] Received event:', {
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString()
  });

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('[Stripe Webhook] Payment succeeded:', {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata
        });
        
        // TODO: Update booking status in database
        // TODO: Send confirmation email to customer
        // TODO: Notify contractor of new booking
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.error('[Stripe Webhook] Payment failed:', {
          id: failedPayment.id,
          amount: failedPayment.amount,
          error: failedPayment.last_payment_error?.message
        });
        
        // TODO: Update booking status to failed
        // TODO: Notify customer of failed payment
        break;

      case 'charge.refunded':
        const refund = event.data.object as Stripe.Charge;
        console.log('[Stripe Webhook] Refund processed:', {
          id: refund.id,
          amount: refund.amount_refunded,
          refundId: refund.refunds?.data[0]?.id
        });
        
        // TODO: Update booking status to refunded
        // TODO: Notify customer and contractor of refund
        break;

      case 'customer.created':
        const customer = event.data.object as Stripe.Customer;
        console.log('[Stripe Webhook] Customer created:', {
          id: customer.id,
          email: customer.email
        });
        
        // TODO: Link Stripe customer to user account
        break;

      case 'account.updated':
        const account = event.data.object as Stripe.Account;
        console.log('[Stripe Webhook] Connect account updated:', {
          id: account.id,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled
        });
        
        // TODO: Update contractor account status
        break;

      case 'account.application.authorized':
        const authorizedApplication = event.data.object as Stripe.Application;
        console.log('[Stripe Webhook] Connect account authorized:', {
          id: authorizedApplication.id
        });
        // TODO: Mark contractor as payment-ready
        break;

      case 'payout.paid':
        const payout = event.data.object as Stripe.Payout;
        console.log('[Stripe Webhook] Payout completed:', {
          id: payout.id,
          amount: payout.amount,
          arrivalDate: payout.arrival_date
        });
        
        // TODO: Update contractor payout record
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing webhook:', {
      eventType: event.type,
      error: error.message,
      stack: error.stack
    });
    
    // Return 200 to prevent Stripe from retrying
    // Log the error for manual investigation
    return NextResponse.json({ 
      received: true, 
      error: 'Processing failed but acknowledged' 
    });
  }
}

// Stripe will also send HEAD requests to check endpoint availability
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}