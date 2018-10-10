/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
type Preset = string | [string, any];
type Plugin = string | [string, any];
interface BabelConfig {
  babelrc?: boolean;
  cacheDirectory?: boolean;
  cacheIdentifier?: string;
  cacheCompression?: boolean;
  presets?: Preset[];
  plugins?: Plugin[];
}

const isDev = process.env.NODE_ENV !== 'production';

// Babel-loader configuration
// https://github.com/babel/babel-loader#options
export default {
  babelrc: false,
  cacheDirectory: isDev,
  presets: [
    [
      '@babel/preset-env',
      {
        forceAllTransforms: !isDev, // for UglifyJS
        modules: false, // for Tree-shaking
        useBuiltIns: false,
        loose: true,
      },
    ],
    [
      '@babel/preset-react',
      {
        development: isDev,
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: false,
        helpers: true,
        regenerator: false,
        useESModules: true,
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
  ],
} as BabelConfig;
