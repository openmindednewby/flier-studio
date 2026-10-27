import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4178' },
  webServer: { command: 'npx vite preview --port 4178 --strictPort', port: 4178, reuseExistingServer: false },
  projects: [
    { name: 'mobile', use: { ...devices['Galaxy S9+'], viewport: { width: 360, height: 640 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
});
