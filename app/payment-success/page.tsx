'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Home, Calendar, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    console.log('[Payment Success] URL params:', {
      paymentIntent,
      hasClientSecret: !!paymentIntentClientSecret,
      redirectStatus
    });

    // Verify payment status
    if (redirectStatus === 'succeeded') {
      // Payment was successful
      setLoading(false);
      setPaymentDetails({
        paymentIntentId: paymentIntent,
        status: 'succeeded'
      });
    } else if (redirectStatus === 'processing') {
      // Payment is still processing
      setLoading(false);
      setPaymentDetails({
        paymentIntentId: paymentIntent,
        status: 'processing'
      });
    } else if (redirectStatus === 'requires_payment_method') {
      // Payment failed
      setError('Payment was not completed. Please try again.');
      setLoading(false);
    } else {
      // Unknown status
      setError('Unable to verify payment status.');
      setLoading(false);
    }

    // Clear any booking data from localStorage
    localStorage.removeItem('instantBookingData');
    localStorage.removeItem('quickRebookData');
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Verifying payment...</h2>
          <p className="text-gray-600 mt-2">Please wait while we confirm your payment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Issue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/book"
            className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  if (paymentDetails?.status === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Processing</h1>
          <p className="text-gray-600 mb-6">
            Your payment is being processed. You'll receive a confirmation email once it's complete.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your booking has been confirmed</p>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">What's Next?</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-semibold">1</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                You'll receive a confirmation email with your booking details
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-semibold">2</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                Your contractor will be notified and will contact you to confirm the appointment
              </p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 text-sm font-semibold">3</span>
              </div>
              <p className="ml-3 text-sm text-gray-700">
                You can view and manage your booking in your account dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Payment ID */}
        {paymentDetails?.paymentIntentId && (
          <div className="text-center text-sm text-gray-500 mb-6">
            Payment ID: {paymentDetails.paymentIntentId}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/account/bookings"
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            View My Bookings
          </Link>
          <Link
            href="/"
            className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact support at{' '}
            <a href="mailto:support@leilahomeservices.com" className="text-purple-600 hover:underline">
              support@leilahomeservices.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}