import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-628df3f0aa6e4b78ab5606c692af4e0c.r2.dev',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://shooq-web-back-end.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
