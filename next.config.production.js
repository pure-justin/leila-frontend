/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal config for production build
  images: {
    unoptimized: true, // Disable image optimization to save memory
    domains: ['heyleila.com'],
    deviceSizes: [640, 768, 1024], // Reduced from default
    imageSizes: [16, 32, 48, 64], // Reduced from default
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
  productionBrowserSourceMaps: false,
  // Disable all experimental features
  experimental: {},
  // Simple webpack config
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Disable source maps completely
      config.devtool = false;
      
      // Ignore large modules during build
      config.module.rules.push({
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[hash][ext]'
        }
      });
    }
    return config;
  },
}

module.exports = nextConfig