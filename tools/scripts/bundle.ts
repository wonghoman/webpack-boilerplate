/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import webpack from 'webpack';
import webpackConfig from '../webpack.config';
import Defer from '../internals/defer';

/**
 * Creates application bundles from the source files.
 */
function bundle() {
  const compiler = webpack(webpackConfig);
  const deferred = new Defer();

  compiler.run((err, stats) => {
    if (err) {
      return deferred.reject(err);
    }

    console.info(stats.toString(webpackConfig.stats));
    return deferred.resolve();
  });

  return deferred.promise;
}

export default bundle;
