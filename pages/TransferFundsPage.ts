import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class TransferFundsPage extends BasePage {
  readonly amountInput = '#amount, input[name="amount"]';
  readonly fromSelect = 'select#fromAccountId';
  readonly toSelect = 'select#toAccountId';
  readonly transferButton = 'input[value="Transfer"], input[type="submit"][value*="Transfer"]';
  readonly successHeading = 'Transfer Complete!';

  async fillAmount(amount: number | string) {
    const value = typeof amount === 'number' ? amount.toString() : amount;
    await this.type(this.amountInput, value);
  }

  async selectFromAccount(value: string) {
    await this.page.locator(this.fromSelect).selectOption({ value });
  }

  async selectToAccount(value: string) {
    await this.page.locator(this.toSelect).selectOption({ value });
  }

  async selectFirstTwoDistinctAccounts() {
    const from = this.page.locator(this.fromSelect);
    const to = this.page.locator(this.toSelect);
    const fromOptions = await from.locator('option').all();
    const values: string[] = [];
    for (const opt of fromOptions) {
      const v = await opt.getAttribute('value');
      if (v && v.trim().length > 0) values.push(v);
    }
    const first = values[0];
    const second = values.find((v) => v !== first);
    if (!first || !second) throw new Error('Not enough distinct accounts to transfer between');
    await from.selectOption({ value: first });
    await to.selectOption({ value: second });
  }

  async submitTransfer() {
    await this.click(this.transferButton);
  }

  async verifySuccess() {
    await expect(this.page.getByRole('heading', { name: this.successHeading })).toBeVisible();
  }
}

