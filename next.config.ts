import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Enable image caching
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  // Add cache headers for static assets
  async headers() {
    return [
      {
        source: '/photos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year for static images
          },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year for optimized images
          },
        ],
      },
    ];
  },
};

export default nextConfig;
