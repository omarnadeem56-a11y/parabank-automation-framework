import { test } from '@playwright/test';
import { BasePage } from '../pages/BasePage';

test('Verify ParaBank homepage loads', async ({ page }) => {
  const basePage = new BasePage(page);
  await basePage.navigateToHome();
});
