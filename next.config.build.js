/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false, // Disable for build
  images: {
    domains: [
      'heyleila.com', 
      'storage.googleapis.com', 
      'firebasestorage.googleapis.com', 
      'lh3.googleusercontent.com',
    ],
    unoptimized: true, // Disable image optimization for build
  },
  // Optimize build performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Disable features that might cause issues
  experimental: {
    optimizeCss: false,
    scrollRestoration: false,
  },
  // Webpack config to ignore problematic modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Ignore workbox in build
    config.externals.push({
      'workbox-precaching': 'commonjs workbox-precaching',
      'workbox-routing': 'commonjs workbox-routing',
      'workbox-strategies': 'commonjs workbox-strategies',
      'workbox-expiration': 'commonjs workbox-expiration',
      'workbox-cacheable-response': 'commonjs workbox-cacheable-response',
      'workbox-background-sync': 'commonjs workbox-background-sync',
    });
    
    return config;
  },
};

module.exports = nextConfig;