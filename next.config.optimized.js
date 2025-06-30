/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // MAXIMUM PERFORMANCE SETTINGS
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // AGGRESSIVE IMAGE OPTIMIZATION
  images: {
    unoptimized: false, // Re-enable optimization with limits
    domains: [
      'heyleila.com',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
    deviceSizes: [640, 828, 1200], // Mobile first
    imageSizes: [16, 32, 48], // Tiny sizes only
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache
    formats: ['image/webp'], // WebP only
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // IGNORE DURING BUILD FOR SPEED
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // EXPERIMENTAL FEATURES FOR SPEED
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@stripe/stripe-js',
      'firebase',
      'date-fns'
    ],
  },
  
  // SIMPLIFIED WEBPACK CONFIG
  webpack: (config, { isServer, dev }) => {
    // Basic optimizations
    if (!dev) {
      config.optimization.minimize = true;
    }
    
    // Ignore server-only modules on client
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
      };
    }
    
    return config;
  },
  
  // HEADERS FOR CACHING
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/(.*)\.(jpg|jpeg|png|gif|ico|webp|svg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);