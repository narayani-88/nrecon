module.exports = (api) => {
  // This caches the Babel config
  api.cache.using(() => process.env.NODE_ENV);
  
  const presets = [
    [
      'next/babel',
      {
        'preset-react': {
          runtime: 'automatic',
          importSource: '@emotion/react',
        },
      },
    ],
  ];

  const plugins = [
    // Add any additional plugins here
    '@babel/plugin-transform-runtime',
  ];

  return {
    presets,
    plugins,
    // Ignore node_modules by default (can be overridden by specific rules)
    ignore: ['node_modules'],
    // Only process handlebars with specific loader
    overrides: [
      {
        // Use a safe function so Babel doesn't error when no filename is provided
        test: (filename) => Boolean(filename && /[\\/]node_modules[\\/]handlebars[\\/]/.test(filename)),
        presets: ['@babel/preset-env'],
      },
    ],
  };
};
