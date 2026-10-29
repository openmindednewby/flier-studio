import { defineConfig } from '@playwright/test';

const BUILD_AND_SERVE_MS = 240_000;

export default defineConfig({
  testDir: '.',
  testMatch: 'capture.build.spec.ts',
  reporter: 'line',
  workers: 1,
  use: { baseURL: 'http://localhost:4178' },
  webServer: { command: 'npm run build && npx vite preview --port 4178 --strictPort', cwd: '../../../..', port: 4178, reuseExistingServer: false, timeout: BUILD_AND_SERVE_MS },
});
