# Leila - AI Home Service Platform

A comprehensive Next.js application for customers to book home services with AI automation, featuring a complete CRM system and real-time monitoring.

## Features

- 🏠 Service catalog with comprehensive home services
- 📝 Intelligent booking system with AI optimization  
- 🤖 Advanced AI chatbot powered by Gemini Flash
- 🔗 Firebase/Firestore integration for real-time data
- 📱 Responsive Uber-like design
- 👥 Complete CRM for contractors and customers
- 📊 Real-time analytics and monitoring
- 🎯 AI agent automation for business operations

## Architecture

**Frontend & CRM**: Firebase Hosting with static Next.js export
**Database**: Firestore with comprehensive data modeling
**API**: Cloud Functions with custom domain
**AI**: Gemini 1.5 Flash for cost-effective automation

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env.local` with Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=leila-platform.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=leila-platform
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

## How It Works

1. **Customer** books services through the main app (heyleila.com)
2. **AI agents** automatically assign contractors and optimize scheduling
3. **CRM dashboard** (crm.heyleila.com) provides real-time management
4. **API endpoints** (api.heyleila.com) handle all data operations
5. **Firestore** maintains real-time sync across all platforms

## Available URLs

- **Main App**: https://heyleila.com
- **CRM Dashboard**: https://crm.heyleila.com  
- **API Endpoints**: https://api.heyleila.com

## Technologies

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: Firebase Firestore with real-time sync
- **Authentication**: Firebase Auth
- **API**: Cloud Functions with custom domain
- **AI**: Google Gemini 1.5 Flash
- **Hosting**: Firebase Hosting with static export
- **Infrastructure**: Google Cloud Platform

## Deployment Commands

```bash
# Deploy main app
npm run build && firebase deploy --only hosting:main

# Deploy CRM
npm run build:crm && firebase deploy --only hosting:crm

# Deploy API functions  
cd functions && firebase deploy --only functions
```

## DNS Configuration

Add these records in your domain DNS:
- **CNAME**: crm → leila-crm.web.app
- **A Record**: api → 34.54.9.206

## Key Features

- ✅ Real-time activity monitoring and logging
- ✅ AI agent system for autonomous operations  
- ✅ Complete user and contractor management
- ✅ Booking system with intelligent assignment
- ✅ Custom domain setup for all services
- ✅ Comprehensive data modeling in Firestore