/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // NO output: 'export' for development - we need API routes and middleware
  images: {
    domains: [
      'heyleila.com',
      'storage.googleapis.com', 
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;