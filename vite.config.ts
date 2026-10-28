import { defineConfig } from 'vitest/config';
import { bgRemovalAssetsPlugin } from '@dloizides/background-removal/vite';
import { themeColorPlugin } from './scripts/themeColor';

export default defineConfig({
  plugins: [themeColorPlugin(), bgRemovalAssetsPlugin()],
  build: { outDir: 'dist', target: 'es2022' },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['@dloizides/llm-run', '@dloizides/background-removal'] },
  test: { environment: 'jsdom', environmentMatchGlobs: [['src/store/imageStore*', 'node'], ['src/share/shareCodec*', 'node']], include: ['src/**/*.test.ts', 'tests/**/*.test.ts'] },
});
