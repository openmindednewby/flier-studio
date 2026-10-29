import { defineConfig } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  testDir: '.',
  testMatch: /capture\.spec\.ts/,
  reporter: 'list',
  workers: 2,
  timeout: 180_000,
  outputDir: join(tmpdir(), 'flier2-ac44-45-test-output'),
  use: { baseURL: process.env.CAPTURE_URL ?? 'https://fliers.dloizides.com' },
});
