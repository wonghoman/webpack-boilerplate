/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import fs from 'fs-extra';
import { PUBLIC_DIR, BUILD_DIR } from '../paths.config';

/**
 * Copies static files such as robots.txt, favicon.ico to the
 * output (build) folder.
 */
async function copy() {
  if (fs.pathExistsSync(PUBLIC_DIR)) {
    await fs.copy(PUBLIC_DIR, BUILD_DIR);
  }
}

export default copy;
