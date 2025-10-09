import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  // Disable turbo for FFmpeg compatibility
  experimental: {
    // turbo: false, // Uncomment if you have issues with FFmpeg loading
  },
  
  // Configure webpack for FFmpeg WASM
  webpack: (config, { isServer }) => {
    // Don't bundle FFmpeg on the server side
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('@ffmpeg/ffmpeg', '@ffmpeg/util');
    }
    
    // Configure for WASM loading
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
  
  // Headers for Cross-Origin Isolation (required for FFmpeg SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})(nextConfig);
