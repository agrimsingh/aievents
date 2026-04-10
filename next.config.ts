import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.lumacdn.com",
        pathname: "/**",
      },
      { protocol: "https", hostname: "og.luma.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.lu.ma", pathname: "/**" },
    ],
  },
};

export default nextConfig;
