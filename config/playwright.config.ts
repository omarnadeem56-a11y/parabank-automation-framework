import { defineConfig, devices } from '@playwright/test';

// Environment-based URL handling
const env = process.env.TEST_ENV || 'local';
const urls: Record<string, string> = {
  local: 'http://localhost:8080/parabank',
  remote: 'https://parabank.parasoft.com/parabank',
};
export const baseURL = urls[env];

console.log(`Running tests against: ${baseURL}`);

export default defineConfig({
  // Config is in ./config, so point one level up
  testDir: '../tests',
  testMatch: ['**/*.spec.ts'],
  timeout: 30_000,

  use: {
    baseURL,
    browserName: 'chromium',
    headless: false,
    // Visibility & debugging defaults
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    launchOptions: { slowMo: 200 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
