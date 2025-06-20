'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedLogo from '@/components/AnimatedLogo';
import GradientBackground from '@/components/GradientBackground';

export default function ContractorLogin() {
  const router = useRouter();
  const { user, signIn, signInWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/contractor/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        // Sign up new contractor
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const { auth, db } = await import('@/lib/firebase');
        const { doc, setDoc, Timestamp } = await import('firebase/firestore');
        
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update display name
        await updateProfile(result.user, { displayName: formData.displayName });
        
        // Create user document
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: formData.displayName,
          createdAt: Timestamp.now(),
          role: 'contractor',
          currentMode: 'contractor',
        });
        
        // Create contractor profile
        await setDoc(doc(db, 'contractors', result.user.uid), {
          userId: result.user.uid,
          email: result.user.email,
          displayName: formData.displayName,
          firstName: formData.displayName.split(' ')[0] || '',
          lastName: formData.displayName.split(' ').slice(1).join(' ') || '',
          status: 'pending',
          createdAt: Timestamp.now(),
          verified: false,
          rating: 0,
          totalReviews: 0,
          completedJobs: 0,
          services: [],
          serviceAreas: [],
        });
        
        router.push('/contractor/profile');
      } else {
        // Sign in existing contractor
        await signIn(formData.email, formData.password);
        router.push('/contractor/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      router.push('/contractor/dashboard');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground variant="animated" className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back to Home */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/" className="inline-flex items-center space-x-2">
            <motion.div 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              className="text-purple-600 hover:text-purple-700 transition-colors flex items-center space-x-2"
            >
              <AnimatedLogo size={24} animate={false} />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Back to Home</span>
            </motion.div>
          </Link>
        </motion.div>
        
        {/* Logo */}
        <motion.div 
          className="text-center mb-6 md:mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Link href="/" className="inline-block">
            <AnimatedLogo size={96} />
          </Link>
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? 'signup' : 'signin'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-4">
                {isSignUp ? 'Join as a Contractor' : 'Welcome Back, Pro'}
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                {isSignUp ? 'Create your contractor account' : 'Sign in to access your contractor dashboard'}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Login Form */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border border-purple-100"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.01 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base transition-all duration-300 hover:border-purple-300"
                      placeholder="John Smith"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base transition-all duration-300 hover:border-purple-300"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
              >
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3 py-2.5 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base transition-all duration-300 hover:border-purple-300"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {!isSignUp && (
                <motion.div 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link href="/contractor/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                    Forgot password?
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="text-sm text-red-600 bg-red-50 p-3 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 py-2.5 md:py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div className="flex items-center justify-center">
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {isSignUp ? 'Creating Account...' : 'Signing in...'}
                  </motion.div>
                ) : (
                  <motion.span className="flex items-center justify-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {isSignUp ? 'Already have an account?' : 'New to Leila?'}
              </span>
            </div>
          </div>

          {/* Toggle Sign Up/Sign In */}
          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                type="button"
                variant="outline" 
                className="w-full hover:border-purple-300 hover:text-purple-600 transition-all duration-300"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
              >
                {isSignUp ? 'Sign In Instead' : 'Create Contractor Account'}
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Google Sign In */}
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center hover:border-purple-300 transition-all duration-300"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>
            </motion.div>
          </motion.div>

          {/* Demo Access */}
          <AnimatePresence>
            {!isSignUp && (
              <motion.div 
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, email: 'demo@contractor.com', password: 'demo123' });
                  }}
                  className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Use demo credentials
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-6 md:mt-8 text-center text-xs md:text-sm text-gray-600 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p>
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </GradientBackground>
  );
}