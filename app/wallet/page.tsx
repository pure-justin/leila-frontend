'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  CreditCard, Plus, DollarSign, TrendingUp, Clock, 
  AlertCircle, CheckCircle, Wallet, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'refund';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // In production, create payment method with Stripe
      // const { error, paymentMethod } = await stripe.createPaymentMethod({
      //   type: 'card',
      //   card: elements.getElement(CardElement)!,
      // });

      // For demo, simulate success
      setTimeout(() => {
        onSuccess();
        setIsProcessing(false);
      }, 1500);
    } catch (err) {
      setError('Failed to add payment method');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h3 className="text-xl font-semibold mb-4">Add Payment Method</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information
            </label>
            <div className="p-3 border rounded-lg">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={isProcessing || !stripe}
            >
              {isProcessing ? 'Adding...' : 'Add Card'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function WalletContent() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(125.50);
  const [pendingEarnings, setPendingEarnings] = useState(45.00);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true,
      expiryMonth: 12,
      expiryYear: 2025
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      isDefault: false,
      expiryMonth: 6,
      expiryYear: 2024
    }
  ]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'debit',
      amount: 120.00,
      description: 'House Cleaning Service',
      date: new Date(),
      status: 'completed'
    },
    {
      id: '2',
      type: 'credit',
      amount: 50.00,
      description: 'Referral Bonus',
      date: new Date(Date.now() - 86400000),
      status: 'completed'
    },
    {
      id: '3',
      type: 'credit',
      amount: 100.00,
      description: 'Wallet Top-up',
      date: new Date(Date.now() - 172800000),
      status: 'completed'
    },
    {
      id: '4',
      type: 'debit',
      amount: 75.00,
      description: 'Plumbing Service',
      date: new Date(Date.now() - 259200000),
      status: 'completed'
    }
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsAmount, setAddFundsAmount] = useState('');

  const handleAddFunds = async () => {
    if (!addFundsAmount || isNaN(Number(addFundsAmount))) return;
    
    const amount = Number(addFundsAmount);
    
    // Simulate adding funds
    setBalance(prev => prev + amount);
    setTransactions(prev => [{
      id: Date.now().toString(),
      type: 'credit',
      amount,
      description: 'Wallet Top-up',
      date: new Date(),
      status: 'completed'
    }, ...prev]);
    
    setShowAddFunds(false);
    setAddFundsAmount('');
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const stats = {
    totalSpent: transactions
      .filter(t => t.type === 'debit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
    totalSaved: transactions
      .filter(t => t.type === 'credit' && t.description.includes('Referral'))
      .reduce((sum, t) => sum + t.amount, 0),
    averageSpending: transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t, _, arr) => sum + t.amount / arr.length, 0)
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to view your wallet</h2>
          <p className="text-gray-600">Manage your payments and track spending</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8" />
              <button
                onClick={() => setShowAddFunds(true)}
                className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors"
              >
                Add Funds
              </button>
            </div>
            <p className="text-white/80 text-sm">Wallet Balance</p>
            <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-sm text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-gray-600 text-sm">Total Saved</p>
            <p className="text-2xl font-bold">${stats.totalSaved.toFixed(2)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">Average Spending</p>
            <p className="text-2xl font-bold">${stats.averageSpending.toFixed(2)}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Payment Methods</h2>
              <button
                onClick={() => setShowAddPayment(true)}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="border rounded-lg p-4 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                      <div>
                        <p className="font-medium">
                          {method.brand} •••• {method.last4}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      <button
                        onClick={() => handleSetDefaultPayment(method.id)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        {!method.isDefault && 'Set Default'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>
            
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'credit' 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'credit' 
                        ? <ArrowDownRight className="w-5 h-5" />
                        : <ArrowUpRight className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {format(transaction.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All Transactions
            </button>
          </div>
        </div>

        {/* Add Funds Modal */}
        {showAddFunds && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Add Funds to Wallet</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {[25, 50, 100, 200].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setAddFundsAmount(amount.toString())}
                    className="flex-1 px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddFunds(false);
                    setAddFundsAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFunds}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  disabled={!addFundsAmount || Number(addFundsAmount) <= 0}
                >
                  Add Funds
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        <Elements stripe={stripePromise}>
          <AddPaymentMethodModal
            isOpen={showAddPayment}
            onClose={() => setShowAddPayment(false)}
            onSuccess={() => {
              setShowAddPayment(false);
              // Add new payment method to list
              setPaymentMethods(prev => [...prev, {
                id: Date.now().toString(),
                type: 'card',
                last4: '1234',
                brand: 'Visa',
                isDefault: false,
                expiryMonth: 12,
                expiryYear: 2026
              }]);
            }}
          />
        </Elements>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}