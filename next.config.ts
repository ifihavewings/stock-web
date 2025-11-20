import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.DEV_BACKEND_URL + '/:path*', // 在 .env.local 里设置 DEV_BACKEND_URL=https://staging.example.com
      },
    ]
  },
};

export default nextConfig;
