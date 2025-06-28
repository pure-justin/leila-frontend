/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    domains: [
      'heyleila.com', 
      'storage.googleapis.com', 
      'firebasestorage.googleapis.com', 
      'lh3.googleusercontent.com',
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Optimize build performance
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Reduce memory usage during build
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  // Output optimization
  output: 'standalone',
};

module.exports = nextConfig;