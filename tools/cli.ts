/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import parseArgs from 'minimist';
import { fork } from 'child_process';
import run from './internals/run';

if (process.send) {
  const scriptName = process.argv[2];
  if (scriptName) {
    const args = parseArgs(process.argv.slice(3), {
      boolean: ['dev'],
      string: ['env'],
    });

    // tslint:disable-next-line:no-var-requires
    const { initEnvironment } = require('./internals/env');
    initEnvironment(args);

    // tslint:disable-next-line:no-var-requires
    const script = require(`./scripts/${scriptName}.ts`);
    run(script, args).catch((err: Error) => {
      console.error(err.stack);
      process.exit(1);
    });
  } else {
    console.error('Error: Missing script parameters.');
  }
} else {
  fork(__filename, process.argv.slice(2), {
    env: Object.assign({}, process.env, {
      // Search custom module definitions
      // https://github.com/TypeStrong/ts-node#help-my-types-are-missing
      TS_NODE_FILES: 'true',
    }),
  });
}
