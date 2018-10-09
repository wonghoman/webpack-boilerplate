/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import webpack from 'webpack';
import { getClientEnvironment } from './internals/env';
import * as paths from './paths.config';

const isDev = process.env.NODE_ENV === 'development';
const isVerbose = process.argv.includes('--verbose');
const clientEnv = getClientEnvironment();

const webpackConfig: webpack.Configuration = {
  mode: isDev ? 'development' : 'production',

  context: paths.SRC_DIR,

  output: {
    path: paths.BUILD_DIR,
    filename: isDev ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: isDev ? 'chunks/[name].js' : 'chunks/[name].[chunkhash:8].js',
    publicPath: process.env.PUBLIC_URL,
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      // Allow absolute paths in imports, e.g. import Button from '~/components/Button'
      // Keep in sync with tsconfig.json
      '~': paths.SRC_DIR,
    },
  },

  module: {
    // Make missing exports an error instead of warning
    strictExportPresence: true,

    rules: [
      // Rules for TS / TSX
      {
        test: /\.(ts|tsx)$/,
        include: paths.SRC_DIR,

        rules: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'es2015', // for Tree-shaking
                sourceMap: isDev,
              },
            },
          },
        ],
      },
    ],
  },

  plugins: [
    // Define free variables
    // https://webpack.js.org/plugins/define-plugin/
    new webpack.DefinePlugin({
      'process.env': clientEnv.stringified,
      __DEV__: isDev,
    }),
  ],

  // Don't attempt to continue if there are any errors.
  bail: !isDev,

  // Specify the generated source map
  // https://webpack.js.org/configuration/devtool/
  devtool: isDev ? 'cheap-module-eval-source-map' : false,

  // Configure bundle asset performance warnings
  // https://webpack.js.org/configuration/performance/
  performance: { hints: isDev ? false : 'warning' },

  // Specify what bundle information gets displayed
  // https://webpack.js.org/configuration/stats/
  stats: {
    cached: isVerbose,
    cachedAssets: isVerbose,
    children: isVerbose,
    chunks: isVerbose,
    chunkModules: isVerbose,
    colors: true,
    errorDetails: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDev,
    timings: true,
    version: isVerbose,
  },
};

export default webpackConfig;
