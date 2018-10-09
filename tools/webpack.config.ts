/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { getClientEnvironment } from './internals/env';
import lookupEntries from './internals/lookupEntries';
import * as paths from './paths.config';
import babelConfig from './babel.config';

const isDev = process.env.NODE_ENV === 'development';
const isVerbose = process.argv.includes('--verbose');
const clientEnv = getClientEnvironment();

const webpackConfig: webpack.Configuration = {
  mode: isDev ? 'development' : 'production',

  context: paths.SRC_DIR,

  // Don't set any entry, it will reslove from the 'entries' directory
  entry: {},

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
            loader: 'babel-loader',
            options: babelConfig,
          },

          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'esNext', // for Tree-shaking
                sourceMap: isDev,
              },
            },
          },
        ],
      },

      {
        test: /\.(css|less|scss|sass)$/,
        rules: [
          {
            loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          },

          // Process external/third-party styles
          {
            exclude: paths.SRC_DIR,
            loader: 'css-loader',
            options: {
              sourceMap: isDev,
            },
          },

          // Process internal/project styles (from src folder)
          {
            include: paths.SRC_DIR,
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              sourceMap: isDev,
              // CSS Modules https://github.com/css-modules/css-modules
              modules: true,
              localIdentName: isDev ? '[name]_[local]--[hash:base64:5]' : '[hash:base64:5]',
            },
          },

          // Apply PostCSS plugins including autoprefixer
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                // Add vendor prefixes to CSS rules using values from caniuse.com
                // https://github.com/postcss/autoprefixer
                require('autoprefixer')({
                  // flexbox: 'no-2009', // Recommended for modern browsers
                }),
              ],
            },
          },

          // Compile Less to CSS
          // https://github.com/webpack-contrib/less-loader
          // Install dependencies before uncommenting: yarn add --dev less-loader less
          // {
          //   test: /\.less$/,
          //   loader: 'less-loader',
          //   options: {
          //     sourceMap: isDev,
          //   },
          // },

          // Compile Sass to CSS
          // https://github.com/webpack-contrib/sass-loader
          // Install dependencies before uncommenting: yarn add --dev sass-loader node-sass
          // {
          //   test: /\.(scss|sass)$/,
          //   loader: 'sass-loader',
          //   options: {
          //     sourceMap: isDev,
          //     includePaths: [paths.SRC_DIR],
          //   },
          // },
        ],
      },

      {
        test: /\.(bmp|gif|jpg|jpeg|png|svg)$/,
        oneOf: [
          {
            issuer: /\.(css|less|scss|sass)$/,
            oneOf: [
              {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                options: {
                  name: 'assets/[hash:8].[ext]',
                  limit: 8192, // 8kb
                },
              },

              {
                loader: 'url-loader',
                options: {
                  name: 'assets/[hash:8].[ext]',
                  limit: 8192, // 8kb
                },
              },
            ],
          },

          {
            loader: 'file-loader',
            options: {
              name: 'assets/[hash:8].[ext]',
            },
          },
        ],
      },

      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[hash].[ext]',
        },
      },

      {
        test: /\.(avi|mp3|mp4|mpg|ogg|wav|wmv)$/,
        loader: 'file-loader',
        options: {
          name: 'media/[hash].[ext]',
        },
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

    // Extracts CSS into separate files
    // https://webpack.js.org/plugins/mini-css-extract-plugin/
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: 'chunks/[name].[contenthash:8].css',
    }),
  ],

  optimization: {
    minimizer: [
      // Minimize all JavaScript output of chunks
      // https://github.com/mishoo/UglifyJS2#compressor-options
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          warnings: isVerbose,
          output: {
            comments: false,
          },
        },
      }),

      // Optimize and minimize CSS assets
      // https://github.com/NMFR/optimize-css-assets-webpack-plugin
      new OptimizeCSSAssetsPlugin(),
    ],
  },

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

const entries = lookupEntries();
const webpackEntry = (webpackConfig.entry = {} as webpack.Entry);
const webpackPlugins = webpackConfig.plugins!;
Object.keys(entries).forEach(name => {
  const entry = entries[name];

  webpackEntry[name] = [entry.script];
  webpackPlugins.push(
    // Simplifies creation of HTML files to serve your webpack bundles
    // https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: `${name}.html`,
      chunks: [name],
      hash: isDev,
      minify: {
        collapseWhitespace: !isDev,
      },
      ...(entry.template ? { template: entry.template } : {}),
    }),
  );
});

export default webpackConfig;
