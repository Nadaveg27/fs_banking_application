import { test, expect } from '@playwright/test';
import { DashboardPage  } from './pages/DashboardPage';
import { NavbarComponent } from './components/NavbarComponent';

const NEGATIVE_COLOR_HEX = '#FF6B6B';
const POSITIVE_COLOR_HEX = '#6BFF9E';

function hexToRBG(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgb(${r}, ${g}, ${b})`;
}

test.describe('Dashboard', () => {
    test('displays balance and welcome message on load', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();

        await expect(dashboardPage.getBalance()).toBeVisible();
        await expect(dashboardPage.getBalance()).toContainText('$');
    })

    test('transaction amounts render with the correct sign and color logic', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();
        
        // If this account genuinely has zero transactions, this assertion fails
        // (not skips) — the test account is expected to always have history
        await expect(dashboardPage.getTransactionRows().first()).toBeVisible({ timeout: 10000 });

        const firstAmount = dashboardPage.getTransactionAmount().first();
        const color = await firstAmount.evaluate(el => window.getComputedStyle(el).color);  
        const text = await firstAmount.textContent();

        const isNegative = text?.startsWith('-');
        const expectedColor = isNegative ? 
                        hexToRBG(NEGATIVE_COLOR_HEX) : hexToRBG(POSITIVE_COLOR_HEX);
        
        expect(text).toMatch(/^[+-]\$\d+\.\d{2}$/);
        expect(color).toBe(expectedColor);
    })

    test('make a Transfer button navigates to transfer page', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();

        await dashboardPage.clickMakeTransfer();

        await expect(page).toHaveURL(/transfer/);
    });

    test('filtering to a non-exsitent counterparty shows empty state', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();

        await dashboardPage.toggleFilters();
        await dashboardPage.filterByEmail('definitely_not_a_real_email@not_gmail.com');
        await dashboardPage.clickSearch();

        await expect(dashboardPage.getEmptyStateMessage()).toBeVisible();
    });

    test('logout redirects to login and invalidates the session', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        const navbarComponent = new NavbarComponent(page);
        await dashboardPage.goto();

        await navbarComponent.clickLogout();
        await expect(page).toHaveURL(/login/);

        // navigating back to the dashboard should redirect to login again,
        // proving the session was actually cleared server-side — not just
        // that the UI navigated away
        await dashboardPage.goto();
        await expect(page).toHaveURL(/login/);
    })

    test('sorting by highest amount shows the largest transaction first', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();

        await expect(dashboardPage.getTransactionRows().first()).toBeVisible({ timeout: 10000 });

        await dashboardPage.selectSort('Highest amount');

        await expect(dashboardPage.getTransactionRows().first()).toBeVisible({ timeout: 10000 });

        const amounts = await dashboardPage.getTransactionRows().allTextContents();
        const parsedAmounts = amounts.map(a => parseFloat(a.replace(/[+$]/g, '')));

        const sortedDescending = [...parsedAmounts].sort((a, b) => Math.abs(b) - Math.abs(a));
        expect(parsedAmounts).toEqual(sortedDescending);
    });

    test('previous button is disabled on the first page', async ({ page }) => {
        const dashboardPage = new DashboardPage(page);
        await dashboardPage.goto();

        await expect(dashboardPage.getTransactionRows().first()).toBeVisible({ timeout: 10000});

        await expect(dashboardPage.getPreviousButton()).toBeDisabled();
    });
})