import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['node-llama-cpp'],
  devIndicators: false,
};

export default nextConfig;
