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
    unoptimized: true, // Required for static export
  },
  output: 'export',
  trailingSlash: true,
  // Exclude API routes from static export
  exportPathMap: async function (defaultPathMap) {
    // Remove API routes from export
    const pathMap = { ...defaultPathMap };
    Object.keys(pathMap).forEach(path => {
      if (path.startsWith('/api/')) {
        delete pathMap[path];
      }
    });
    return pathMap;
  },
};

module.exports = nextConfig;