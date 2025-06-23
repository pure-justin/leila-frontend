# Leila Home Services

AI-powered home service booking platform.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Copy `.env.complete` to `.env.local`

3. **Run development server**
   ```bash
   npm run dev
   ```

## Deployment

Deploy to Vercel:
```bash
npm run deploy
```

## Project Structure

```
/app              - Next.js pages and API routes
/components       - React components
/lib             - Utilities and configurations
/public          - Static assets
/shared-assets   - Service images
```

## Key Features

- Service booking
- Contractor dashboard (/contractor)
- Stripe payments
- Firebase auth & database
- AI chat assistant

## Services

All service images are in `/shared-assets/images/services/{category}/`

Categories: plumbing, electrical, hvac, cleaning, handyman, painting, landscaping, pest-control, moving

## Environment Variables

See `.env.complete` for all required variables:
- Firebase configuration
- Stripe keys
- Google AI/Maps keys
- ReCAPTCHA keys