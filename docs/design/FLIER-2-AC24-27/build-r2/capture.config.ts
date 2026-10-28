import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /capture\.spec\.ts/,
  reporter: 'list',
  workers: 1,
  timeout: 90_000,
  outputDir: 'test-output',
  use: { baseURL: 'http://localhost:4179' },
  webServer: { command: 'npx vite preview --port 4179 --strictPort', port: 4179, reuseExistingServer: false, cwd: '../../../..' },
});
