import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    glob: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules', 'www', 'dist'],
  },
});
