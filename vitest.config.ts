import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    passWithNoTests: true,
    // Don't scan git worktree checkouts under .claude/ — they carry their own
    // stale copies of the test suite.
    exclude: [...configDefaults.exclude, '**/.claude/**'],
  },
});
