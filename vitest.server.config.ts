// vitest.server.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Use Node.js environment for server tests
    include: ['server/**/*.spec.ts'], // Only include server tests
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
      '@': path.resolve(__dirname, '.'),
      // Potentially alias '#imports' if server code uses Nuxt auto-imports
      // '#imports': path.resolve(__dirname, '.nuxt/imports.d.ts') // Example, actual path might vary
    },
  },
});