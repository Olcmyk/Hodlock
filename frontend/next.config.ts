import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 你已经写了这一行，非常好，这是 IPFS 部署必须的
  },
  devIndicators: false,
};

export default nextConfig;
