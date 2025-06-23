# Stripe Payment Debugging Guide

## Overview
This guide helps diagnose and fix Stripe payment issues in the Leila Home Services application.

## Environment Configuration

### Required Environment Variables
Ensure these are set in your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### How to Get These Keys

1. **Publishable Key & Secret Key**:
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com)
   - Go to Developers → API keys
   - Copy the keys (use test keys for development)

2. **Webhook Secret**:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events to listen for (at minimum: `payment_intent.succeeded`, `payment_intent.payment_failed`)
   - Copy the signing secret

## Testing Payment Flow

### 1. Test the Payment Intent Creation
```bash
# Test the API endpoint directly
curl -X POST http://localhost:3000/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "metadata": {"test": true}}'
```

Expected response:
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_...",
  "amount": 5000,
  "status": "requires_payment_method"
}
```

### 2. Check Browser Console
When testing payments, open browser DevTools and look for:
- `[Payment API] Creating payment intent:` logs
- `Payment intent created:` logs
- Any error messages

### 3. Test Card Numbers
Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Use any future expiry date and any 3-digit CVC.

## Common Issues & Solutions

### Issue 1: "Payment system is not configured"
**Cause**: Missing `STRIPE_SECRET_KEY`
**Solution**: 
1. Check `.env.local` has the key
2. Restart Next.js server after adding env vars
3. Verify key starts with `sk_test_` or `sk_live_`

### Issue 2: "Stripe is not defined" or null stripePromise
**Cause**: Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
**Solution**:
1. Check `.env.local` has the key (must include `NEXT_PUBLIC_` prefix)
2. Verify key starts with `pk_test_` or `pk_live_`
3. Clear browser cache and reload

### Issue 3: Payment succeeds but no confirmation
**Cause**: Webhook not configured or failing
**Solution**:
1. Set up webhook endpoint in Stripe Dashboard
2. Add `STRIPE_WEBHOOK_SECRET` to `.env.local`
3. For local testing, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Issue 4: "Invalid amount" error
**Cause**: Amount not in cents or below minimum
**Solution**:
1. Ensure amount is multiplied by 100 (dollars to cents)
2. Minimum amount is 50 cents ($0.50)

## Debugging Checklist

- [ ] All 3 Stripe env variables are set
- [ ] Next.js server restarted after env changes
- [ ] Browser console checked for errors
- [ ] Network tab shows successful API calls
- [ ] Test card number being used (not real card in test mode)
- [ ] Amount is in cents and >= 50
- [ ] Webhook endpoint configured (for production)

## Monitoring & Logs

### Where to Check Logs

1. **Browser Console**: Client-side errors
2. **Terminal/Server Logs**: API errors with `[Payment API]` prefix
3. **Stripe Dashboard**: 
   - Developers → Logs for API requests
   - Payments for transaction history
   - Developers → Webhooks → Event logs

### Key Log Messages

Success flow:
1. `[Payment API] Creating payment intent:`
2. `[Payment API] Payment intent created successfully:`
3. `Payment intent created:` (client-side)
4. `[Stripe Webhook] Payment succeeded:`

Error indicators:
- `[Payment API] Stripe secret key is not configured`
- `[Payment API] Invalid amount:`
- `[Payment API] Stripe authentication error`
- `Payment setup error:` (client-side)

## Production Deployment

Before going live:
1. Switch to live API keys (start with `pk_live_` and `sk_live_`)
2. Configure production webhook endpoint
3. Enable all necessary webhook events
4. Test with real card in live mode (small amount)
5. Monitor Stripe Dashboard for first transactions

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

For application issues:
- Check server logs
- Review this guide
- Contact development team