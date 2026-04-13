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
      {
        protocol: "https",
        hostname: "sloppy-joe-app.imgix.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
