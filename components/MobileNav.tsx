'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Search, Calendar, User, Menu, X, ChevronRight,
  Phone, MessageCircle, Star, Settings, HelpCircle, 
  LogOut, Briefcase, FileText, CreditCard
} from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [isClosing, setIsClosing] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      handleClose();
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home', href: '/', badge: null },
    { icon: Search, label: 'Book', href: '/book', badge: null },
    // { icon: Calendar, label: 'My Bookings', href: '/bookings', badge: '2' }, // TODO: Create bookings page
    // { icon: MessageCircle, label: 'Messages', href: '/messages', badge: '5' }, // TODO: Create messages page
    // { icon: Star, label: 'Favorites', href: '/favorites', badge: null }, // TODO: Create favorites page
    { icon: Briefcase, label: 'Become a Pro', href: '/contractor/signup', badge: 'NEW' },
  ];

  const bottomItems = [
    // { icon: Settings, label: 'Settings', href: '/settings' }, // TODO: Create settings page
    // { icon: HelpCircle, label: 'Help & Support', href: '/help' }, // TODO: Create help page
    // { icon: FileText, label: 'Terms & Privacy', href: '/terms' }, // TODO: Create terms page
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Side Menu */}
          <motion.div
            className="fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-white shadow-2xl z-[70] md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium">Welcome back!</p>
                  <Link href="/contractor/login" className="text-sm text-white/80 hover:text-white">
                    Sign in / Sign up
                  </Link>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-4">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={handleClose}
                    className={`flex items-center justify-between p-4 rounded-lg mb-2 transition-all ${
                      pathname === item.href
                        ? 'bg-purple-50 text-purple-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 ${
                        pathname === item.href ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.badge === 'NEW' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </nav>

              {/* Bottom Section */}
              <div className="border-t border-gray-200 p-4 mt-4">
                {bottomItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={handleClose}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Contact Support */}
              <div className="p-4 m-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">Need Help?</p>
                <p className="text-xs text-purple-700 mb-3">Our support team is available 24/7</p>
                <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  <Phone className="w-4 h-4" />
                  Contact Support
                </button>
              </div>
            </div>

            {/* Swipe Indicator */}
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
              <div className="w-1 h-16 bg-gray-300 rounded-full" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Bottom Tab Bar Component for mobile navigation
export function MobileTabBar() {
  const pathname = usePathname();
  
  const tabs = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Book', href: '/book' },
    // { icon: Calendar, label: 'Bookings', href: '/bookings' }, // TODO: Create bookings page
    // { icon: MessageCircle, label: 'Chat', href: '/chat' }, // TODO: Create chat page
    // { icon: User, label: 'Profile', href: '/profile' }, // TODO: Create profile page
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
                isActive ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              <tab.icon className={`w-5 h-5 mb-1 ${isActive ? 'text-purple-600' : 'text-gray-500'}`} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="absolute bottom-0 w-16 h-0.5 bg-purple-600"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}