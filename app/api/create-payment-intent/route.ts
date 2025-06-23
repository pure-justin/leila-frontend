import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe outside of the handler for better performance
let stripe: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check if Stripe secret key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Payment API] Stripe secret key is not configured');
      return NextResponse.json(
        { 
          error: 'Payment system is not configured. Please contact support.',
          code: 'STRIPE_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    const stripeClient = getStripe();
    if (!stripeClient) {
      console.error('[Payment API] Failed to initialize Stripe client');
      return NextResponse.json(
        { 
          error: 'Payment system initialization failed',
          code: 'STRIPE_INIT_FAILED'
        },
        { status: 503 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[Payment API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          code: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    const { amount, metadata = {} } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 50) { // Minimum $0.50
      console.error('[Payment API] Invalid amount:', amount);
      return NextResponse.json(
        { 
          error: 'Invalid amount. Minimum $0.50 required.',
          code: 'INVALID_AMOUNT',
          details: { providedAmount: amount, minimum: 50 }
        },
        { status: 400 }
      );
    }

    console.log('[Payment API] Creating payment intent:', {
      amount,
      metadata,
      timestamp: new Date().toISOString()
    });

    // Create payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount), // Ensure amount is an integer
      currency: 'usd',
      metadata: {
        platform: 'leila-home-services',
        timestamp: new Date().toISOString(),
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      // Add statement descriptor for clearer billing
      statement_descriptor: 'LEILA HOME SVCS',
      statement_descriptor_suffix: metadata.serviceId ? `SVC${metadata.serviceId.slice(0, 5)}` : undefined,
    });

    const responseTime = Date.now() - startTime;
    console.log('[Payment API] Payment intent created successfully:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
      responseTime: `${responseTime}ms`
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      console.error('[Payment API] Card error:', {
        message: error.message,
        code: error.code,
        responseTime: `${responseTime}ms`
      });
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          type: 'card_error'
        },
        { status: 400 }
      );
    } else if (error.type === 'StripeInvalidRequestError') {
      console.error('[Payment API] Invalid request error:', {
        message: error.message,
        param: error.param,
        responseTime: `${responseTime}ms`
      });
      return NextResponse.json(
        { 
          error: 'Invalid payment request',
          code: 'INVALID_REQUEST',
          details: error.message
        },
        { status: 400 }
      );
    } else if (error.type === 'StripeAPIError') {
      console.error('[Payment API] Stripe API error:', {
        message: error.message,
        responseTime: `${responseTime}ms`
      });
      return NextResponse.json(
        { 
          error: 'Payment service temporarily unavailable',
          code: 'STRIPE_API_ERROR'
        },
        { status: 503 }
      );
    } else if (error.type === 'StripeConnectionError') {
      console.error('[Payment API] Stripe connection error:', {
        message: error.message,
        responseTime: `${responseTime}ms`
      });
      return NextResponse.json(
        { 
          error: 'Unable to connect to payment service',
          code: 'CONNECTION_ERROR'
        },
        { status: 503 }
      );
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('[Payment API] Stripe authentication error - check API keys:', {
        message: error.message,
        responseTime: `${responseTime}ms`
      });
      return NextResponse.json(
        { 
          error: 'Payment authentication failed',
          code: 'AUTH_ERROR'
        },
        { status: 401 }
      );
    }
    
    // Generic error handling
    console.error('[Payment API] Unexpected error:', {
      error: error.message || error,
      stack: error.stack,
      responseTime: `${responseTime}ms`
    });
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while processing payment',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}