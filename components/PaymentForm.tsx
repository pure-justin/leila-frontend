'use client';

import { useState } from 'react';
import { 
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { stripePromise, STRIPE_CONFIG, STRIPE_ELEMENTS_APPEARANCE } from '@/lib/stripe-config';
import { Loader2, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  metadata?: Record<string, any>;
}

function CheckoutForm({ amount, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setError(error.message || 'Payment failed');
        setProcessing(false);
      } else {
        setSucceeded(true);
        setProcessing(false);
        onSuccess();
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">Your payment of ${amount.toFixed(2)} has been processed.</p>
        <p className="text-sm text-gray-500">Your booking has been confirmed and the contractor will be notified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center pb-4 border-b">
        <h3 className="text-xl font-semibold flex items-center justify-center mb-2">
          <CreditCard className="w-5 h-5 mr-2" />
          Secure Payment
        </h3>
        <p className="text-gray-600">Total: <span className="text-2xl font-bold text-purple-600">${amount.toFixed(2)}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />
        
        {error && (
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </button>
        </div>

        {STRIPE_CONFIG.isLive && (
          <p className="text-xs text-orange-600 text-center">
            ⚠️ Using LIVE Stripe keys - Real charges will occur!
          </p>
        )}
      </form>
    </div>
  );
}

export default function PaymentForm({ amount, onSuccess, onCancel, metadata }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount * 100, // Convert to cents
          metadata 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      console.error('Payment setup error:', err);
      setError(err.message || 'Failed to setup payment');
      // For demo purposes, still allow proceeding with a mock
      if (process.env.NODE_ENV === 'development') {
        setClientSecret('pi_mock_' + Math.random().toString(36).substr(2, 9));
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-create payment intent when component mounts
  if (!clientSecret && !loading && !error) {
    createPaymentIntent();
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-purple-600" />
        <p className="text-gray-600">Setting up secure payment...</p>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Setup Issue</h3>
        <p className="text-gray-600 mb-2">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          {error.includes('not configured') 
            ? 'The payment system is currently being set up. You can still explore the app!'
            : 'Please try again or contact support if the issue persists.'}
        </p>
        <div className="space-y-2">
          <button
            onClick={createPaymentIntent}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onCancel}
            className="block mx-auto text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel Payment
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <Elements 
          stripe={stripePromise} 
          options={{
            clientSecret,
            appearance: STRIPE_ELEMENTS_APPEARANCE,
          }}
        >
          <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
        </Elements>
      </div>
    </div>
  );
}