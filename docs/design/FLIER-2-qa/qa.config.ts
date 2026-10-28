import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: 'qa.sight.ts',
  reporter: 'list',
  timeout: 120000,
  use: { baseURL: 'http://localhost:4179' },
  webServer: { command: 'npx vite preview --port 4179 --strictPort', cwd: '../../..', port: 4179, reuseExistingServer: false },
  projects: [
    { name: 'm360', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } } },
    { name: 'd1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
});
