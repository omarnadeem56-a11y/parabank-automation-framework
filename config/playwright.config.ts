import { defineConfig, devices } from '@playwright/test';
// Optional dotenv load: don't crash if not installed yet
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
} catch {}

// Environment-based URL handling
const env = process.env.TEST_ENV || 'local';
const urls: Record<string, string> = {
  local: 'http://localhost:8080/parabank',
  remote: 'https://parabank.parasoft.com/parabank',
};
export const baseURL = process.env.BASE_URL || urls[env];

console.log(`Running tests against: ${baseURL}`);

// Build reporters list conditionally (Allure only if available)
const reporters: any[] = [['list']];
try {
  require.resolve('allure-playwright');
  reporters.push(['allure-playwright']);
} catch {}

export default defineConfig({
  // Config is in ./config, so point one level up
  testDir: '../tests',
  testMatch: ['**/*.spec.ts'],
  timeout: 30_000,

  use: {
    baseURL,
    browserName: 'chromium',
    // Force headless in CI; locally respect HEADLESS env (default false)
    headless: !!process.env.CI || String(process.env.HEADLESS || '').toLowerCase() === 'true',
    // Visibility & debugging defaults (env-overridable)
    trace: (process.env.TRACE as any) || 'on',
    screenshot: (process.env.SCREENSHOT as any) || 'only-on-failure',
    video: (process.env.VIDEO as any) || 'on-first-retry',
    // No slowMo in CI unless explicitly requested
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
