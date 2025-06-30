/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
  
  // WEBPACK BEAST MODE
  webpack: (config, { isServer, dev }) => {
    // PRODUCTION ONLY OPTIMIZATIONS
    if (!dev) {
      // MAXIMUM COMPRESSION
      config.plugins.push(
        new CompressionPlugin({
          test: /\.(js|css|html|svg)$/,
          algorithm: 'brotliCompress',
          compressionOptions: { level: 11 },
          threshold: 8192,
          minRatio: 0.8,
        })
      );
      
      // AGGRESSIVE MINIFICATION
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              parse: { ecma: 8 },
              compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
              mangle: { safari10: true },
              output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
              },
            },
            parallel: true,
          }),
        ],
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              chunks: 'all',
              name(module, chunks, cacheGroupKey) {
                const moduleFileName = module
                  .identifier()
                  .split('/')
                  .reduceRight((item) => item);
                const allChunksNames = chunks.map((item) => item.name).join('~');
                return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            shared: {
              name: 'shared',
              chunks: 'all',
              test: /[\\/](components|lib|hooks|contexts)[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        moduleIds: 'deterministic',
      };
    }
    
    // IGNORE LARGE MODULES
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'firebase-admin': false,
      };
    }
    
    // MODULE REPLACEMENTS FOR SMALLER BUNDLES
    config.resolve.alias = {
      ...config.resolve.alias,
      'lodash': 'lodash-es',
      'moment': 'date-fns',
    };
    
    // IGNORE SOURCE MAPS IN PRODUCTION
    if (!dev) {
      config.devtool = false;
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