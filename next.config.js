/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable dynamic routes
  images: {
    domains: [
      'heyleila.com', 
      'api.heyleila.com', 
      'storage.googleapis.com', 
      'firebasestorage.googleapis.com', 
      'lh3.googleusercontent.com',
      'images.unsplash.com',
      'images.pexels.com',
      'cdn.pixabay.com',
      'images.freepik.com',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    // Removed unoptimized to enable Next.js image optimization
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Production optimizations
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  // Optimize bundle size
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
  },
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true
        }
      }
    };
    
    // Minimize memory usage during build
    if (!isServer) {
      config.optimization.minimize = true;
      config.optimization.usedExports = true;
    }
    
    return config;
  },
}

module.exports = nextConfig