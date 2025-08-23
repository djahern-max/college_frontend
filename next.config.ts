import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  swcMinify: false, // Disable SWC minification to avoid build issues
  experimental: {
    optimizePackageImports: ['lucide-react'],
  }
};

export default nextConfig;
