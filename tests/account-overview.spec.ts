import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AccountOverviewPage } from '../pages/AccountOverviewPage';
import users from '../test-data/users.json';

type Creds = { username: string; password: string };
let seededCreds: Creds | undefined;

test.describe('AUT-103: Account Overview Page Scenarios', () => {
  if (
    process.env.CI &&
    (process.env.TEST_ENV === 'remote' || !process.env.TEST_ENV) &&
    (!process.env.DEFAULT_USER || !process.env.DEFAULT_PASS)
  ) {
    test.skip(true, 'Skipping account overview in CI remote without seeded credentials');
  }
  test.beforeAll(async ({ browser }) => {
    if (process.env.DEFAULT_USER && process.env.DEFAULT_PASS) {
      seededCreds = { username: process.env.DEFAULT_USER, password: process.env.DEFAULT_PASS };
      return;
    }

    const page = await browser.newPage();
    const home = new HomePage(page);
    const register = new RegisterPage(page);

    await home.navigateTo('/');
    await home.goToRegister();
    const user = users[0];
    await register.registerUser(user);
    await register.verifyRegistrationSuccess();
    const last = register.getLastCredentials();
    if (!last) throw new Error('Failed to retrieve newly created credentials');
    seededCreds = last;
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.navigateTo('/');
    await homePage.goToLogin();

    if (!seededCreds) throw new Error('Credentials not initialized');
    await loginPage.login(seededCreds.username, seededCreds.password);

    await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Error!' })).toHaveCount(0);
  });

  test('AUT-103: Verify Accounts Overview Page loads correctly', async ({ page }) => {
    const overviewPage = new AccountOverviewPage(page);

    await overviewPage.verifyLoaded();

    const accounts = await overviewPage.getAccountNumbers();
    console.log('Accounts found:', accounts);

    expect(accounts.length).toBeGreaterThan(0);
  });

  test('AUT-103: Verify user can click an account to view details', async ({ page }) => {
    const overviewPage = new AccountOverviewPage(page);

    await overviewPage.verifyLoaded();

    const accounts = await overviewPage.getAccountNumbers();
    await overviewPage.clickAccountByNumber(accounts[0]);

    await expect(page.getByRole('heading', { name: 'Account Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account Activity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Error!' })).toHaveCount(0);
    await expect(page.locator('#rightPanel #accountId')).toHaveText(accounts[0]);
  });
});

