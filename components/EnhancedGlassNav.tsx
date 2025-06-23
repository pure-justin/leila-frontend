'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  User, 
  LogIn, 
  Menu, 
  X,
  Sparkles,
  Phone,
  MessageCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/book', label: 'Book Service', icon: Calendar },
  { href: '/services', label: 'Services', icon: Sparkles },
  { href: '/how-it-works', label: 'How it Works', icon: MessageCircle },
];

const NavLink = ({ href, label, icon: Icon, isActive, onClick }: any) => {
  return (
    <Link href={href} onClick={onClick}>
      <motion.div
        className={cn(
          "relative px-4 py-2 rounded-xl transition-all cursor-pointer",
          "hover:bg-white/10",
          isActive && "bg-white/20"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="font-medium">{label}</span>
        </div>
        
        {isActive && (
          <motion.div
            layoutId="navbar-indicator"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>
    </Link>
  );
};

export default function EnhancedGlassNav() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 50], [0.8, 1]);
  const navBlur = useTransform(scrollY, [0, 50], [12, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "py-2" : "py-4"
        )}
        style={{
          backgroundColor: `rgba(255, 255, 255, ${isScrolled ? 0.9 : 0.8})`,
          backdropFilter: `blur(${isScrolled ? 20 : 12}px)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Link href="/" className="flex items-center gap-3 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"
                >
                  <Home className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Leila
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <AnimatePresence>
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    {...item}
                    isActive={pathname === item.href}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="font-medium">Profile</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors"
                  >
                    Sign Out
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="font-medium">Sign In</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden"
            >
              <div className="p-6">
                {/* Close Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Mobile Nav Links */}
                <div className="mt-12 space-y-2">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                          pathname === item.href
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "hover:bg-gray-100"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Mobile Auth Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  {user ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-2"
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-medium shadow-lg"
                    >
                      Sign In
                    </Link>
                  )}
                </div>

                {/* Contact */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-600 mb-4">Need help?</p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Call Support</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className={cn("transition-all duration-300", isScrolled ? "h-16" : "h-20")} />
    </>
  );
}