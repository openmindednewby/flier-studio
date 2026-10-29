import { defineConfig, devices } from '@playwright/test';

const BUILD_AND_SERVE_MS = 240_000;

export default defineConfig({
  testDir: 'e2e',
  reporter: 'list',
  use: { baseURL: 'http://localhost:4178' },
  webServer: { command: 'npm run build && npx vite preview --port 4178 --strictPort', port: 4178, reuseExistingServer: false, timeout: BUILD_AND_SERVE_MS },
  projects: [
    { name: 'mobile', use: { ...devices['Galaxy S5'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
});
