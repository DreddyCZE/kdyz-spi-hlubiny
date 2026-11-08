import { defineConfig } from '@playwright/test';

const port=process.env.E2E_PORT||'4174';
const baseURL=`http://127.0.0.1:${port}/dist/`;
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run build:pages && node scripts/serve.mjs',
    url: baseURL,
    env: { PORT: port },
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
