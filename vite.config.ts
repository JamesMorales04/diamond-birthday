/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The base path is configurable via the VITE_BASE_PATH environment variable.
// Defaults to '/' for local development.
// For GitHub Pages repository sites, set VITE_BASE_PATH=/<repo-name>/ in CI.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    target: 'es2020',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['node_modules', '.opencode', 'dist', 'e2e'],
  },
});
