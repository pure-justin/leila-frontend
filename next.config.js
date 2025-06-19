/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['heyleila.com', 'api.heyleila.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/crm/:path*',
        destination: `${process.env.NEXT_PUBLIC_CRM_URL || 'http://localhost:8080'}/:path*`,
      },
    ]
  },
}

module.exports = nextConfig