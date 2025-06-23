import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    
    if (!stripeKey || !publishableKey) {
      return NextResponse.json({
        status: 'warning',
        message: 'Stripe configuration incomplete',
        configured: false,
        timestamp: new Date().toISOString(),
        details: {
          hasSecretKey: !!stripeKey,
          hasPublishableKey: !!publishableKey,
          hint: 'Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables'
        }
      });
    }
    
    // Test Stripe connection
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-05-28.basil'
    });
    
    // Try to retrieve account details to verify connection
    const account = await stripe.accounts.retrieve();
    
    return NextResponse.json({
      status: 'healthy',
      message: 'Stripe connection successful',
      configured: true,
      timestamp: new Date().toISOString(),
      details: {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        country: account.country,
        defaultCurrency: account.default_currency,
        hasSecretKey: true,
        hasPublishableKey: true
      }
    });
  } catch (error: any) {
    console.error('Stripe health check failed:', error);
    
    // Check if it's an authentication error
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json({
        status: 'error',
        error: 'Authentication failed',
        message: 'Invalid Stripe API key',
        configured: false,
        details: {
          hint: 'Check that your STRIPE_SECRET_KEY is correct and active'
        }
      }, { status: 401 });
    }
    
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error',
      message: 'Stripe health check failed',
      configured: !!process.env.STRIPE_SECRET_KEY,
      details: {
        type: error.type,
        code: error.code,
        statusCode: error.statusCode
      }
    }, { status: 500 });
  }
}