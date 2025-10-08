import type { NextConfig } from "next";

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
        ],
      },
    ];
  },
};

export default nextConfig;
