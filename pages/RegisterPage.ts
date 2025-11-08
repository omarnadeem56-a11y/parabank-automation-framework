import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class RegisterPage extends BasePage {
  readonly firstName = 'input[id="customer.firstName"]';
  readonly lastName = 'input[id="customer.lastName"]';
  readonly address = 'input[id="customer.address.street"]';
  readonly city = 'input[id="customer.address.city"]';
  readonly state = 'input[id="customer.address.state"]';
  readonly zipCode = 'input[id="customer.address.zipCode"]';
  readonly phone = 'input[id="customer.phoneNumber"]';
  readonly ssn = 'input[id="customer.ssn"]';
  readonly username = 'input[id="customer.username"]';
  readonly password = 'input[id="customer.password"]';
  readonly confirm = 'input[id="repeatedPassword"]';
  readonly registerBtn = 'input[value="Register"]';
  readonly successMsg = 'h1.title';
  private latestPassword: string | undefined;
  private latestUsername: string | undefined;

  private generateUniqueUsername(): string {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 5);
    return `auto_${stamp}${rand}`.slice(0, 20);
  }

  async registerUser(userData: any) {
    const uniqueUsername = this.generateUniqueUsername();
    const zip = /^\d+$/.test(userData.zip) ? userData.zip : '12345';
    const now = Date.now().toString();
    const ssnDigits = now.slice(-9).padStart(9, '0');
    const ssnUnique = `${ssnDigits.slice(0,3)}-${ssnDigits.slice(3,5)}-${ssnDigits.slice(5)}`;

    await this.type(this.firstName, userData.firstName);
    await this.type(this.lastName, userData.lastName);
    await this.type(this.address, userData.address);
    await this.type(this.city, userData.city);
    await this.type(this.state, userData.state);
    await this.type(this.zipCode, zip);
    await this.type(this.phone, userData.phone);
    await this.type(this.ssn, ssnUnique);
    await this.type(this.username, uniqueUsername);
    this.latestUsername = uniqueUsername;
    this.latestPassword = userData.password;
    await this.type(this.password, userData.password);
    await this.type(this.confirm, userData.password);
    await this.click(this.registerBtn);
  }

  async verifyRegistrationSuccess() {
    const header = this.page.locator(this.successMsg);
    await expect(header).toBeVisible();

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await expect(header).toContainText('Welcome', { timeout: 1000 });
        return;
      } catch {
        const errors = this.page.locator('.error, [id$=".errors"]');
        const count = await errors.count();
        const messages: string[] = [];
        for (let i = 0; i < count; i++) {
          messages.push((await errors.nth(i).innerText()).trim());
        }

        const duplicateUser = messages.find(m => /username.*exists/i.test(m));
        if (duplicateUser && attempt < 2) {
          const newUsername = this.generateUniqueUsername();
          await this.page.locator(this.username).fill(newUsername);
          this.latestUsername = newUsername;
          if (this.latestPassword) {
            await this.page.locator(this.password).fill(this.latestPassword);
            await this.page.locator(this.confirm).fill(this.latestPassword);
          }
          await this.click(this.registerBtn);
          continue;
        }

        const stateRequired = messages.find(m => /state\s+is\s+required/i.test(m));
        if (stateRequired && attempt < 2) {
          await this.page.locator(this.state).fill('CA');
          if (this.latestPassword) {
            await this.page.locator(this.password).fill(this.latestPassword);
            await this.page.locator(this.confirm).fill(this.latestPassword);
          }
          await this.click(this.registerBtn);
          continue;
        }

        if (messages.length) {
          throw new Error(`Registration did not succeed. Validation errors: ${messages.join(' | ')}`);
        }
        throw new Error('Registration did not succeed, and no validation messages were found.');
      }
    }
  }

  getLastCredentials(): { username: string; password: string } | undefined {
    if (this.latestUsername && this.latestPassword) {
      return { username: this.latestUsername, password: this.latestPassword };
    }
    return undefined;
  }
}
