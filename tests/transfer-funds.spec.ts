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

    const fromSelect = page.locator('select#fromAccountId');
    await fromSelect.waitFor();
    const values = await page.$$eval(
      'select#fromAccountId option',
      els => els.map(e => /** @type {HTMLOptionElement} */(e).value).filter(v => v && v.trim().length > 0)
    );
    if (new Set(values).size >= 2) return;

    await page.locator('a[href*="openaccount.htm"]').click();
    await expect(page).toHaveURL(/openaccount\.htm/);

    const typeSelect = page.locator('select#type');
    await typeSelect.waitFor();
    await typeSelect.selectOption({ value: '1' });

    const fundingSelect = page.locator('select#fromAccountId');
    await fundingSelect.waitFor();
    const fundingValues = await page.$$eval(
      'select#fromAccountId option',
      els => els.map(e => /** @type {HTMLOptionElement} */(e).value).filter(v => v && v.trim().length > 0)
    );
    const funding = fundingValues[0];
    if (funding) await fundingSelect.selectOption({ value: funding });

    await page.getByRole('button', { name: /open new account/i }).click();
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
