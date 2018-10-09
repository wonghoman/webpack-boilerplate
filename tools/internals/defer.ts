/**
 * Copyright (c) 2018 Wind4 <puxiaping@gmail.com>
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
class Defer<T = void> {
  public readonly promise: PromiseLike<T>;
  public resolve!: (value?: T | PromiseLike<T>) => void;
  public reject!: (reason?: any) => void;

  /**
   * Initialize deferred promise
   */
  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export default Defer;
