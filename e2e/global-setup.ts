import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { TEST_EMAIL, TEST_PASSWORD } from './constants';

const BASE_URL = 'https://fs-banking-application.vercel.app';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL }); 
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_EMAIL, TEST_PASSWORD);

  await page.waitForURL(/dashboard/, { timeout: 60000 });

  await page.context().storageState({ path: 'playwright/.auth/user.json' });
  await browser.close();
}