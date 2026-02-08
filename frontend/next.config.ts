import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 关键修改：开启静态导出，生成 4EVERLAND 需要的 out 文件夹
  trailingSlash: true,
  images: {
    unoptimized: true, // 你已经写了这一行，非常好，这是 IPFS 部署必须的
  },
  devIndicators: false,
};

export default nextConfig;
