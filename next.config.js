/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' for local development
  images: {
    domains: ['heyleila.com', 'api.heyleila.com', 'storage.googleapis.com', 'firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig