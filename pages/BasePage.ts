import { Page, expect, Locator } from '@playwright/test';
export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    const env = process.env.TEST_ENV || 'local';
    const urls: Record<string, string> = {
      local: 'http://localhost:8080/parabank',
      remote: 'https://parabank.parasoft.com/parabank',
    };
    this.baseUrl = urls[env] || urls.local;
  }

  protected resolveUrl(path: string): string {
    if (!path) return this.baseUrl;
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalized}`;
  }

  async navigateToHome() {
    const url = this.resolveUrl('/index.htm');
    await this.page.goto(url);
    await expect(this.page).toHaveURL(url);
  }

 async type(locator: Locator | string, text: string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.fill(text);
  }

  async click(locator: Locator | string) {
    const element = typeof locator === 'string' ? this.page.locator(locator) : locator;
    await element.click();
  }
}
