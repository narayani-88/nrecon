import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
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
  
  // Security headers are handled in src/middleware.ts
  headers: async () => [],
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Performance optimizations
  compress: true,
  
  // Webpack configuration to handle Node.js modules and polyfills
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `require.extensions`
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        tls: false,
        net: false,
        child_process: false,
        dns: false,
        path: false,
        http2: false,
        https: false,
        zlib: false,
        stream: false,
        crypto: false,
        util: false,
        buffer: false,
        assert: false,
        constants: false,
        os: false,
        url: false,
        querystring: false,
        http: false,
        vm: false,
        process: false
      };
    }

    // Add a rule to handle handlebars
    config.module.rules.push({
      test: /[\\/]node_modules[\\/](handlebars|dotprompt)[\\/]/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          },
        },
      ],
    });

    // Ignore the handlebars warning
    config.ignoreWarnings = [
      { module: /node_modules[\\/]handlebars/ },
      { module: /node_modules[\\/]dotprompt/ },
    ];

    // Add externals for problematic modules
    config.externals = config.externals || [];
    config.externals.push('handlebars');
    config.externals.push('dotprompt');

    return config;
  },
};

export default nextConfig;
