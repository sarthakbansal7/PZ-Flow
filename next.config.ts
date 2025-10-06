import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Temporarily commenting out static export to allow dynamic routes with client components
  // output: "export",
  images: {
    unoptimized: true,
  },
  // Enable dynamic routes
  trailingSlash: true,
};

export default nextConfig;
