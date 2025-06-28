import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { secureApiHandler, ApiResponse } from '@/lib/api/secure-handler';
import { serverConfig } from '@/lib/config/secure-config';

export const POST = secureApiHandler(async (request) => {
  // Check if Stripe secret key is configured
  if (!serverConfig.stripe.secretKey) {
    console.error('Stripe secret key is not configured');
    return ApiResponse.error('Payment system is not configured. Please contact support.', 500);
  }

  const stripe = new Stripe(serverConfig.stripe.secretKey, {
    apiVersion: '2025-05-28.basil',
  });

    const { amount, metadata = {} } = await request.json();

    if (!amount || amount < 50) { // Minimum $0.50
      return ApiResponse.error('Invalid amount. Minimum $0.50 required.', 400);
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

    return ApiResponse.success({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
}, {
  allowedMethods: ['POST'],
  requireAuth: true, // Require authentication for payment creation
  rateLimit: 10 // 10 payment attempts per minute
});