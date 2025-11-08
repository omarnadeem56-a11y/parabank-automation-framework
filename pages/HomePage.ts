import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Navigate using absolute URL built from BasePage.baseUrl
  async navigateTo(path: string = '/index.htm') {
    const targetPath = path === '/' ? '/index.htm' : path;
    const url = this.resolveUrl(targetPath);
    await this.page.goto(url);
    await expect(this.page).toHaveTitle(/ParaBank/);
  }

  // Go to the Register page from home
  async goToRegister() {
    const registerLink = this.page.locator('a[href*="register.htm"]');
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(this.page).toHaveURL(/register\.htm/);
  }
}
