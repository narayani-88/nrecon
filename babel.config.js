module.exports = (api) => {
  // Cache based on NODE_ENV
  api.cache.using(() => process.env.NODE_ENV);

  return {
    presets: [
      [
        'next/babel',
        {
          'preset-react': {
            runtime: 'automatic',
            importSource: '@emotion/react',
          },
        },
      ],
    ],
    plugins: [
      '@babel/plugin-transform-runtime',
    ],
    // Intentionally avoid any filename-dependent fields like `ignore` or `overrides`
  };
};
