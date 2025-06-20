# Leila Home Service Platform - Project Context

## Project Overview
Leila is an AI-powered home service platform that connects customers with contractors for various home services. The platform features voice control ("Hey Leila"), real-time job matching, and an Uber-style UI/UX.

## Active Architecture

### Domain
- **Main App**: heyleila.com (customer and contractor portal)

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **AI**: Google Gemini 1.5 Flash
- **Hosting**: Vercel

## Current Features

### Customer App
- Service booking with AI-powered matching
- Real-time chat with AI assistant
- Voice control integration
- PWA with offline support
- Dark mode support

### Contractor Dashboard (/contractor)
- Live job feed with real-time updates
- Analytics dashboard
- Schedule management
- Profile management
- Authentication (login/signup)

### Services Offered
- Plumbing ($150-$500)
- Electrical ($200-$800)
- HVAC ($200-$1500)
- House Cleaning ($100-$300)
- Lawn Care ($50-$200)
- Pest Control ($150-$400)
- Appliance Repair ($100-$500)
- Painting ($300-$2000)

## Data Model (Firestore)

### Core Collections
- `users` - Customers and contractors
- `bookings` - Service requests with pricing breakdown
- `services` - Service catalog with base prices
- `api_keys` - Third-party API access
- `notifications` - Multi-channel notifications

### Pricing System
- Base prices stored in Firestore
- Dynamic pricing via AI (urgency, timing, demand)
- Support for fixed, hourly, and quote-based pricing
- Detailed price breakdowns for transparency

## Key Files and Locations

### Frontend
- Entry: `/app/page.tsx` - Main landing page
- Contractor: `/app/contractor/` - Contractor portal
- Components: `/components/` - Shared UI components
- Lib: `/lib/` - Core functionality (AI, Firebase)

### Configuration
- Firebase: `/firebase.json`, `/firestore.rules`
- Next.js: `/next.config.js`
- TypeScript: `/tsconfig.json`
- Environment: `.env.local`

## Development Commands

```bash
# Frontend development
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Recent Updates
- Removed API Gateway - now using Firebase directly
- Removed CRM integration - simplified architecture
- Removed MySQL - fully migrated to Firestore
- Cleaned up Docker configurations
- Updated all documentation

## Important Notes
- Always use Firebase services
- Base prices configured in Firestore, not hardcoded
- All contractor features under /contractor route
- Deployment via Vercel (automatic on push to main)

## Current Focus Areas
1. Real-time job matching system
2. Contractor onboarding flow
3. Payment integration (Stripe)
4. Enhanced AI chatbot capabilities
5. Mobile app optimization