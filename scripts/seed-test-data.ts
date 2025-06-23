import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { UserRole, BookingStatus, ContractorStatus, PaymentMethod, PaymentStatus } from '../lib/types/firestore-models';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
let app;
try {
  // Check if we have service account credentials
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } else {
    // Use default credentials (for Firebase emulator or Google Cloud)
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
  process.exit(1);
}

const auth = getAuth(app);
const db = getFirestore(app);

// Test user data
const testUsers = [
  {
    email: 'customer1@test.com',
    password: 'TestPass123!',
    displayName: 'John Customer',
    role: UserRole.CUSTOMER,
    phoneNumber: '+1234567890'
  },
  {
    email: 'customer2@test.com',
    password: 'TestPass123!',
    displayName: 'Jane Customer',
    role: UserRole.CUSTOMER,
    phoneNumber: '+1234567891'
  },
  {
    email: 'contractor1@test.com',
    password: 'TestPass123!',
    displayName: 'Bob Contractor',
    role: UserRole.CONTRACTOR,
    phoneNumber: '+1234567892'
  },
  {
    email: 'contractor2@test.com',
    password: 'TestPass123!',
    displayName: 'Alice Contractor',
    role: UserRole.CONTRACTOR,
    phoneNumber: '+1234567893'
  },
  {
    email: 'admin@test.com',
    password: 'TestPass123!',
    displayName: 'Admin User',
    role: UserRole.ADMIN,
    phoneNumber: '+1234567894'
  }
];

// Test services
const testServices = [
  {
    id: 'plumbing-repair',
    name: 'Plumbing Repair',
    category: 'plumbing',
    description: 'Professional plumbing repair services',
    basePrice: 85,
    priceRange: { min: 75, max: 250 },
    estimatedDuration: 120,
    active: true,
    popular: true,
    searchKeywords: ['plumbing', 'repair', 'leak', 'pipe']
  },
  {
    id: 'electrical-repair',
    name: 'Electrical Repair',
    category: 'electrical',
    description: 'Licensed electrical repair services',
    basePrice: 95,
    priceRange: { min: 85, max: 300 },
    estimatedDuration: 90,
    active: true,
    popular: true,
    searchKeywords: ['electrical', 'repair', 'wiring', 'outlet']
  },
  {
    id: 'house-cleaning',
    name: 'House Cleaning',
    category: 'cleaning',
    description: 'Thorough house cleaning services',
    basePrice: 120,
    priceRange: { min: 80, max: 200 },
    estimatedDuration: 180,
    active: true,
    popular: true,
    searchKeywords: ['cleaning', 'house', 'maid', 'home']
  }
];

async function createTestUser(userData: any) {
  try {
    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber
    });

    console.log(`Created auth user: ${userData.email}`);

    // Create Firestore user profile
    const userProfile = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: true,
          marketing: false
        },
        language: 'en',
        timezone: 'America/Los_Angeles'
      },
      analytics: {
        totalBookings: 0,
        totalSpent: 0,
        averageRating: 0,
        lastActive: FieldValue.serverTimestamp()
      }
    };

    await db.collection('users').doc(userRecord.uid).set(userProfile);
    console.log(`Created Firestore profile for: ${userData.email}`);

    // If contractor, create contractor profile
    if (userData.role === UserRole.CONTRACTOR) {
      const contractorProfile = {
        userId: userRecord.uid,
        businessName: `${userData.displayName}'s Services`,
        businessEmail: userData.email,
        businessPhone: userData.phoneNumber,
        status: ContractorStatus.ACTIVE,
        verified: true,
        services: ['plumbing-repair', 'electrical-repair'],
        serviceAreas: ['San Francisco', 'Oakland', 'San Jose'],
        availability: {
          schedule: {
            monday: { start: '08:00', end: '18:00', available: true },
            tuesday: { start: '08:00', end: '18:00', available: true },
            wednesday: { start: '08:00', end: '18:00', available: true },
            thursday: { start: '08:00', end: '18:00', available: true },
            friday: { start: '08:00', end: '18:00', available: true },
            saturday: { start: '09:00', end: '14:00', available: true },
            sunday: { start: '00:00', end: '00:00', available: false }
          },
          instantBooking: true,
          advanceBookingDays: 30
        },
        pricing: {
          hourlyRate: 85,
          callOutFee: 50,
          emergencyMultiplier: 1.5
        },
        rating: {
          average: 4.5,
          count: 10
        },
        analytics: {
          totalJobs: 0,
          totalRevenue: 0,
          completionRate: 100,
          responseTime: 30,
          lastActive: FieldValue.serverTimestamp()
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await db.collection('contractors').doc(userRecord.uid).set(contractorProfile);
      console.log(`Created contractor profile for: ${userData.email}`);
    }

    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`User already exists: ${userData.email}`);
      // Get existing user
      const existingUser = await auth.getUserByEmail(userData.email);
      return existingUser;
    }
    throw error;
  }
}

