import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude public/photos from serverless function bundle
  // Images in public folder should be served as static assets, not bundled
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        './public/photos/**/*',
        'public/photos/**/*',
      ],
    },
  },
};

export default nextConfig;
