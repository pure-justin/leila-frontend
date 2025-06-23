'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, MessageSquare, CheckCircle, Star, Shield, 
  Clock, DollarSign, Smartphone, Home, Users, TrendingUp, Award,
  Play, Pause, ArrowRight, Zap, Heart, Globe,
  FileCheck, Camera
} from 'lucide-react';
import GlassNav from '@/components/GlassNav';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

export default function HowItWorksPage() {
  const [activeView, setActiveView] = useState<'customer' | 'contractor'>('customer');
  const [playingVideo, setPlayingVideo] = useState(false);

  const customerSteps = [
    {
      number: 1,
      title: "Say 'Hey Leila'",
      description: "Simply speak or type what you need. Our AI assistant understands natural language and helps find the perfect service.",
      icon: MessageSquare,
      color: 'from-purple-500 to-indigo-500',
      features: ['Voice or text input', 'Natural conversation', 'Instant understanding']
    },
    {
      number: 2,
      title: "Get Matched Instantly",
      description: "Our algorithm analyzes your needs and matches you with the best available professionals in real-time.",
      icon: Zap,
      color: 'from-indigo-500 to-blue-500',
      features: ['Smart matching', 'Real-time availability', 'Quality guaranteed']
    },
    {
      number: 3,
      title: "Track Your Pro",
      description: "Watch your service provider arrive in real-time with our live tracking, just like your favorite delivery apps.",
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      features: ['Live GPS tracking', 'ETA updates', 'Direct messaging']
    },
    {
      number: 4,
      title: "Approve & Pay",
      description: "Review the completed work, approve it through the app, and pay securely. It's that simple!",
      icon: CheckCircle,
      color: 'from-cyan-500 to-green-500',
      features: ['Photo verification', 'Secure payments', 'Instant receipts']
    }
  ];

  const contractorSteps = [
    {
      number: 1,
      title: "Join Our Network",
      description: "Sign up, verify your credentials, and showcase your expertise to thousands of potential customers.",
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
      features: ['Quick onboarding', 'Credential verification', 'Profile optimization']
    },
    {
      number: 2,
      title: "Get Job Alerts",
      description: "Receive real-time notifications for jobs that match your skills and availability.",
      icon: Smartphone,
      color: 'from-indigo-500 to-blue-500',
      features: ['Smart job matching', 'Instant notifications', 'Flexible scheduling']
    },
    {
      number: 3,
      title: "Complete Quality Work",
      description: "Arrive on time, do great work, and submit photos for AI-powered quality verification.",
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      features: ['AI quality checks', 'Photo documentation', 'Customer satisfaction']
    },
    {
      number: 4,
      title: "Get Paid Fast",
      description: "Once approved, receive payment directly to your account. Build your reputation and grow your business.",
      icon: DollarSign,
      color: 'from-cyan-500 to-green-500',
      features: ['Fast payments', 'Performance bonuses', 'Business growth']
    }
  ];

  const benefits = {
    customer: [
      { icon: Shield, title: 'Verified Professionals', description: 'All contractors are background checked and insured' },
      { icon: Clock, title: 'Save Time', description: 'Book services in seconds, not hours' },
      { icon: Star, title: 'Quality Guaranteed', description: 'AI-powered quality verification on every job' },
      { icon: Heart, title: 'Fair Pricing', description: 'Transparent quotes with no hidden fees' }
    ],
    contractor: [
      { icon: TrendingUp, title: 'Grow Your Business', description: 'Access thousands of customers instantly' },
      { icon: Award, title: 'Performance Rewards', description: 'Earn more with our tiered commission system' },
      { icon: FileCheck, title: 'Easy Management', description: 'Handle everything from one dashboard' },
      { icon: Shield, title: 'Protected Payments', description: 'Guaranteed payment for completed work' }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-indigo-50">
      {/* Navigation */}
      <GlassNav />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 opacity-10" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-20"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%' 
              }}
              animate={{
                x: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%'
                ],
                y: [
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%',
                  Math.random() * 100 + '%'
                ]
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 mt-16">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="w-4 h-4" />
              AI-Powered Home Services
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              How{' '}
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Leila
              </span>
              {' '}Works
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Experience the future of home services. From booking to completion, 
              we've reimagined every step to be faster, smarter, and more reliable.
            </p>

            {/* View Toggle */}
            <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-12">
              <button
                onClick={() => setActiveView('customer')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'customer'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Home className="w-5 h-5 inline mr-2" />
                I'm a Customer
              </button>
              <button
                onClick={() => setActiveView('contractor')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeView === 'contractor'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                I'm a Contractor
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {(activeView === 'customer' ? customerSteps : contractorSteps).map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
                  )}
                  
                  <div className="bg-white rounded-2xl shadow-xl p-6 h-full hover:shadow-2xl transition-shadow">
                    {/* Step number */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    
                    <ul className="space-y-2">
                      {step.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600">
              Watch how easy it is to book a service with Leila
            </p>
          </motion.div>

          <motion.div
            className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="aspect-video relative">
              {/* Video placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <motion.button
                  className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlayingVideo(!playingVideo)}
                >
                  {playingVideo ? (
                    <Pause className="w-12 h-12 text-purple-600" />
                  ) : (
                    <Play className="w-12 h-12 text-purple-600" />
                  )}
                </motion.button>
              </div>
              
              {/* Demo UI mockup */}
              <div className="absolute inset-0 p-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto">
                  <div className="space-y-4">
                    <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                      <p className="text-white text-sm">Hey Leila, I need a plumber</p>
                    </div>
                    <div className="bg-white/30 backdrop-blur rounded-lg p-3 ml-12">
                      <p className="text-white text-sm">I found 3 plumbers near you! Mike can arrive in 30 minutes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Leila?
            </h2>
            <p className="text-xl text-gray-600">
              {activeView === 'customer' ? 'Benefits for homeowners' : 'Benefits for service professionals'}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits[activeView].map((benefit, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <benefit.icon className="w-8 h-8 text-purple-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl mb-12 text-purple-100">
              We use cutting-edge AI and smart algorithms to deliver the best experience
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6"
                whileHover={{ y: -5 }}
              >
                <Sparkles className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
                <p className="text-purple-100">
                  Natural language understanding for effortless booking
                </p>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6"
                whileHover={{ y: -5 }}
              >
                <Shield className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">Quality Verification</h3>
                <p className="text-purple-100">
                  AI-powered photo analysis ensures work quality
                </p>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6"
                whileHover={{ y: -5 }}
              >
                <TrendingUp className="w-12 h-12 mb-4 mx-auto" />
                <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
                <p className="text-purple-100">
                  Algorithm matches you with the perfect professional
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              {activeView === 'customer' 
                ? 'Join thousands of happy homeowners using Leila'
                : 'Start growing your business with Leila today'
              }
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {activeView === 'customer' ? (
                <>
                  <Link href="/signup">
                    <motion.button
                      variants={fadeInUp}
                      className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Sparkles className="w-5 h-5" />
                      Sign Up Free
                    </motion.button>
                  </Link>
                  <Link href="/">
                    <motion.button
                      variants={fadeInUp}
                      className="bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-800 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageSquare className="w-5 h-5" />
                      Try Leila Now
                    </motion.button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/contractor/signup">
                    <motion.button
                      variants={fadeInUp}
                      className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Users className="w-5 h-5" />
                      Join as a Pro
                    </motion.button>
                  </Link>
                  <Link href="/contractor">
                    <motion.button
                      variants={fadeInUp}
                      className="bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-800 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight className="w-5 h-5" />
                      Learn More
                    </motion.button>
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">
              Have questions? Check out our{' '}
              <Link href="/faq" className="text-purple-600 hover:text-purple-700 font-medium">
                FAQ
              </Link>
              {' '}or{' '}
              <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                contact us
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}