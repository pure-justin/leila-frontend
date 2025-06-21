/**
 * Firestore Data Models
 * 
 * This file contains all TypeScript interfaces and enums for Firestore collections.
 * These models are shared between the frontend, CRM, and API.
 */

// ============= ENUMS =============

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  CONTRACTOR = 'CONTRACTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}

export enum ServiceCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HVAC = 'HVAC',
  CLEANING = 'CLEANING',
  HANDYMAN = 'HANDYMAN',
  PAINTING = 'PAINTING',
  GARDENING = 'GARDENING',
  PEST_CONTROL = 'PEST_CONTROL',
  APPLIANCE_REPAIR = 'APPLIANCE_REPAIR',
  CARPENTRY = 'CARPENTRY',
  ROOFING = 'ROOFING',
  FLOORING = 'FLOORING'
}

export enum BookingStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  PAYPAL = 'PAYPAL'
}

export enum ContractorTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum NotificationPreference {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

// ============= INTERFACES =============

// User preferences for personalization
export interface UserPreferences {
  notifications: {
    marketing: boolean;
    bookingUpdates: boolean;
    promotions: boolean;
    methods: NotificationPreference[];
  };
  service: {
    preferredCategories: ServiceCategory[];
    preferredTimeSlots: string[]; // e.g., ["morning", "afternoon", "evening"]
    preferredDays: DayOfWeek[];
    budgetRange: {
      min: number;
      max: number;
    };
  };
  location: {
    preferredRadius: number; // in miles
    savedAddresses: Address[];
  };
  communication: {
    preferredLanguage: string;
    preferredContactMethod: 'phone' | 'email' | 'chat';
  };
}

// Address sub-document
export interface Address {
  id: string;
  label: string; // e.g., "Home", "Office"
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}

// Base user interface
export interface BaseUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  preferences: UserPreferences;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    source: 'web' | 'mobile' | 'admin' | 'import';
    ipAddress?: string;
    userAgent?: string;
  };
  analytics: {
    totalBookings: number;
    totalSpent: number;
    averageRating: number;
    lastBookingDate?: Date;
    acquisitionChannel?: string;
    lifetime_value: number;
  };
  stripeCustomerId?: string;
  fcmTokens?: string[]; // Firebase Cloud Messaging tokens
}

// Customer-specific fields
export interface Customer extends BaseUser {
  role: UserRole.CUSTOMER;
  favoriteContractors: string[]; // contractor IDs
  blockedContractors: string[]; // contractor IDs
  referralCode: string;
  referredBy?: string;
  loyaltyPoints: number;
}

// Contractor-specific fields
export interface Contractor extends BaseUser {
  role: UserRole.CONTRACTOR;
  businessInfo: {
    companyName: string;
    businessType: 'individual' | 'company';
    taxId?: string;
    licenseNumber?: string;
    insuranceNumber?: string;
    bondNumber?: string;
  };
  services: {
    categories: ServiceCategory[];
    specializations: string[];
    specialties?: string[]; // Added for compatibility
    serviceRadius: number; // in miles
    instantBooking: boolean;
    minimumJobAmount: number;
  };
  vehicle?: string; // Added for compatibility
  availability: {
    workingHours: {
      [key in DayOfWeek]?: {
        isAvailable: boolean;
        startTime: string; // "09:00"
        endTime: string; // "17:00"
        breaks?: Array<{
          startTime: string;
          endTime: string;
        }>;
      };
    };
    vacationMode: boolean;
    vacationEndDate?: Date;
  };
  verification: {
    identity: VerificationStatus;
    license: VerificationStatus;
    insurance: VerificationStatus;
    background: VerificationStatus;
    documents: Array<{
      type: string;
      url: string;
      uploadedAt: Date;
      verifiedAt?: Date;
      expiresAt?: Date;
    }>;
  };
  tier: ContractorTier;
  ratings: {
    overall: number;
    punctuality: number;
    quality: number;
    communication: number;
    value: number;
    totalReviews: number;
  };
  performance: {
    completionRate: number;
    responseTime: number; // in minutes
    acceptanceRate: number;
    cancellationRate: number;
    onTimeRate: number;
  };
  banking: {
    stripeAccountId?: string;
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
    preferredPayoutMethod: 'bank' | 'card';
  };
  team: Array<{
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    photoURL?: string;
  }>;
}

// Service definition
export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  basePrice: number;
  priceType: 'fixed' | 'hourly' | 'quote';
  duration: number; // in minutes
  images: string[];
  active: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  };
}

// Booking/Job model
export interface Booking {
  id: string;
  customerId: string;
  contractorId?: string;
  serviceId: string;
  status: BookingStatus;
  
  details: {
    category: ServiceCategory;
    description: string;
    images: string[];
    urgency: 'low' | 'normal' | 'high' | 'emergency';
  };
  
  schedule: {
    requestedDate: Date;
    requestedTimeSlot: string;
    confirmedDate?: Date;
    startedAt?: Date;
    completedAt?: Date;
    duration?: number; // actual duration in minutes
  };
  
  location: Address;
  
  pricing: {
    estimatedAmount: number;
    finalAmount?: number;
    breakdown: Array<{
      description: string;
      amount: number;
      type: 'service' | 'material' | 'labor' | 'fee' | 'discount';
    }>;
    tip?: number;
  };
  
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    stripePaymentIntentId?: string;
    paidAt?: Date;
  };
  
  communication: {
    notes?: string;
    messages: Array<{
      senderId: string;
      content: string;
      timestamp: Date;
      type: 'text' | 'image' | 'voice';
    }>;
  };
  
  rating?: {
    overall: number;
    punctuality: number;
    quality: number;
    communication: number;
    value: number;
    review?: string;
    reviewedAt: Date;
  };
  
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    source: 'web' | 'mobile' | 'phone' | 'admin';
    deviceInfo?: string;
    ipAddress?: string;
  };
}

// API Key model
export interface ApiKey {
  id: string;
  key: string; // hashed
  name: string;
  description?: string;
  userId: string;
  permissions: string[];
  rateLimit: {
    requests: number;
    period: 'minute' | 'hour' | 'day';
  };
  usage: {
    totalRequests: number;
    lastUsedAt?: Date;
    monthlyRequests: { [key: string]: number }; // "2024-01": 1234
  };
  whitelist?: {
    ips?: string[];
    domains?: string[];
  };
  active: boolean;
  expiresAt?: Date;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

// Promotion/Offer model for targeted marketing
export interface Promotion {
  id: string;
  name: string;
  description: string;
  code?: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_service';
  value: number;
  
  targeting: {
    userSegments: string[]; // e.g., "new_users", "high_value", "dormant"
    serviceCategories: ServiceCategory[];
    minOrderValue?: number;
    maxDiscount?: number;
    locations?: string[]; // zip codes or city names
  };
  
  validity: {
    startDate: Date;
    endDate: Date;
    usageLimit?: number;
    usagePerUser?: number;
    daysOfWeek?: DayOfWeek[];
    timeSlots?: string[];
  };
  
  usage: {
    totalUsed: number;
    userIds: string[];
  };
  
  active: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

// Analytics Event model for tracking
export interface AnalyticsEvent {
  id: string;
  userId: string;
  event: string;
  properties: { [key: string]: any };
  timestamp: Date;
  sessionId: string;
  platform: 'web' | 'ios' | 'android';
  version: string;
}

// Notification model
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  read: boolean;
  sentAt: Date;
  readAt?: Date;
  channels: NotificationPreference[];
}