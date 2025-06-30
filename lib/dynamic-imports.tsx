import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  </div>
);

// Dynamic imports for heavy components
export const DynamicAIAssistant = dynamic(
  () => import('@/components/AIAssistant'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const DynamicServiceMap3D = dynamic(
  () => import('@/components/ServiceMap3D'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

export const DynamicBookingForm = dynamic(
  () => import('@/components/BookingForm'),
  { 
    loading: () => <LoadingSpinner /> 
  }
);

export const DynamicChatBot = dynamic(
  () => import('@/components/ChatBot'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

// Wrap any component in lazy loading
export function withLazyLoad<T extends {}>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options?: {
    ssr?: boolean;
    loading?: React.ComponentType;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <LoadingSpinner />),
    ssr: options?.ssr ?? true,
  });
}