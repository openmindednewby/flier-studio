import { defineConfig } from 'vitest/config';
import { themeColorPlugin } from './scripts/themeColor';

export default defineConfig({
  plugins: [themeColorPlugin()],
  build: { outDir: 'dist', target: 'es2022' },
  optimizeDeps: { exclude: ['@dloizides/llm-run'] },
  test: { environment: 'jsdom', environmentMatchGlobs: [['src/store/imageStore*', 'node']], include: ['src/**/*.test.ts', 'tests/**/*.test.ts'] },
});
