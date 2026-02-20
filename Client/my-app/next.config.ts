import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ⚡ Next.js ko batana ke Cloudinary aur AWS domains safe hain
    remotePatterns: [
      {
        protocol: "https", // Cloudinary hamesha https use karta hai
        hostname: "res.cloudinary.com",
        pathname: "/**", // Saare paths allow karein
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
};

export default nextConfig;
