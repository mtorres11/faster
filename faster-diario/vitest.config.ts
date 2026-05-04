import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['node_modules', 'www', 'dist', 'tests/integration'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules',
        'www',
        'dist',
        '**/*.d.ts',
        'src/**/types.ts',
        'src/**/*.interface.ts',
      ],
      reportsDirectory: './coverage',
    },
  },
});
