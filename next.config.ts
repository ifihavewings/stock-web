import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.DEV_BACKEND_URL + '/:path*', // 在 .env.local 里设置 DEV_BACKEND_URL=http://localhost:1688
      },
    ]
  },
  
  // 开发服务器配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
