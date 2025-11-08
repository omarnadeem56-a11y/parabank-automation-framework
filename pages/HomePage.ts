import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class HomePage extends BasePage {
  // ---------- Locators ----------
  private readonly loginLink = 'a[href*="login.htm"]';
  private readonly registerLink = 'a[href*="register.htm"]';
  private readonly leftPanel = '#leftPanel';
  private readonly pageTitle = 'ParaBank | Welcome | Online Banking';

  // ---------- Navigation ----------
  async navigateTo(path: string = '/index.htm') {
    const target = path === '/' ? '/index.htm' : path;
    const fullUrl = this.resolveUrl(target);

    const response = await this.page.goto(fullUrl);
    expect(response, `Failed to navigate to ${fullUrl}`).toBeTruthy();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveTitle(/ParaBank/i);

    // Be flexible across environments: only assert left panel if present
    const leftPanel = this.page.locator(this.leftPanel);
    if (await leftPanel.count()) {
      await expect(leftPanel).toBeVisible();
    }
  }

  // ---------- Actions ----------
  async goToLogin() {
    const usernameField = this.page.locator('input[name="username"]');
    if (await usernameField.count()) {
      return; // login form already visible on home page
    }
    const loginLink = this.page.locator(this.loginLink);
    if (await loginLink.count()) {
      await loginLink.click();
      await expect(this.page).toHaveURL(/login\.htm/);
      return;
    }
    // Fallback: navigate directly
    await this.page.goto(this.resolveUrl('/login.htm'));
    await expect(this.page).toHaveURL(/login\.htm/);
  }

  async goToRegister() {
    // If link exists, use it; otherwise direct navigate
    const registerLink = this.page.locator(this.registerLink);
    if (await registerLink.count()) {
      await registerLink.click();
      await expect(this.page).toHaveURL(/register\.htm/);
      return;
    }
    await this.page.goto(this.resolveUrl('/register.htm'));
    await expect(this.page).toHaveURL(/register\.htm/);
  }

  // ---------- Assertions ----------
  async verifyWelcomeMessage() {
    await expect(this.page.locator(this.welcomeText)).toContainText('Welcome');
  }
}
