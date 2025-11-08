import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';

test.describe('Transfer Funds', () => {
  if (!process.env.DEFAULT_USER || !process.env.DEFAULT_PASS) {
    test.skip(true, 'DEFAULT_USER/DEFAULT_PASS not set; skipping transfer tests');
  }

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    const login = new LoginPage(page);
    await home.navigateTo('/');
    await home.goToLogin();
    await login.login(process.env.DEFAULT_USER!, process.env.DEFAULT_PASS!);
    await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  });

  test('User can transfer funds successfully', async ({ page }) => {
    await page.locator('a[href*="transfer.htm"]').click();
    await expect(page).toHaveURL(/transfer\.htm/);

    const transfer = new TransferFundsPage(page);
    await transfer.fillAmount(100);
    await transfer.selectFirstTwoDistinctAccounts();
    await transfer.submitTransfer();
    await transfer.verifySuccess();
  });
});

