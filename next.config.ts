import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';
    
    // CSP configuration
    const cspDirectives = [
      // Default policy for all content
      "default-src 'self'",
      
      // Script sources
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http: ${isDev ? 'ws:' : ''}`,
      
      // Style sources
      "style-src 'self' 'unsafe-inline' https: http: 'unsafe-hashes'",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://nrecon.netlify.app",
      
      // Font sources
      "font-src 'self' data: https://fonts.gstatic.com https://nrecon.netlify.app",
      
      // Image sources
      "img-src 'self' data: blob: https: http:",
      
      // Connect sources
      `connect-src 'self' https: http: ${isDev ? 'ws:' : ''} https://nrecon.netlify.app`,
      
      // Frame sources
      "frame-src 'self' https://nrecon.netlify.app",
      
      // Media sources
      "media-src 'self' blob: data: https: http:",
      
      // Object sources
      "object-src 'none'",
      
      // Other directives
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].filter(Boolean).join('; ') + ';';
    
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: cspDirectives,
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
