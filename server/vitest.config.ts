import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // Each test file boots its own in-memory Postgres (PGlite); keep files isolated.
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
