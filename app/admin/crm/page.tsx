'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Database, Users, Calendar, BarChart3, Settings, Phone, Mail, FileText } from 'lucide-react';
import Link from 'next/link';

export default function CRMPortalPage() {
  const [isProduction, setIsProduction] = useState(false);
  // Use production URL when deployed, local for development
  const crmUrl = isProduction 
    ? 'https://crm.heyleila.com' 
    : (process.env.NEXT_PUBLIC_ESPOCRM_URL || 'http://localhost:8080');

  useEffect(() => {
    // Check if we're in production
    setIsProduction(window.location.hostname !== 'localhost');
  }, []);

  const crmFeatures = [
    {
      icon: Users,
      title: 'Contact Management',
      description: 'Manage customers and contractors',
      link: `${crmUrl}/#Contact`
    },
    {
      icon: Calendar,
      title: 'Bookings & Tasks',
      description: 'Track service bookings and tasks',
      link: `${crmUrl}/#Task`
    },
    {
      icon: Phone,
      title: 'Call Tracking',
      description: 'Log and manage customer calls',
      link: `${crmUrl}/#Call`
    },
    {
      icon: Mail,
      title: 'Email Campaigns',
      description: 'Send marketing emails',
      link: `${crmUrl}/#Campaign`
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'View business insights',
      link: `${crmUrl}/#Report`
    },
    {
      icon: FileText,
      title: 'Documents',
      description: 'Manage contracts and files',
      link: `${crmUrl}/#Document`
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Loader2 className="h-12 w-12 mx-auto text-purple-600 animate-spin" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Opening Leila CRM
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Redirecting to your business management system...
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium">Customer Management</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium">Booking Tracking</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium">Contractor Database</p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-sm font-medium">Business Analytics</p>
          </div>
        </div>

        <div className="space-y-4">
          <a
            href={crmUrl}
            className="w-full inline-flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open CRM Now
          </a>
          
          {!isProduction && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p>Development Mode: {crmUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}