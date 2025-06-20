# Leila - AI Home Service Platform

A comprehensive Next.js application for customers to book home services with AI automation and real-time contractor matching.

## Features

- 🏠 Service catalog with comprehensive home services
- 📝 Intelligent booking system with AI optimization  
- 🤖 Advanced AI chatbot powered by Gemini Flash
- 🔗 Firebase/Firestore integration for real-time data
- 📱 Responsive Uber-like design
- 👥 Complete contractor portal
- 📊 Real-time analytics and monitoring
- 🎯 Voice control with "Hey Leila"

## Architecture

**Frontend**: Next.js 14 with App Router
**Database**: Firebase Firestore  
**Authentication**: Firebase Auth
**AI**: Google Gemini 1.5 Flash
**Hosting**: Vercel

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local` with Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

## How It Works

1. **Customer** books services through the main app
2. **AI agents** automatically match with available contractors
3. **Contractors** receive real-time job notifications
4. **Firebase** maintains real-time sync across all platforms

## Key Features

### Customer Portal
- Browse and book services
- Track booking status
- Chat with AI assistant
- Voice-activated booking

### Contractor Portal (/contractor)
- Real-time job feed
- Schedule management
- Performance analytics
- Profile management

## Technologies

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Firebase Firestore with real-time sync
- **Authentication**: Firebase Auth with role-based access
- **AI**: Google Gemini 1.5 Flash for intelligent automation
- **Hosting**: Vercel with edge optimization

## Available Services

- Plumbing ($150-$500)
- Electrical ($200-$800)
- HVAC ($200-$1500)
- House Cleaning ($100-$300)
- Lawn Care ($50-$200)
- Pest Control ($150-$400)
- Appliance Repair ($100-$500)
- Painting ($300-$2000)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run production build
npm start
```

## Deployment

The app is automatically deployed to Vercel on push to the main branch.

## License

MIT