# Leila Home Services - Development Context

## Project Overview
AI-powered home service platform connecting customers with contractors via voice-activated booking ("Hey Leila").

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions, Storage)
- **Mobile**: React Native (Expo)
- **AI**: Google Gemini 1.5 Flash
- **Payments**: Stripe Connect
- **Hosting**: Vercel

## Project Structure
```
/Users/justingriffith/Documents/Home Service App/
├── home-service-frontend/    # Main Next.js web app
├── leila-native/            # React Native mobile app
├── functions/               # Firebase Cloud Functions
├── shared-assets/           # Images, logos, fonts
│   ├── images/services/     # AI-generated service images
│   ├── logos/              # App logos
│   └── favicons/           # App favicons
├── instruction-docs/        # All documentation
│   ├── SETUP_GUIDE.md      # Development setup
│   ├── ARCHITECTURE.md     # Technical architecture
│   ├── MOBILE_DEVELOPMENT.md # Mobile app guide
│   ├── TROUBLESHOOTING.md  # Common issues
│   └── BUSINESS_PLAN.md    # Business strategy
└── .env                    # Single environment config
```

## Key Features
- **Customer**: Service booking, real-time tracking, chat support
- **Contractor**: Job management, earnings tracking, schedule control
- **Admin**: CRM dashboard at `/admin/crm`

## Development Commands
```bash
# Frontend
cd home-service-frontend
npm run dev              # Start development
npm run build            # Production build
npm run deploy           # Deploy to Vercel

# Mobile
cd leila-native
npm start               # Start Expo
npm run ios            # iOS simulator
npm run android        # Android emulator

# Firebase Functions
cd functions
npm run serve          # Local testing
npm run deploy         # Deploy functions
```

## Important URLs
- **Production**: https://heyleila.com
- **Contractor Portal**: https://heyleila.com/contractor
- **Admin CRM**: https://heyleila.com/admin/crm

## Current Status
- ✅ Web app deployed and running
- ✅ Firebase backend configured
- ✅ Stripe payments integrated
- ⏳ Mobile app in development
- ⏳ Push notifications pending

## Quick Notes
- All images must go in `/shared-assets/`
- Single `.env` file at project root
- No separate API - direct Firebase integration
- Commission: 30% → 10% (tiered by volume)