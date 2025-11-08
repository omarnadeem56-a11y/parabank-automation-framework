import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import users from '../test-data/users.json';

type Creds = { username: string; password: string };
let seededCreds: Creds | undefined;

test.describe('Transfer Funds', () => {
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
    const home = new HomePage(page);
    const login = new LoginPage(page);
    await home.navigateTo('/');
    await home.goToLogin();
    if (!seededCreds) throw new Error('Credentials not initialized');
    await login.login(seededCreds.username, seededCreds.password);
    await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  });

  async function ensureTwoAccounts(page) {
    await page.locator('a[href*="transfer.htm"]').click();
    await expect(page).toHaveURL(/transfer\.htm/);
    const from = page.locator('select#fromAccountId');
    const options = await from.locator('option').all();
    const values = [];
    for (const opt of options) {
      const v = await opt.getAttribute('value');
      if (v && v.trim()) values.push(v);
    }
    if (new Set(values).size >= 2) return;
    await page.locator('a[href*="openaccount.htm"]').click();
    await expect(page).toHaveURL(/openaccount\.htm/);
    await page.locator('select#type').selectOption({ value: '1' });
    const fromAcc = values[0] || (await page.locator('select#fromAccountId option').nth(1).getAttribute('value')) || '';
    if (fromAcc) await page.locator('select#fromAccountId').selectOption({ value: fromAcc });
    await page.getByRole('button', { name: 'Open New Account' }).click();
    await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();
    await page.locator('a[href*="transfer.htm"]').click();
    await expect(page).toHaveURL(/transfer\.htm/);
  }

  test('User can transfer funds successfully', async ({ page }) => {
    await ensureTwoAccounts(page);
    const transfer = new TransferFundsPage(page);
    await transfer.fillAmount(100);
    await transfer.selectFirstTwoDistinctAccounts();
    await transfer.submitTransfer();
    await transfer.verifySuccess();
  });
});
