import * as core from '@actions/core';
import { run } from './main';

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : 'An unexpected error occurred');
});
