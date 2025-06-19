'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, DollarSign, MessageSquare, Settings, LogOut } from 'lucide-react';

const navItems = [
  { href: '/contractor/dashboard', label: 'Dashboard', icon: Home },
  { href: '/contractor/schedule', label: 'Schedule', icon: Calendar },
  { href: '/contractor/jobs', label: 'My Jobs', icon: Calendar },
  { href: '/contractor/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/contractor/messages', label: 'Messages', icon: MessageSquare },
  { href: '/contractor/profile', label: 'Profile', icon: User },
  { href: '/contractor/settings', label: 'Settings', icon: Settings },
];

export default function ContractorNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/contractor/dashboard" className="flex items-center">
              <Image src="/leila-logo.png" alt="Leila Pro" width={40} height={40} className="h-10 w-auto mr-2" />
              <span className="text-2xl font-bold text-indigo-600">Pro</span>
            </Link>

            {/* Navigation Items */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="sm:hidden border-t">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}