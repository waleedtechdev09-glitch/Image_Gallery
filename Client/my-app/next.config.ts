import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
  // ⚡ Next.js 15 ke liye ye dono settings try karein
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false, // Build activity indicator ko bhi off kar dein
  },
};

export default nextConfig;
