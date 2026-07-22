import { Page } from '@playwright/test';

export class DashboardPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('/dashboard');
    }

    getBalance() {
        return this.page.getByTestId('account-balance');
    }

    getTransactionRows() {
        return this.page.getByTestId('transaction-row');
    }

    getTransactionAmount() {
        return this.page.getByTestId('transaction-amount');
    }

    getEmptyStateMessage() {
        return this.page.getByTestId('empty-transactions-message');
    }

    async clickMakeTransfer() {
        await this.page.getByRole('button', { name: 'Make a Transfer' }).click();
    }

    async toggleFilters() {
        await this.page.getByRole('button', { name: 'Filters' }).click();
    }

    async filterByEmail(email: string) {
        await this.page.getByLabel('Filter by email').fill(email);
    }

    async clickSearch() {
        await this.page.getByRole('button', { name: 'Search' }).click();
    }

    async clickClear() {
        await this.page.getByRole('button', { name: 'Clear' }).click();
    }

    async selectSort(option: 'Newest first' | 'Oldest first' | 'Highest amount' | 'Lowest amount') {
        await this.page.getByRole('combobox').click();
        await this.page.getByRole('option', { name: option }).click();
    }


    async clickNextPage() {
        await this.page.getByRole('button', { name: 'Next' }).click();
    }

    async clickPreviousPage() {
        await this.page.getByRole('button', { name: 'Previous' }).click();
    }

    getPreviousButton() {
        return this.page.getByRole('button', { name: 'Previous' });
    }

    getNextButton() {
        return this.page.getByRole('button', { name: 'Next' });
    }
}