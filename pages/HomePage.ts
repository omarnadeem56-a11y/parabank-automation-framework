import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class HomePage extends BasePage {
  // ---------- Locators ----------
  private readonly loginLink = 'a[href*="login.htm"]';
  private readonly registerLink = 'a[href*="register.htm"]';
  private readonly welcomeText = '#leftPanel > p';
  private readonly pageTitle = 'ParaBank | Welcome | Online Banking';

  // ---------- Navigation ----------
  async navigateTo(path: string = '/index.htm') {
    const target = path === '/' ? '/index.htm' : path;
    const fullUrl = this.resolveUrl(target);

    await this.page.goto(fullUrl);
    await expect(this.page).toHaveTitle(/ParaBank/i);
    await expect(this.page.locator(this.welcomeText)).toBeVisible();
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
    const registerLink = this.page.locator(this.registerLink);
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(this.page).toHaveURL(/register\.htm/);
  }

  // ---------- Assertions ----------
  async verifyWelcomeMessage() {
    await expect(this.page.locator(this.welcomeText)).toContainText('Welcome');
  }
}
