'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { BookingTracking } from '@/hooks/useRealtimeTracking';
import { format } from 'date-fns';

interface TrackingStatusProps {
  tracking: BookingTracking;
  contractorInfo?: {
    name: string;
    phone: string;
    photo?: string;
    rating?: number;
  };
  onCall?: () => void;
  className?: string;
}

export function TrackingStatus({ 
  tracking, 
  contractorInfo,
  onCall,
  className = '' 
}: TrackingStatusProps) {
  const statusSteps = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'on_the_way', label: 'On The Way', icon: MapPin },
    { key: 'arrived', label: 'Arrived', icon: CheckCircle },
    { key: 'in_progress', label: 'In Progress', icon: Clock },
    { key: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === tracking.status);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Booking Status</h3>
        <p className="text-gray-600">Booking ID: {tracking.bookingId.slice(-8).toUpperCase()}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <motion.div
              className="h-full bg-primary-600"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}
                      ${isCurrent ? 'ring-4 ring-primary-200' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`
                    mt-2 text-xs font-medium
                    ${isActive ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Status Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary-50 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-primary-900">
            {tracking.status === 'on_the_way' && 'Contractor is on the way'}
            {tracking.status === 'arrived' && 'Contractor has arrived'}
            {tracking.status === 'in_progress' && `Service in progress ${tracking.progress ? `(${tracking.progress}%)` : ''}`}
            {tracking.status === 'completed' && 'Service completed successfully'}
            {!['on_the_way', 'arrived', 'in_progress', 'completed'].includes(tracking.status) && 'Booking confirmed'}
          </h4>
          {tracking.estimatedArrival && tracking.status === 'on_the_way' && (
            <span className="text-sm text-primary-700">
              ETA: {format(tracking.estimatedArrival, 'h:mm a')}
            </span>
          )}
        </div>

        {tracking.status === 'in_progress' && tracking.progress !== undefined && (
          <div className="mt-3">
            <div className="w-full bg-primary-200 rounded-full h-2">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${tracking.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Contractor Info */}
      {contractorInfo && ['on_the_way', 'arrived', 'in_progress'].includes(tracking.status) && (
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Your Service Professional</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {contractorInfo.photo ? (
                <img
                  src={contractorInfo.photo}
                  alt={contractorInfo.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    console.error('Contractor photo failed to load:', contractorInfo.photo);
                    e.currentTarget.src = '/images/default-avatar.svg';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-600">
                    {contractorInfo.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">{contractorInfo.name}</p>
                {contractorInfo.rating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span>⭐</span>
                    <span>{contractorInfo.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            {onCall && (
              <button
                onClick={onCall}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        Last updated: {format(tracking.lastUpdate, 'h:mm:ss a')}
      </div>
    </div>
  );
}