async function createTestServices() {
  console.log('\nCreating test services...');
  
  for (const service of testServices) {
    try {
      await db.collection('services').doc(service.id).set({
        ...service,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      console.log(`Created service: ${service.name}`);
    } catch (error) {
      console.error(`Failed to create service ${service.name}:`, error);
    }
  }
}

async function createTestBookings(customerUids: string[], contractorUids: string[]) {
  console.log('\nCreating test bookings...');
  
  const bookings = [
    {
      customerId: customerUids[0],
      contractorId: contractorUids[0],
      serviceId: 'plumbing-repair',
      status: BookingStatus.CONFIRMED,
      scheduledDate: Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)), // 2 days from now
      scheduledTime: '10:00',
      duration: 120,
      pricing: {
        basePrice: 85,
        additionalCharges: [],
        discount: 0,
        tax: 8.5,
        total: 93.5
      },
      address: {
        street: '123 Main St',
        unit: 'Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94110',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      payment: {
        method: PaymentMethod.CARD,
        status: PaymentStatus.PAID,
        transactionId: 'test_transaction_1'
      },
      notes: 'Kitchen sink is leaking',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    {
      customerId: customerUids[1],
      contractorId: contractorUids[1],
      serviceId: 'house-cleaning',
      status: BookingStatus.PENDING,
      scheduledDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
      scheduledTime: '14:00',
      duration: 180,
      pricing: {
        basePrice: 120,
        additionalCharges: [],
        discount: 10,
        tax: 11,
        total: 121
      },
      address: {
        street: '456 Oak Ave',
        city: 'Oakland',
        state: 'CA',
        zipCode: '94610',
        coordinates: { lat: 37.8044, lng: -122.2711 }
      },
      payment: {
        method: PaymentMethod.CARD,
        status: PaymentStatus.PENDING
      },
      notes: 'Deep clean for 3 bedroom house',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }
  ];

  for (const booking of bookings) {
    try {
      const docRef = await db.collection('bookings').add(booking);
      console.log(`Created booking: ${docRef.id}`);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  }
}

async function testConnections() {
  console.log('\n=== Testing Firebase Connections ===\n');
  
  // Test Firestore connection
  try {
    const testDoc = await db.collection('_test').add({
      timestamp: FieldValue.serverTimestamp(),
      test: true
    });
    console.log('✅ Firestore connection successful');
    // Clean up test doc
    await testDoc.delete();
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
  }

  // Test Auth connection
  try {
    const users = await auth.listUsers(1);
    console.log('✅ Firebase Auth connection successful');
  } catch (error) {
    console.error('❌ Firebase Auth connection failed:', error);
  }

  // Test if APIs are properly configured
  console.log('\n=== Checking API Configuration ===\n');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar} is configured`);
    } else {
      console.log(`❌ ${envVar} is missing`);
    }
  }
}

async function main() {
  try {
    console.log('Starting test data seeding...\n');

    // Test connections first
    await testConnections();

    // Create services
    await createTestServices();

    // Create test users
    console.log('\nCreating test users...');
    const customerUids: string[] = [];
    const contractorUids: string[] = [];

    for (const userData of testUsers) {
      try {
        const user = await createTestUser(userData);
        if (userData.role === UserRole.CUSTOMER) {
          customerUids.push(user.uid);
        } else if (userData.role === UserRole.CONTRACTOR) {
          contractorUids.push(user.uid);
        }
      } catch (error) {
        console.error(`Failed to create user ${userData.email}:`, error);
      }
    }

    // Create test bookings
    if (customerUids.length > 0 && contractorUids.length > 0) {
      await createTestBookings(customerUids, contractorUids);
    }

    console.log('\n✅ Test data seeding completed!');
    console.log('\nTest credentials:');
    console.log('Customer: customer1@test.com / TestPass123!');
    console.log('Contractor: contractor1@test.com / TestPass123!');
    console.log('Admin: admin@test.com / TestPass123!');

  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

// Run the script
main();