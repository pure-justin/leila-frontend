/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable dynamic routes
  images: {
    domains: ['heyleila.com', 'api.heyleila.com', 'storage.googleapis.com', 'firebasestorage.googleapis.com'],
    // Keep unoptimized for now but can be removed later
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