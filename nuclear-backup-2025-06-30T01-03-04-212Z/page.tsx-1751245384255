'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Shield,
  CreditCard,
  Cloud,
  Wifi,
  WifiOff
} from 'lucide-react';

interface HealthCheck {
  name: string;
  endpoint?: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  responseTime?: number;
  details?: any;
  icon: React.ReactNode;
}

export default function APIHealthPage() {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runHealthChecks = async () => {
    setIsChecking(true);
    const checks: HealthCheck[] = [];

    // 1. Check Firestore Connection
    const firestoreCheck: HealthCheck = {
      name: 'Firestore Database',
      endpoint: '/api/health/firestore',
      status: 'checking',
      message: 'Checking database connection...',
      icon: <Database className="w-5 h-5" />
    };
    checks.push(firestoreCheck);
    setHealthChecks([...checks]);

    try {
      const start = Date.now();
      const response = await fetch('/api/health/firestore');
      const data = await response.json();
      firestoreCheck.responseTime = Date.now() - start;
      
      if (response.ok) {
        firestoreCheck.status = 'success';
        firestoreCheck.message = 'Database connection successful';
        firestoreCheck.details = data;
      } else {
        firestoreCheck.status = 'error';
        firestoreCheck.message = `Database error: ${data.error || response.statusText}`;
        firestoreCheck.details = { status: response.status, ...data };
      }
    } catch (error: any) {
      firestoreCheck.status = 'error';
      firestoreCheck.message = `Connection failed: ${error.message}`;
    }
    setHealthChecks([...checks]);

    // 2. Check Firebase Auth
    const authCheck: HealthCheck = {
      name: 'Firebase Authentication',
      endpoint: '/api/health/auth',
      status: 'checking',
      message: 'Checking authentication service...',
      icon: <Shield className="w-5 h-5" />
    };
    checks.push(authCheck);
    setHealthChecks([...checks]);

    try {
      const start = Date.now();
      const response = await fetch('/api/health/auth');
      const data = await response.json();
      authCheck.responseTime = Date.now() - start;
      
      if (response.ok) {
        authCheck.status = 'success';
        authCheck.message = 'Authentication service operational';
        authCheck.details = data;
      } else {
        authCheck.status = 'error';
        authCheck.message = `Auth error: ${data.error || response.statusText}`;
        authCheck.details = { status: response.status, ...data };
      }
    } catch (error: any) {
      authCheck.status = 'error';
      authCheck.message = `Connection failed: ${error.message}`;
    }
    setHealthChecks([...checks]);

    // 3. Check Stripe Integration
    const stripeCheck: HealthCheck = {
      name: 'Stripe Payment Gateway',
      endpoint: '/api/health/stripe',
      status: 'checking',
      message: 'Checking payment processor...',
      icon: <CreditCard className="w-5 h-5" />
    };
    checks.push(stripeCheck);
    setHealthChecks([...checks]);

    try {
      const start = Date.now();
      const response = await fetch('/api/health/stripe');
      const data = await response.json();
      stripeCheck.responseTime = Date.now() - start;
      
      if (response.ok) {
        stripeCheck.status = data.configured ? 'success' : 'warning';
        stripeCheck.message = data.configured 
          ? 'Stripe configured and ready' 
          : 'Stripe keys not configured';
        stripeCheck.details = data;
      } else {
        stripeCheck.status = 'error';
        stripeCheck.message = `Stripe error: ${data.error || response.statusText}`;
        stripeCheck.details = { status: response.status, ...data };
      }
    } catch (error: any) {
      stripeCheck.status = 'error';
      stripeCheck.message = `Connection failed: ${error.message}`;
    }
    setHealthChecks([...checks]);

    // 4. Check Booking API
    const bookingCheck: HealthCheck = {
      name: 'Booking Service',
      endpoint: '/api/booking',
      status: 'checking',
      message: 'Testing booking endpoint...',
      icon: <Cloud className="w-5 h-5" />
    };
    checks.push(bookingCheck);
    setHealthChecks([...checks]);

    try {
      const start = Date.now();
      const response = await fetch('/api/booking', {
        method: 'GET' // We'll create a GET endpoint for health check
      });
      const data = await response.json();
      bookingCheck.responseTime = Date.now() - start;
      
      if (response.ok || response.status === 405) { // 405 is expected for GET
        bookingCheck.status = 'success';
        bookingCheck.message = 'Booking endpoint accessible';
        bookingCheck.details = { status: response.status };
      } else if (response.status >= 400 && response.status < 500) {
        bookingCheck.status = 'warning';
        bookingCheck.message = `Client error: ${response.status} ${response.statusText}`;
        bookingCheck.details = { status: response.status, ...data };
      } else {
        bookingCheck.status = 'error';
        bookingCheck.message = `Server error: ${response.status} ${response.statusText}`;
        bookingCheck.details = { status: response.status, ...data };
      }
    } catch (error: any) {
      bookingCheck.status = 'error';
      bookingCheck.message = `Connection failed: ${error.message}`;
    }
    setHealthChecks([...checks]);

    // 5. Check overall connectivity
    const connectivityCheck: HealthCheck = {
      name: 'Network Connectivity',
      status: navigator.onLine ? 'success' : 'error',
      message: navigator.onLine ? 'Connected to internet' : 'No internet connection',
      icon: navigator.onLine ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />
    };
    checks.push(connectivityCheck);
    setHealthChecks([...checks]);

    setIsChecking(false);
    setLastChecked(new Date());
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const overallHealth = healthChecks.every(check => check.status === 'success') 
    ? 'healthy' 
    : healthChecks.some(check => check.status === 'error') 
      ? 'critical' 
      : 'degraded';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">API Health Monitor</h1>
          <p className="text-gray-600">Real-time status of all system components</p>
        </motion.div>

        {/* Overall Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 p-6 rounded-2xl shadow-lg ${
            overallHealth === 'healthy' 
              ? 'bg-green-100 border-2 border-green-300' 
              : overallHealth === 'critical'
                ? 'bg-red-100 border-2 border-red-300'
                : 'bg-yellow-100 border-2 border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {overallHealth === 'healthy' && <CheckCircle className="w-10 h-10 text-green-600" />}
              {overallHealth === 'critical' && <XCircle className="w-10 h-10 text-red-600" />}
              {overallHealth === 'degraded' && <AlertCircle className="w-10 h-10 text-yellow-600" />}
              <div>
                <h2 className="text-2xl font-semibold">
                  System Status: {' '}
                  <span className={
                    overallHealth === 'healthy' 
                      ? 'text-green-700' 
                      : overallHealth === 'critical'
                        ? 'text-red-700'
                        : 'text-yellow-700'
                  }>
                    {overallHealth === 'healthy' ? 'All Systems Operational' : 
                     overallHealth === 'critical' ? 'Critical Issues Detected' : 
                     'Partial Outage'}
                  </span>
                </h2>
                {lastChecked && (
                  <p className="text-sm text-gray-600 mt-1">
                    Last checked: {lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={runHealthChecks}
              disabled={isChecking}
              className="px-6 py-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow 
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Refresh'}</span>
            </button>
          </div>
        </motion.div>

        {/* Individual Health Checks */}
        <div className="grid gap-4">
          <AnimatePresence>
            {healthChecks.map((check, index) => (
              <motion.div
                key={check.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl shadow-md border-2 transition-all ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {check.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{check.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                      {check.endpoint && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">{check.endpoint}</p>
                      )}
                      {check.responseTime && (
                        <p className="text-xs text-gray-500 mt-1">
                          Response time: {check.responseTime}ms
                        </p>
                      )}
                      {check.details && check.status === 'error' && (
                        <details className="mt-2">
                          <summary className="text-sm text-red-600 cursor-pointer hover:underline">
                            View error details
                          </summary>
                          <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto">
                            {JSON.stringify(check.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusIcon(check.status)}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Test Credentials Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Credentials</h3>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Customer:</strong> customer1@test.com / TestPass123!</p>
            <p><strong>Contractor:</strong> contractor1@test.com / TestPass123!</p>
            <p><strong>Admin:</strong> admin@test.com / TestPass123!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}