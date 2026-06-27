import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ['192.168.1.190', '0.0.0.0', 'localhost', 'victoria-parent-real-autumn.trycloudflare.com']
};

export default nextConfig;
