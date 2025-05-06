// vitest.config.ts
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path'; // Import path module

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: ['server/**/*.spec.ts'], // Exclude server tests
  },
  ssr: {
    noExternal: ['h3'],
  },
  resolve: { // Add this section
    alias: {
      '~': path.resolve(__dirname, '.'), // Alias for ~/*
      '@': path.resolve(__dirname, '.'), // Alias for @/* (often same as ~)
    },
  },
});