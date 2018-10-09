/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import path from 'path';
import chalk from 'chalk';
import glob from 'glob';
import { ENTRY_DIR, SRC_DIR } from '../paths.config';

interface IEntrySet {
  [name: string]: IEntry;
}

interface IEntry {
  script: string;
  template?: string;
}

/**
 * Trim the extname
 */
function trimExtname(filename: string) {
  const ext = path.extname(filename);
  return ext ? filename.slice(0, -ext.length) : filename;
}

/**
 * Get the relative path of the root directory
 */
function relativeRoot(filename: string) {
  return `./${path.join(path.relative(SRC_DIR, ENTRY_DIR), filename)}`;
}

/**
 * Find the entry template
 */
function findTemplate(name: string): string | undefined {
  return glob.sync(`${name}.{ejs,html}`, {
    cwd: ENTRY_DIR,
    nodir: true,
  })[0];
}

/**
 * Looking for the entry files
 */
function lookupEntries() {
  return glob
    .sync('**/*.{ts,tsx}', {
      cwd: ENTRY_DIR,
      nodir: true,
    })
    .reduce(
      (entries: IEntrySet, script: string) => {
        const name = trimExtname(script);
        const template = findTemplate(name);

        if (!entries[name]) {
          entries[name] = {
            script: relativeRoot(script),
            template: template && relativeRoot(template),
          };
        } else {
          console.warn(
            chalk.yellow(`Warning: The entry '${name}' already exists, '${relativeRoot(script)}' will be ignored.`),
          );
        }

        return entries;
      },
      {} as IEntrySet,
    );
}

export default lookupEntries;
