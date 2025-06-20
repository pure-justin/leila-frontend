'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          // Create user document if it doesn't exist
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            createdAt: Timestamp.now(),
            role: 'customer',
            currentMode: 'customer',
          });
        }
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastLogin: Timestamp.now(),
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        createdAt: Timestamp.now(),
        role: 'customer',
        currentMode: 'customer',
      });
      
      // Create contractor profile if signing up as contractor
      if (window.location.pathname.includes('contractor')) {
        await setDoc(doc(db, 'contractors', result.user.uid), {
          userId: result.user.uid,
          email: result.user.email,
          displayName,
          firstName: displayName.split(' ')[0] || '',
          lastName: displayName.split(' ').slice(1).join(' ') || '',
          status: 'pending',
          createdAt: Timestamp.now(),
          verified: false,
          rating: 0,
          totalReviews: 0,
          completedJobs: 0,
          services: [],
          serviceAreas: [],
          availability: {
            monday: { available: true, start: '08:00', end: '18:00' },
            tuesday: { available: true, start: '08:00', end: '18:00' },
            wednesday: { available: true, start: '08:00', end: '18:00' },
            thursday: { available: true, start: '08:00', end: '18:00' },
            friday: { available: true, start: '08:00', end: '18:00' },
            saturday: { available: false, start: '09:00', end: '14:00' },
            sunday: { available: false, start: '09:00', end: '14:00' },
          },
        });
        
        // Update user role
        await updateDoc(doc(db, 'users', result.user.uid), {
          role: 'contractor',
          currentMode: 'contractor',
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        // Create user document
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          photoURL: result.user.photoURL || '',
          createdAt: Timestamp.now(),
          role: 'customer',
          currentMode: 'customer',
        });
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', result.user.uid), {
          lastLogin: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    
    try {
      // Update auth profile if display name changed
      if (data.displayName && data.displayName !== user.displayName) {
        await updateProfile(user, { displayName: data.displayName });
      }
      
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      updateUserProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}