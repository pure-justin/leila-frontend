/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Required for Docker/Railway/Fly deployments
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