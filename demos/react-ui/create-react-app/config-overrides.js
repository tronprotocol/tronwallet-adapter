const webpack = require('webpack');

module.exports = function override(config, env) {
  console.log('override');
  let loaders = config.resolve;
  loaders.fallback = {
    'fs': false,
    'tls': false,
    'net': false,
    'querystring': require.resolve('querystring'),
    'http': require.resolve('stream-http'),
    'https': require.resolve('https-browserify'),
    'zlib': require.resolve('browserify-zlib'),
    'path': require.resolve('path-browserify'),
    'stream': require.resolve('stream-browserify'),
    'crypto': require.resolve('crypto-browserify')
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      // Buffer: ['buffer', 'Buffer']
    })
  );

  // config.stats = { ...config.stats, children: true };

  // react-dnd
  config.module.rules.unshift({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false // disable the behaviour
    }
  });

  // // react-dnd
  // config.resolve.alias = {
  //   ...config.resolve.alias,
  //   'react/jsx-runtime.js': 'react/jsx-runtime',
  //   'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime'
  // };

  return config;
};