// 📁 tests/homepage.spec.ts
import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test('Navigate to register page via homepage', async ({ page }) => {
  const home = new HomePage(page);

  await home.navigateTo();     // open the homepage
  await home.goToRegister();   // click "Register"
});
