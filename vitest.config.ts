import { join } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // The playground imports the package the way an application does; resolve
    // it to the sources so that nothing has to be built first.
    alias: {
      'expand-chemical-groups': join(import.meta.dirname, 'src', 'index.ts'),
    },
  },
  test: {
    coverage: {
      // The include glob is unanchored, so it matches `dev/src` too unless the
      // playground — which is never packed — is excluded.
      include: ['src/**'],
      // `src/**` also matches the playground and `src/.npmignore`, which the
      // instrumenter would try to parse as source.
      exclude: ['dev/**', '**/.npmignore'],
      // openchemlib dominates the run; istanbul only instruments `src`.
      provider: 'istanbul',
    },
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
