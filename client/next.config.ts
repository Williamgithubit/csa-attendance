import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // Using Webpack for path aliases
  webpack: (config) => {
    // Add path aliases to webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/store': path.resolve(__dirname, 'store')
    };
    return config;
  },
};

export default nextConfig;
