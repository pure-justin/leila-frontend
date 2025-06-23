# Leila Home Service Platform - Detailed Documentation

## 🏗️ Architecture Overview

This document provides comprehensive documentation for the Leila Home Service Platform. For visual architecture diagrams, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Key Components](#key-components)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Image Generation System](#image-generation-system)
6. [Development Workflow](#development-workflow)
7. [Deployment](#deployment)
8. [Common Tasks](#common-tasks)

## 🗂️ Project Structure

```
home-service-frontend/
├── app/                          # Next.js 14 App Router
│   ├── page.tsx                 # Home page (PersonalizedHomePage)
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css              # Global styles
│   ├── contractor/              # Contractor portal
│   │   ├── dashboard/           # Contractor dashboard
│   │   ├── profile/             # Profile management
│   │   └── login/               # Auth pages
│   ├── admin/                   # Admin CRM
│   │   └── crm/                 # CRM sections
│   │       ├── customers/       # Customer management
│   │       ├── contractors/     # Contractor management
│   │       ├── bookings/        # Booking management
│   │       └── ai-activity/     # AI interaction logs
│   ├── api/                     # API Routes
│   │   ├── ai/chat/            # Gemini AI chat endpoint
│   │   └── generate-asset/      # Image generation API
│   └── services/                # Service detail pages
├── components/                   # React components
│   ├── PersonalizedHomePage.tsx # Main home page component
│   ├── StreamlinedBookingForm.tsx # Unified booking form
│   ├── AILiveChat.tsx          # AI chat interface
│   ├── ServiceCategoryRow.tsx   # Service display component
│   ├── PropertyProfileManager.tsx # Property management
│   ├── PaymentForm.tsx         # Stripe payment integration
│   ├── GlassNav.tsx            # Main navigation
│   └── MobileNav.tsx           # Mobile navigation
├── lib/                         # Core utilities
│   ├── firebase.ts             # Firebase configuration
│   ├── comprehensive-services-catalog.ts # All services data
│   ├── service-images-local.ts # Image mappings
│   ├── stripe-config.ts        # Payment configuration
│   └── user-preferences-service.ts # User preference tracking
├── scripts/                     # Utility scripts
│   ├── ai-graphic-designer.ts  # AI image generation tool
│   ├── generate-all-service-images.ts # Batch image generation
│   └── generate-priority-services.ts # Priority service images
├── public/                      # Static assets
│   └── images/services/         # AI-generated service images
├── functions/                   # Firebase Functions
│   ├── src/
│   │   ├── index.ts            # Function exports
│   │   ├── process-ai-chat.ts  # AI chat processing
│   │   └── user-intelligence.ts # User analytics
└── leila-native/               # React Native app

```

## 🧩 Key Components

### 1. **PersonalizedHomePage** 
**Location**: `/components/PersonalizedHomePage.tsx`
- Main landing page with service browsing
- Integrated search functionality
- Service recommendations based on user history
- Direct booking integration

### 2. **StreamlinedBookingForm**
**Location**: `/components/StreamlinedBookingForm.tsx`
- Multi-step booking process
- Property selection
- Schedule selection
- Payment integration
- Instant booking support

### 3. **AILiveChat**
**Location**: `/components/AILiveChat.tsx`
- Gemini AI-powered chat
- Context-aware responses
- Service recommendations
- Booking assistance

### 4. **ServiceCategoryRow**
**Location**: `/components/ServiceCategoryRow.tsx`
- Horizontal scrollable service display
- Favorite toggling
- Quick booking access
- AI-generated image display

## 🔌 API Endpoints

### Next.js API Routes

#### `/api/ai/chat`
- **Method**: POST
- **Purpose**: Process AI chat messages
- **Payload**:
  ```json
  {
    "message": "string",
    "context": "string (optional)",
    "history": "array (optional)"
  }
  ```

#### `/api/generate-asset`
- **Method**: POST
- **Purpose**: Generate AI images on-demand
- **Payload**:
  ```json
  {
    "subject": "string",
    "assetType": "string",
    "styleModifier": "string (optional)"
  }
  ```

### Firebase Functions

#### `processAIChat`
- Handles AI chat with user context
- Integrates booking history and preferences
- Returns personalized responses

#### `processFeedback`
- Collects user feedback
- Stores in Firestore for analysis

## 💾 Database Schema (Firestore)

### Collections

#### `users`
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  role: 'customer' | 'contractor' | 'admin';
  createdAt: timestamp;
  preferences?: {
    favoriteServices: string[];
    preferredCategories: string[];
  };
}
```

#### `bookings`
```typescript
{
  id: string;
  customerId: string;
  contractorId?: string;
  serviceId: string;
  propertyId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: timestamp;
  scheduledTime: string;
  amount: number;
  paymentIntentId?: string;
  createdAt: timestamp;
}
```

#### `services`
```typescript
{
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  priceUnit: 'fixed' | 'hourly' | 'sqft' | 'quote';
  duration: string;
  images: string[];
}
```

#### `properties`
```typescript
{
  id: string;
  userId: string;
  name: string;
  type: 'home' | 'business' | 'rental';
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  details: {
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
  };
}
```

## 🎨 Image Generation System

### AI Designer Tool
```bash
# Interactive mode
npm run ai-designer interactive

# Generate specific asset
npm run ai-designer generate -s "House Cleaning" -t serviceCard

# Generate variations
npm run ai-designer variations -s "Plumbing" -t serviceHero -c 4

# Full service package
npm run ai-designer package -s "Electrical Panel Upgrade"
```

### Batch Generation
```bash
# Generate all services
npm run generate-all-services

# Generate priority services only
npx tsx scripts/generate-priority-services.ts

# Generate remaining services
npx tsx scripts/generate-remaining-services.ts
```

### Image Organization
```
public/images/services/
├── cleaning/
│   ├── house-cleaning-1.png (800x600)
│   ├── house-cleaning-1-thumb.png (400x300)
│   └── ...
├── plumbing/
├── electrical/
└── [category]/
    └── [service-name]-[variant][-size].png
```

## 🚀 Development Workflow

### Prerequisites
```bash
# Node.js 20+
node --version

# Install dependencies
npm install

# Firebase CLI
npm install -g firebase-tools

# Google Cloud SDK (for image generation)
gcloud auth application-default login
```

### Environment Variables
```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Server-only
FIREBASE_SERVICE_ACCOUNT=
STRIPE_SECRET_KEY=
GEMINI_API_KEY=
GOOGLE_CLOUD_PROJECT_ID=
```

### Development Commands
```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

## 📦 Deployment

### Vercel (Frontend)
```bash
# Deploy to production
npm run deploy

# Deploy preview
npm run deploy:preview
```

### Firebase (Functions)
```bash
# Deploy functions only
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:processAIChat
```

## 🔧 Common Tasks

### Adding a New Service
1. Add to `lib/comprehensive-services-catalog.ts`
2. Generate images: `npm run ai-designer generate -s "Service Name" -t serviceCard`
3. Update `lib/service-images-local.ts` with image paths

### Creating a New Page
1. Create file in `app/[path]/page.tsx`
2. Add navigation link in `GlassNav` and `MobileNav`
3. Update `ARCHITECTURE.md` diagrams

### Modifying Booking Flow
1. Edit `StreamlinedBookingForm.tsx`
2. Update payment logic if needed
3. Test with Stripe test cards

### Updating AI Responses
1. Modify `functions/src/process-ai-chat.ts`
2. Update system prompts and context
3. Deploy function: `firebase deploy --only functions:processAIChat`

## 🐛 Troubleshooting

### Common Issues

#### Images Not Loading
- Check if images exist in `/public/images/services/`
- Verify image paths in `service-images-local.ts`
- Run image generation if missing

#### Authentication Errors
- Verify Firebase configuration
- Check user roles in Firestore
- Clear browser cache/cookies

#### Payment Issues
- Confirm Stripe keys are set
- Use test mode for development
- Check webhook configuration

#### Build Errors
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## 📚 Additional Resources

- [Architecture Diagrams](./ARCHITECTURE.md)
- [Firebase Console](https://console.firebase.google.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Vercel Dashboard](https://vercel.com)
- [Google Cloud Console](https://console.cloud.google.com)