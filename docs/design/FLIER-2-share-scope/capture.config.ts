import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /(capture|regen).spec.ts/,
  reporter: 'list',
  workers: 1,
  outputDir: 'test-output',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4179' },
  webServer: { command: `npx vite preview --port 4179 --strictPort --outDir ${process.env.PREVIEW_DIR ?? 'dist'}`, port: 4179, reuseExistingServer: false, cwd: '../../..' },
});
