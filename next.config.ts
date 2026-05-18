import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.upanhnhanh.com",
      },
    ],
  },
};

export default nextConfig;
