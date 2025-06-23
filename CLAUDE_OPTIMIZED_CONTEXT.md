# Leila Platform - Optimized Context

## Project Overview
- **Total Files**: 281
- **Total Lines**: 62,782
- **Main Technologies**: Next.js 14, TypeScript, Firebase, Google Cloud AI

## Key Directories
├── .env.example
├── .env.local
├── .env.local.example
├── .env.production
├── .firebase
├── hosting.b3V0.cache
├── .firebaserc
├── AI_IMAGE_SETUP.md
├── ARCHITECTURE.md
├── CLAUDE.md
├── FIREBASE_AUTH_FIX.md
├── MEMORY_SYSTEM_SETUP.md
├── MOBILE_CLEANUP_PLAN.md
├── NAVIGATION_FIXES.md
├── README-DETAILED.md
├── README.md
├── URGENT_MAPS_FIX.md
├── USE_GOOGLE_IMAGEFX.md
├── VERCEL_DEPLOYMENT_FIX.md
├── app
├── admin
├── crm
├── ai-activity
├── page.tsx
├── bookings
├── contractors
├── [id]
├── customers
├── layout.tsx
├── dashboard
├── not-found.tsx
├── qr-generator
├── api
├── ai
├── chat
├── route.ts
├── booking
├── create-payment-intent
├── debug
├── generate-asset
├── geocode
├── memory
├── quality
├── verify-photo
├── api-debug
├── book
├── contractor
├── analytics
├── components
├── JobFeed.tsx
├── documents
├── login
├── profile
├── referrals
├── schedule
├── signup
├── error.tsx
├── favicon.ico
├── favicon.png
├── global-error.tsx
├── globals.css
├── how-it-works
├── m
├── qr
├── [service]
├── services
├── solar-analysis
├── status
├── test-gradient
├── backend
├── cloud-functions
├── memory-processor.ts
├── deploy-memory-system.sh
├── vertex-memory-system.ts
├── AIAssetGenerator.tsx
├── AIAssistant.lazy.tsx
├── AIAssistant.tsx
├── AILiveChat.tsx
├── AddressPrompt.tsx
├── AnimatedLogo.tsx
├── AuthPromptModal.tsx
├── ChatBot.tsx
├── ContractorAIAssistant.tsx
├── ContractorLiveView.tsx
├── ContractorNav.tsx
├── ContractorQuickStats.tsx
├── ContractorTracker.tsx
├── ErrorBoundary.tsx
├── FavoriteContractors.tsx
├── FeedbackFAB.tsx
├── FeedbackPanel.tsx
├── GlassNav.tsx
├── GoogleMapsLoader.tsx
├── GradientBackground.tsx
├── Home3DMap.tsx
├── MapView.tsx
├── MobileAppPromotion.tsx
├── MobileNav.tsx
├── PaymentForm.tsx
├── PersonalizedHomePage.tsx
├── ProjectProfile.tsx
├── PropertyMap3D.tsx
├── PropertyProfileManager.tsx
├── QuickActions.tsx
├── RatingPrompt.tsx
├── ReferralBanner.tsx
├── ReferralDashboard.tsx
├── ScoreDisplay.tsx
├── ServiceCard.tsx
├── ServiceCategoryRow.tsx
├── ServiceImage.tsx
├── ServiceMap3D.lazy.tsx
├── ServiceMap3D.tsx
├── SolarPotentialOverlay.tsx
├── StreamlinedBookingForm.tsx
├── UserProfile.tsx
├── ReferralTracking.tsx
├── pwa-install.tsx
├── ui
├── button.tsx
├── contexts
├── AuthContext.tsx
├── docs
├── GOOGLE_MAPS_SETUP.md
├── IMAGE_GENERATION_GUIDE.md
├── REFERRAL_FIREBASE_SCHEMA.md
├── VERCEL_AI_INTEGRATION.md
├── eslint.config.mjs
├── extracted-service-names.txt
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── functions
├── src
├── user-intelligence.ts
├── hooks
├── useAuth.ts
├── useReferralBanner.ts
├── lib
├── ai-agent.ts
├── ai-quality-verification.ts
├── animations.ts
├── claude-memory-integration.ts
├── comprehensive-services-catalog.ts
├── firebase-api.ts
├── firebase.ts
├── useCompletedProjects.ts
├── useContractors.ts
├── hybrid-memory-system.ts
├── job-assignment-algorithm.ts
├── job-matching.ts
├── leila-scoring-algorithm.ts
├── matching-engine.ts
├── payment-system.ts
├── pexels-service.ts
├── professional-service-images.ts
├── property-data-service.ts
├── quality-control-service.ts
├── realtime-matching-service.ts
├── referral
├── referral-system.ts
├── scheduling
├── contractor-matcher.ts
├── service-image-mapping.ts
├── service-images-expanded.ts
├── service-images-local.ts
├── activity-log.service.ts
├── firestore.service.ts
├── services-catalog.ts
├── services.ts
├── solar-service.ts
├── stripe-config.ts
├── types
├── activity-log.ts
├── firestore-models.js
├── firestore-models.js.map
├── firestore-models.ts
├── property-profile.ts
├── user-preferences-service.ts
├── user-profile-service.ts
├── utils
├── currency.ts
├── utils.ts
├── voice-control.ts
├── websocket-client.ts
├── next-env.d.ts
├── next.config.js
├── out
├── 404.html
├── _next
├── eevSAYANlt1J9EozYP-8H
├── static
├── chunks
├── 277-9852fd43da8910cd.js
├── 29.1918d3e3f2c61bb9.js
├── 312.b1f3b4037997cdc4.js
├── 402-45c7ce27f761c2b6.js
├── 4bd1b696-1962bfe149af46cd.js
├── 513-49ccaba12220d9f4.js
├── 684-899a14cfcb95ff7a.js
├── 699-a4b405bd32d918f5.js
├── 766-7400eea521eb3e6a.js
├── 95-b47cde7eb05f73ef.js
├── _not-found
├── page-6bf1735bae9e04ee.js
├── route-a3a8e544f118be9e.js
├── route-361a1468a25ea372.js
├── page-851c00bcce76c874.js
├── page-e4f162fc131454e0.js
├── page-9b18a51ae40294c3.js
├── page-7a4a1fd3442493b8.js
├── page-7e4fd133bbdeb55a.js
├── page-77eb209cf6ed2934.js
├── layout-3c3cbb8225713787.js
├── page-f38647c7012657d5.js
├── framework-f593a28cde54158e.js
├── main-82ec9fd0575fb4b0.js
├── main-app-35ba9140038ad59e.js
├── pages
├── _app-da15c11dea942c36.js
├── _error-cc3f077a18ea1793.js
├── polyfills-42372ed130431b0a.js
├── webpack-680c4f670df7de80.js
├── css
├── ffbece30652915c6.css
├── _ssgManifest.js
├── media
├── 569ce4b8f30dc480-s.p.woff2
├── 747892c23ea88013-s.woff2
├── 8d697b304b401681-s.woff2
├── 93f479601ee12b01-s.p.woff2
├── 9610d9e46709d722-s.woff2
├── ba015fad6dcf6784-s.woff2
├── analytics.html
├── analytics.txt
├── dashboard.html
├── dashboard.txt
├── login.html
├── login.txt
├── profile.html
├── profile.txt
├── schedule.html
├── schedule.txt
├── signup.html
├── signup.txt
├── index.html
├── index.txt
├── leila-logo-simple.svg
├── leila-logo.png
├── leila-logo.svg
├── logo.svg
├── manifest.json
├── service-worker.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
├── .well-known
├── apple-app-site-association
├── assets
├── categories
├── services
├── favicon-new.ico
├── images
├── logo-new.svg
├── shared-assets
├── scripts
├── ai-graphic-designer.ts
├── ai-image-generator.ts
├── continue-imagen2-generation.ts
├── download-images.sh
├── download-service-images.ts
├── gemini-image-generator.ts
├── generate-ai-images.ts
├── generate-all-missing-services.ts
├── generate-all-service-images.ts
├── generate-asset.ts
├── generate-better-placeholders.js
├── generate-final-categories.ts
├── generate-priority-services.ts
├── generate-pro-images.ts
├── generate-remaining-services.ts
├── generate-service-images.ts
├── generate-services-cloud.ts
├── generate-services-concurrent.ts
├── google-image-generator.ts
├── google-imagen-simple.ts
├── google-imagen2-no-people.ts
├── google-imagen2-premium.ts
├── premium-image-generator.ts
├── process-downloaded-images.js
├── run-image-generation.js
├── services-list.txt
├── sync-to-gemini.ts
├── test-image.png
├── test-imagen.ts
├── update-service-images.ts
├── vertex-ai-image-generator.ts
├── tailwind.config.js
├── test-memory-system.ts
├── tsconfig.json
├── google-maps.d.ts
├── vercel-env-vars.txt
└── vercel.json


