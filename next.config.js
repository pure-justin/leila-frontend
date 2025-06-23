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
    // Removed unoptimized to enable Next.js image optimization
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig