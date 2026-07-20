import { Page } from '@playwright/test';

// Page Object Model for the /transfer page — encapsulates locators and actions
//  so tests describe behavior, not implementation.
export class TransferPage {
    constructor( private page : Page) {}

    async goto() {
        await this.page.goto('/transfer');
    }

    async fillTransferForm(recipientEmail: string, amount: string, reason?: string) {
        await this.page.getByLabel('Recipient Email').fill(recipientEmail);
        await this.page.getByLabel('Amount').fill(amount);
        if (reason) {
            await this.page.getByLabel('Reason (Optional)').fill(reason);
        }
    }

    async submit() {
        await this.page.getByRole('button', { name: 'Submit Transfer' }).click();
    }

    async clickCancel() {
        await this.page.getByRole('button', { name: 'Cancel' }).click();
    }

    getSuccessHeading() {
        return this.page.getByRole('heading', { name: 'Transfer Complete' });
    }

    getBackToDashboard() {
        return this.page.getByRole('button', {name: 'Back to Dashboard'});
    }

    getError() {
        return this.page.getByRole('alert');
    }

    getAmountInput() {
        return this.page.getByLabel('Amount');
    }

    getSubmitButton() {
        return this.page.locator('button[type="submit"]');
    }
}