## Recent Changes
- ✅ AI-powered image generation (1,400+ images)
- ✅ Vertex AI memory system integration
- ✅ Simplified navigation and mobile UX
- ✅ Stripe payment integration

## Active Features
1. **Customer App** (heyleila.com)
   - AI-powered service matching
   - Voice control ("Hey Leila")
   - Real-time chat
   - PWA with offline support

2. **Contractor Dashboard** (/contractor)
   - Live job feed
   - Analytics dashboard
   - Schedule management
   - Commission tiers (10-30%)

3. **Admin CRM** (/admin/crm)
   - Customer management
   - Contractor management
   - Booking oversight
   - AI activity monitoring

## Memory System Active
- Gemini 2.5 Pro: Deep analysis (2M+ tokens)
- Gemini 2.5 Flash: Fast retrieval (1M+ tokens)
- Full codebase stored and indexed
- Semantic search enabled

## Quick Commands
```bash
npm run dev          # Start development
npm run build        # Build for production
npm run deploy       # Deploy to Vercel
npx tsx test-memory-system.ts  # Test memory system
```

## Important Notes
- All AI contexts stored in Gemini
- Use claudeMemory.analyze() for deep analysis
- Images exceed Vercel limit (210MB > 100MB)
- Consider CDN or Vercel Pro upgrade