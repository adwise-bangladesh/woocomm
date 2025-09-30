import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.zonash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;