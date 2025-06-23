'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Mail, Phone, MapPin, Shield, Clock, Star
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: 'Plumbing', href: '/book?category=plumbing' },
      { name: 'Electrical', href: '/book?category=electrical' },
      { name: 'HVAC', href: '/book?category=hvac' },
      { name: 'Cleaning', href: '/book?category=cleaning' },
      { name: 'Landscaping', href: '/book?category=landscaping' },
      { name: 'All Services', href: '/book' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' }
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Safety', href: '/safety' },
      { name: 'Service Areas', href: '/service-areas' },
      { name: 'Contractor Support', href: '/contractor/support' }
    ],
    contractors: [
      { name: 'Join as a Pro', href: '/contractor/signup' },
      { name: 'Contractor Login', href: '/contractor/login' },
      { name: 'Pro Dashboard', href: '/contractor/dashboard' },
      { name: 'Pro Resources', href: '/contractor/resources' },
      { name: 'Insurance Requirements', href: '/contractor/insurance' },
      { name: 'Pro Benefits', href: '/contractor/benefits' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <Image
                src="/leila-logo.png"
                alt="Leila Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="text-2xl font-bold text-white">Leila</span>
            </div>
            <p className="text-sm mb-4">
              Your AI-powered home service assistant. Book trusted professionals 
              for all your home needs with just a few taps or voice commands.
            </p>
            
            {/* App Store Badges */}
            <div className="flex gap-3 mb-6">
              <Link href="https://apps.apple.com/app/leila-home-services/id6747648334" target="_blank">
                <Image
                  src="/assets/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={120}
                  height={40}
                  className="hover:opacity-80 transition-opacity"
                />
              </Link>
              <Link href="#" className="opacity-50 cursor-not-allowed">
                <Image
                  src="/assets/google-play-badge.svg"
                  alt="Get it on Google Play"
                  width={135}
                  height={40}
                  className="grayscale"
                />
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Contractors */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Contractors</h3>
            <ul className="space-y-2">
              {footerLinks.contractors.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold text-white">Verified Professionals</p>
                <p className="text-sm">Background checked & insured</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Clock className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold text-white">Fast Response</p>
                <p className="text-sm">Average arrival in 30 minutes</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Star className="w-8 h-8 text-purple-500" />
              <div>
                <p className="font-semibold text-white">Quality Guaranteed</p>
                <p className="text-sm">4.8+ average rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-center md:text-left">
              <p>© {currentYear} Leila Home Services. All rights reserved.</p>
              <p className="mt-2">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                {' • '}
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                {' • '}
                <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
                {' • '}
                <Link href="/accessibility" className="hover:text-white transition-colors">Accessibility</Link>
              </p>
            </div>
            
            {/* reCAPTCHA Attribution */}
            <div className="text-xs text-gray-500 text-center md:text-right">
              <p>This site is protected by reCAPTCHA and the Google</p>
              <p>
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors underline"
                >
                  Privacy Policy
                </a>
                {' and '}
                <a 
                  href="https://policies.google.com/terms" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gray-400 transition-colors underline"
                >
                  Terms of Service
                </a>
                {' apply.'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-center items-center gap-6 text-sm">
            <a href="tel:1-800-LEILA-AI" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />
              1-800-LEILA-AI
            </a>
            <a href="mailto:support@heyleila.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" />
              support@heyleila.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Available in major US cities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}