# Leila Home Service Platform - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Data Flow](#data-flow)
5. [Component Hierarchy](#component-hierarchy)
6. [API Structure](#api-structure)
7. [Authentication Flow](#authentication-flow)
8. [Image Generation Pipeline](#image-generation-pipeline)

## System Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>Next.js 14]
        MOBILE[Mobile Web<br/>PWA]
        NATIVE[Native Apps<br/>React Native]
    end
    
    subgraph "API Layer"
        NEXTAPI[Next.js API Routes]
        FIREBASE[Firebase Functions]
    end
    
    subgraph "Services"
        AUTH[Firebase Auth]
        DB[(Firestore)]
        STORAGE[Firebase Storage]
        GEMINI[Gemini AI]
        IMAGEN[Google Imagen 2]
        STRIPE[Stripe Payments]
    end
    
    subgraph "External"
        VERCEL[Vercel Hosting]
        GCLOUD[Google Cloud]
    end
    
    WEB --> NEXTAPI
    MOBILE --> NEXTAPI
    NATIVE --> FIREBASE
    
    NEXTAPI --> AUTH
    NEXTAPI --> DB
    NEXTAPI --> GEMINI
    NEXTAPI --> IMAGEN
    NEXTAPI --> STRIPE
    
    FIREBASE --> DB
    FIREBASE --> GEMINI
    FIREBASE --> AUTH
    
    WEB --> VERCEL
    NEXTAPI --> GCLOUD
```

## Frontend Architecture

### Page Structure
```mermaid
graph TD
    subgraph "Public Pages"
        HOME[/ - Home Page<br/>PersonalizedHomePage]
        SERVICES[/services/* - Service Details]
        HOW[/how-it-works - How It Works]
        ERROR404[404 Pages]
    end
    
    subgraph "Contractor Pages"
        CDASH[/contractor/dashboard]
        CPROFILE[/contractor/profile]
        CSIGNUP[/contractor/signup]
        CLOGIN[/contractor/login]
    end
    
    subgraph "Admin Pages"
        CRM[/admin/crm/*]
        CUSTOMERS[/admin/crm/customers]
        CONTRACTORS[/admin/crm/contractors]
        BOOKINGS[/admin/crm/bookings]
        AI_ACTIVITY[/admin/crm/ai-activity]
    end
```

### Component Hierarchy
```mermaid
graph TD
    APP[app/layout.tsx]
    APP --> NAV[Navigation Components]
    APP --> PAGES[Page Components]
    
    NAV --> GLASS[GlassNav]
    NAV --> MOBILE[MobileNav]
    
    PAGES --> HOME_PAGE[PersonalizedHomePage]
    HOME_PAGE --> SERVICE_ROW[ServiceCategoryRow]
    HOME_PAGE --> QUICK[QuickActions]
    HOME_PAGE --> SEARCH[Search Component]
    
    SERVICE_ROW --> BOOKING_FORM[StreamlinedBookingForm]
    BOOKING_FORM --> PROPERTY[PropertyProfileManager]
    BOOKING_FORM --> PAYMENT[PaymentForm]
    BOOKING_FORM --> AUTH_MODAL[AuthPromptModal]
    
    APP --> CHAT[AILiveChat]
    APP --> FEEDBACK[FeedbackFAB]
```

## Backend Architecture

### API Routes Structure
```mermaid
graph LR
    subgraph "API Routes (/app/api)"
        AI[/ai/chat - Gemini Chat API]
        ASSET[/generate-asset - Image Generation]
        PAYMENT[/create-payment-intent - Stripe]
    end
    
    subgraph "Firebase Functions"
        PROCESS_CHAT[processAIChat]
        PROCESS_FEEDBACK[processFeedback]
        USER_INTEL[userIntelligence]
    end
```

### Data Models
```mermaid
classDiagram
    class User {
        +string uid
        +string email
        +string displayName
        +string role
        +timestamp createdAt
    }
    
    class Booking {
        +string id
        +string customerId
        +string contractorId
        +string serviceId
        +string status
        +number amount
        +timestamp scheduledDate
    }
    
    class Service {
        +string id
        +string name
        +string category
        +number basePrice
        +string priceUnit
        +array images
    }
    
    class PropertyProfile {
        +string id
        +string userId
        +string name
        +object address
        +string type
        +object details
    }
    
    User "1" --> "*" Booking : creates
    User "1" --> "*" PropertyProfile : owns
    Booking "*" --> "1" Service : for
```

## Data Flow

### Booking Flow
```mermaid
sequenceDiagram
    participant U as User
    participant UI as PersonalizedHomePage
    participant BF as StreamlinedBookingForm
    participant API as API Routes
    participant FB as Firebase
    participant S as Stripe
    
    U->>UI: Browse Services
    UI->>UI: Display ServiceCategoryRow
    U->>UI: Select Service
    UI->>BF: Open Booking Form
    
    BF->>BF: Select Property
    BF->>BF: Choose Schedule
    BF->>API: Create Payment Intent
    API->>S: Initialize Payment
    S-->>API: Return Client Secret
    API-->>BF: Payment Ready
    
    U->>BF: Complete Payment
    BF->>S: Process Payment
    S-->>BF: Payment Success
    
    BF->>FB: Create Booking
    FB-->>BF: Booking Created
    BF->>U: Show Confirmation
```

### AI Chat Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as AILiveChat
    participant FF as Firebase Function
    participant G as Gemini AI
    participant DB as Firestore
    
    U->>C: Send Message
    C->>FF: processAIChat()
    
    FF->>DB: Get User Context
    DB-->>FF: User Data
    
    FF->>G: Generate Response
    G-->>FF: AI Response
    
    FF->>DB: Log Interaction
    FF-->>C: Return Response
    C->>U: Display Response
```

## Component Communication

### State Management
```mermaid
graph TD
    subgraph "Global State"
        AUTH_CTX[AuthContext]
        THEME[Theme Context]
    end
    
    subgraph "Local State"
        SEARCH_STATE[Search Query]
        BOOKING_STATE[Booking Data]
        PROPERTY_STATE[Selected Property]
    end
    
    subgraph "Persistent Storage"
        LOCAL[localStorage]
        FIREBASE_DB[Firestore]
    end
    
    AUTH_CTX --> LOCAL
    PROPERTY_STATE --> LOCAL
    BOOKING_STATE --> FIREBASE_DB
```

## Image Generation Pipeline

```mermaid
graph LR
    subgraph "Generation Tools"
        CLI[AI Designer CLI]
        API_GEN[API Generator]
        BATCH[Batch Scripts]
    end
    
    subgraph "Google Cloud"
        IMAGEN[Imagen 2 API]
        AUTH_GCLOUD[GCloud Auth]
    end
    
    subgraph "Output"
        IMAGES[/public/images/services/]
        CATALOG[image-catalog.json]
    end
    
    CLI --> AUTH_GCLOUD
    API_GEN --> AUTH_GCLOUD
    BATCH --> AUTH_GCLOUD
    
    AUTH_GCLOUD --> IMAGEN
    IMAGEN --> IMAGES
    BATCH --> CATALOG
```

## Authentication Flow

```mermaid
stateDiagram-v2
    [*] --> Anonymous
    Anonymous --> SignInModal : Click Protected Feature
    
    SignInModal --> EmailAuth : Choose Email
    SignInModal --> GoogleAuth : Choose Google
    
    EmailAuth --> Authenticated : Success
    GoogleAuth --> Authenticated : Success
    
    Authenticated --> CustomerView : Default
    Authenticated --> ContractorView : Switch Mode
    
    CustomerView --> BookService
    CustomerView --> ViewBookings
    CustomerView --> ManageProperties
    
    ContractorView --> Dashboard
    ContractorView --> ManageJobs
    ContractorView --> ViewAnalytics
```

## Key Design Decisions

### 1. **Single Source of Truth**
- All service data comes from `comprehensive-services-catalog.ts`
- All images are AI-generated and stored in `/public/images/services/`
- User authentication state managed by Firebase Auth

### 2. **Component Reusability**
- `ServiceCategoryRow` used throughout for service display
- `StreamlinedBookingForm` handles all booking flows
- `AILiveChat` provides consistent chat experience

### 3. **Performance Optimizations**
- Image lazy loading with Next.js Image component
- Code splitting by route
- PWA for offline support

### 4. **Security**
- API keys server-side only (no NEXT_PUBLIC for sensitive data)
- Firebase security rules for data access
- Stripe for secure payment processing

## Maintenance Guidelines

### Adding New Features
1. Check this architecture diagram first
2. Identify if similar functionality exists
3. Reuse existing components when possible
4. Update diagrams after implementation

### Common Pitfalls to Avoid
- ❌ Creating duplicate API endpoints
- ❌ Adding new chat implementations
- ❌ Creating separate booking forms
- ❌ Hardcoding service data
- ❌ Using stock images instead of AI-generated

### Current Status
- ✅ 211+ AI-generated service images
- ✅ Unified booking system
- ✅ Single AI chat implementation
- ✅ Consolidated navigation
- ✅ Removed duplicate components