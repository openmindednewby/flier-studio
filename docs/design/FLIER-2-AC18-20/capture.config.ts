import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /capture\.spec\.ts/,
  reporter: 'list',
  workers: 1,
  timeout: 90_000,
  outputDir: 'test-output',
  use: { baseURL: process.env.CAPTURE_URL ?? 'https://fliers.dloizides.com' },
});
