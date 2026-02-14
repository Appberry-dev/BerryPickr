import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:43123',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm run dev:fixture',
    url: 'http://127.0.0.1:43123',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
