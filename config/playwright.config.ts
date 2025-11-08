import { defineConfig, devices } from '@playwright/test';
try {
  require('dotenv').config();
} catch {}

const env = process.env.TEST_ENV || 'local';
const urls: Record<string, string> = {
  local: 'http://localhost:8080/parabank',
  remote: 'https://parabank.parasoft.com/parabank',
};
export const baseURL = process.env.BASE_URL || urls[env];

console.log(`Running tests against: ${baseURL}`);

const reporters: any[] = [['list']];
try {
  require.resolve('allure-playwright');
  reporters.push(['allure-playwright']);
} catch {}

export default defineConfig({
  testDir: '../tests',
  testMatch: ['**/*.spec.ts'],
  timeout: 30_000,

  use: {
    baseURL,
    browserName: 'chromium',
    headless: !!process.env.CI || String(process.env.HEADLESS || '').toLowerCase() === 'true',
    trace: (process.env.TRACE as any) || 'on',
    screenshot: (process.env.SCREENSHOT as any) || 'only-on-failure',
    video: (process.env.VIDEO as any) || 'on-first-retry',
    launchOptions: { slowMo: Number(process.env.SLOW_MO || (process.env.CI ? 0 : 200)) },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: reporters,
});
