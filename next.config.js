/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Static export for Firebase Hosting world domination
  distDir: 'out', // Firebase Hosting expects 'out' directory
  trailingSlash: true, // Better compatibility with Firebase Hosting
  images: {
    unoptimized: true, // Required for static export
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