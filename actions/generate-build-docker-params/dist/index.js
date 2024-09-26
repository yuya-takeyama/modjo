'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const run_1 = require('./run');
const core_1 = require('@actions/core');
(async () => {
  try {
    (0, run_1.run)();
  } catch (err) {
    if (err instanceof Error) {
      (0, core_1.setFailed)(err);
    } else {
      (0, core_1.setFailed)(`An error occurred: ${err}`);
    }
  }
})();
