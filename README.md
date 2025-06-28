# Leila Home Services - Frontend

⚠️ **PROPRIETARY SOFTWARE - DO NOT COPY** ⚠️

This repository contains proprietary code for Leila Home Services. Unauthorized use is prohibited.

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

## Security Notice

This is currently a PUBLIC repository. While we work on making it private:

1. **DO NOT** commit any sensitive data, API keys, or credentials
2. **DO NOT** share internal business logic details in commits
3. **USE** environment variables for all configuration
4. **REVIEW** all code before pushing

## Legal

All code is proprietary and confidential. See LICENSE file for details.

© 2024 Leila Home Services. All rights reserved.