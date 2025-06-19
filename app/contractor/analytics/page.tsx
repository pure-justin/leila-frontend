'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6 py-4">
            <Link href="/" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto p-6">
        <p className="text-gray-600">Analytics dashboard is being upgraded. Check back soon!</p>
      </div>
    </div>
  );
}