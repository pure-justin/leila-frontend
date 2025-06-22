export interface PropertyProfile {
  id: string;
  userId: string;
  name: string; // e.g., "Main Home", "Beach House", "Office"
  type: 'home' | 'business' | 'rental' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  details: {
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    propertyType?: 'single_family' | 'condo' | 'apartment' | 'townhouse' | 'commercial';
    specialInstructions?: string; // Gate codes, parking info, etc.
  };
  preferences: {
    preferredServiceTimes?: string[]; // e.g., "weekday_mornings", "weekends"
    petFriendly?: boolean;
    allergies?: string[];
    accessInstructions?: string;
  };
  images?: string[];
  isDefault: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickProfileTemplate {
  id: string;
  name: string;
  icon: string;
  type: PropertyProfile['type'];
  quickSetup: {
    questions: Array<{
      id: string;
      question: string;
      type: 'text' | 'select' | 'number' | 'boolean';
      options?: string[];
      required: boolean;
    }>;
  };
}