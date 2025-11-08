import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { AccountOverviewPage } from '../pages/AccountOverviewPage';

test.describe('AUT-103: Account Overview Page Scenarios', () => {
  // Skip suite if default credentials are not available
  if (!process.env.DEFAULT_USER || !process.env.DEFAULT_PASS) {
    test.skip(true, 'DEFAULT_USER/DEFAULT_PASS not set; skipping account overview tests');
  }

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    // Navigate to ParaBank home (baseURL from config/env)
    await homePage.navigateTo('/');
    await homePage.goToLogin();

    // Login using default env credentials
    await loginPage.login(process.env.DEFAULT_USER!, process.env.DEFAULT_PASS!);

    // Ensure login is successful before running tests
    await expect(page.locator('h1.title')).toHaveText('Accounts Overview');
  });

  test('AUT-103: Verify Accounts Overview Page loads correctly', async ({ page }) => {
    const overviewPage = new AccountOverviewPage(page);

    // Verify the page has loaded
    await overviewPage.verifyLoaded();

    // Retrieve list of account numbers
    const accounts = await overviewPage.getAccountNumbers();
    console.log('Accounts found:', accounts);

    // Verify at least one account is present
    expect(accounts.length).toBeGreaterThan(0);
  });

  test('AUT-103: Verify user can click an account to view details', async ({ page }) => {
    const overviewPage = new AccountOverviewPage(page);

    // Wait for overview page to load
    await overviewPage.verifyLoaded();

    // Click on first account from the list
    const accounts = await overviewPage.getAccountNumbers();
    await overviewPage.clickAccountByNumber(accounts[0]);

    // Verify Account Details page loads
    await expect(page.locator('h1.title')).toHaveText('Account Details');
    await expect(page.locator('#accountId')).toHaveText(accounts[0]);
  });
});

