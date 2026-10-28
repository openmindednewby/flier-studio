import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /final2-sighting\.spec\.ts/,
  reporter: 'list',
  timeout: 240000,
  workers: 1,
  outputDir: './test-output',
  use: { baseURL: 'http://localhost:4190', acceptDownloads: true },
  webServer: { command: 'npx vite preview --port 4190 --strictPort', cwd: '../../../..', port: 4190, reuseExistingServer: false },
  projects: [
    { name: 'mobile', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
});
