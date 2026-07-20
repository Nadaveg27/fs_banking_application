import { test, expect } from '@playwright/test';
import { TEST_EMAIL, TEST_PASSWORD } from './constants';
import { LoginPage } from './pages/LoginPage'


test.describe('Login', () => { 
    // Arrange — clear the storageState session for these tests specifically
    test('valid credentials redirect to dashboard', async ({ page }) => {
      await page.context().clearCookies();
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD);

      await expect(page).toHaveURL(/dashboard/);
    });

    test('invalid credentials show error message', async ({ page }) => {
      await page.context().clearCookies();
      const loginPage = new LoginPage(page);
      await loginPage.goto();

      await loginPage.login('wrong@example.com', 'wrongpassword');

      await expect(loginPage.getError()).toBeVisible();
      await expect(page).toHaveURL(/login/);
    });

    test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
      // because this test is explicitly testing the UN-authenticated state
      await page.context().clearCookies();
      await page.goto('/dashboard');

      await expect(page).toHaveURL(/login/);
    });

});