import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  async rewrites() {
        return [
            {
                source: '/tarkov-api/:path*',
                destination: 'https://tarkovtracker.io/api/v2/:path*',
            },
        ];
    },
};

export default nextConfig;
