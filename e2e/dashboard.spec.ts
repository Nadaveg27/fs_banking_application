import { test, expect } from '@playwright/test';
import { DashboardPage  } from './pages/DashboardPage';
import { NavbarComponent } from './components/NavbarComponent';
import { RECIPIENT_EMAIL, TEST_EMAIL } from './constants';

test.describe('Dashboard', () => {
    test('displays balance and welcome message on load', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();

        await expect(dashboardPage.getBalance()).toBeVisible();
        await expect(dashboardPage.getBalance()).toContainText('$');
    })
})