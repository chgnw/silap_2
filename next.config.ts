import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimizations untuk compile speed
  experimental: {
    optimizePackageImports: ["recharts", "react-icons", "react-bootstrap"],
  },
  modularizeImports: {
    "react-icons": {
      transform: "react-icons/{{member}}",
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  output: "standalone",
};

export default nextConfig;
