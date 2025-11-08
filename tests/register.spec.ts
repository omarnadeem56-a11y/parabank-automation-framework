import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';
import users from '../test-data/users.json';

test.describe('Registration Flow - Localhost ParaBank', () => {
  test('User can register successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    const registerPage = new RegisterPage(page);
    const user = users[0];

    await homePage.navigateTo('/');
    await homePage.goToRegister();
    await registerPage.registerUser(user);
    await registerPage.verifyRegistrationSuccess();
  });
});
