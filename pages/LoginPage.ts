import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly usernameField = 'input[name="username"]';
  readonly passwordField = 'input[name="password"]';
  readonly loginButton = 'input[value="Log In"]';
  readonly errorMessage = '.error';
  readonly pageTitle = 'h1.title';

  async login(username: string, password: string) {
    await this.type(this.usernameField, username);
    await this.type(this.passwordField, password);
    await this.click(this.loginButton);
  }

  async verifyLoginSuccess() {
    await expect(this.page.locator(this.pageTitle)).toHaveText('Accounts Overview');
  }
  async verifyLoginFailure() {
    await expect(this.page.locator(this.errorMessage)).toBeVisible();
  }
}
