import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key is not configured');
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    const { amount, metadata = {} } = await request.json();

    if (!amount || amount < 50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Invalid amount. Minimum $0.50 required.' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      metadata: {
        platform: 'leila-home-services',
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}