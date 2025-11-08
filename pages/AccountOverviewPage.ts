import { BasePage } from './BasePage';
import { expect } from '@playwright/test';


export class AccountOverviewPage extends BasePage {
    readonly title = 'h1.title'
    readonly accountTable = '#accountTable';
    readonly accountRows = '#accountTable tbody tr';

    async verifyLoaded() {
    await expect(this.page.locator(this.title)).toHaveText('Accounts Overview');
    await expect(this.page.locator(this.accountTable)).toBeVisible();
    }

    async getAccountNumbers(): Promise<string[]> {
    const accounts = await this.page.locator(`${this.accountRows} td a`).allInnerTexts();
    return accounts.map(acc => acc.trim());
  }

    async clickAccountByNumber(accountNumber: string) {
    await this.page.locator(`a:has-text("${accountNumber}")`).click();
  }

}