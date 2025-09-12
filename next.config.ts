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
    
    // CSP configuration for production
    const cspDirectives = [
      // Default policy for all content
      "default-src 'self'",
      
      // Script sources - allow self, hashes, and nonce
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https: http: https://nrecon.netlify.app`,
      `script-src-elem 'self' 'unsafe-inline' https://nrecon.netlify.app`,
      
      // Style sources - allow 'unsafe-inline' for CSS-in-JS solutions
      `style-src 'self' 'unsafe-inline' https: http:`,
      `style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://nrecon.netlify.app`,
      
      // Font sources - allow self, data URIs, and Google Fonts
      `font-src 'self' data: blob: https://fonts.gstatic.com https://nrecon.netlify.app`,
      
      // Image sources
      `img-src 'self' data: blob: https: http:`,
      
      // Connect sources - allow WebSockets in development
      `connect-src 'self' https: http: ${isDev ? 'ws: wss:' : ''} https://nrecon.netlify.app`,
      
      // Frame sources
      `frame-src 'self' https://nrecon.netlify.app`,
      
      // Media sources
      `media-src 'self' blob: data: https: http:`,
      
      // Object sources - prevent dangerous object/embed tags
      `object-src 'none'`,
      
      // Other security directives
      `base-uri 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `upgrade-insecure-requests`
    ].filter(Boolean).join('; ') + ';';
    
    // In development, use a more permissive CSP to avoid conflicts with Next.js dev server
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: isDev 
          ? [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: ws: wss:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: ws: wss:",
              "script-src-elem 'self' 'unsafe-inline' https: http: ws: wss:",
              "style-src 'self' 'unsafe-inline' https: http:",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://nrecon.netlify.app",
              "font-src 'self' data: blob: https://fonts.gstatic.com https://nrecon.netlify.app",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: data: https: http:",
              "connect-src 'self' https: http: ws: wss:",
              "frame-src 'self' https://nrecon.netlify.app",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          : cspDirectives
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
