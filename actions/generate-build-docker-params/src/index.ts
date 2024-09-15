import { run } from './run';
import { setFailed } from '@actions/core';

(async () => {
  try {
    run();
  } catch (err) {
    if (err instanceof Error) {
      setFailed(err);
    } else {
      setFailed(`An error occurred: ${err}`);
    }
  }
})();
