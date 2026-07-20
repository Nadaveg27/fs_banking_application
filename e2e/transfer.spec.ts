import { test, expect } from '@playwright/test';
import { RECIPIENT_EMAIL, TEST_EMAIL } from './constants';
import { TransferPage } from './pages/TransferPage'

test.describe('Transfer', () => {

    test('happy path: successful transfer shows Transfer Complete screen', async ({ page }) => {
        // Arrange — storageState handles auth, navigate directly to transfer
        const transferPage = new TransferPage(page);
        await transferPage.goto();

        // Act
        await transferPage.fillTransferForm(RECIPIENT_EMAIL, '1');
        await transferPage.submit();

        // Assert: success state rendered
        await expect(transferPage.getSuccessHeading()).toBeVisible();
        await expect(transferPage.getBackToDashboard()).toBeVisible();

        // Assert: URL stayed on transfer page (no redirect on success)
        await expect(page).toHaveURL(/transfer/);

        // Assert: clicking Back to Dashboard navigates correctly
        await transferPage.getBackToDashboard().click();
        await expect(page).toHaveURL(/dashboard/);
    });

    test('happy path with reason: transfer including optional reason field succeeds', async ({ page }) => {
        const transferPage = new TransferPage(page);
        await transferPage.goto();

        await transferPage.fillTransferForm(RECIPIENT_EMAIL, '1', 'Test transfer with reason');
        await transferPage.submit();

        // Assert: optional reason field doesn't break the happy path
        await expect(transferPage.getSuccessHeading()).toBeVisible();
        await expect(page).toHaveURL(/transfer/);
    });

    test('insufficient balance shows error message', async ({ page }) => {
        const transferPage = new TransferPage(page);
        await transferPage.goto();        

        await transferPage.fillTransferForm(RECIPIENT_EMAIL, '999999999');
        await transferPage.submit();

        await expect(transferPage.getError()).toBeVisible();
        await expect(page).toHaveURL(/transfer/);
    });

    test('nonexistent recipient shows error message', async ({ page }) => {
        const transferPage = new TransferPage(page);
        await transferPage.goto();        

        await transferPage.fillTransferForm('doesnotexist@nowhere.com', '1');
        await transferPage.submit();

        await expect(transferPage.getError()).toBeVisible();
        await expect(page).toHaveURL(/transfer/);
    });

    test('self-transfer shows error message', async ({ page }) => {
        // Sending to own email triggers SELF_TRANSFER rejection from backend
        const transferPage = new TransferPage(page);
        await transferPage.goto();        

        await transferPage.fillTransferForm(TEST_EMAIL, '1');
        await transferPage.submit();

        await expect(transferPage.getError()).toBeVisible();
        await expect(page).toHaveURL(/transfer/);
    });

    test('invalid amount (zero) shows client-side error before submitting', async ({ page }) => {
        // Amount of 0 triggers client-side validation in handleSubmit
        // before any API call is made — tests the FRONTEND validation layer
        const transferPage = new TransferPage(page);
        await transferPage.goto();        

        await transferPage.fillTransferForm(RECIPIENT_EMAIL, '0');
        await transferPage.submit();

        await expect(transferPage.getError()).toBeVisible();
        await expect(page).toHaveURL(/transfer/);
    });

    test('negative amount is rejected by input field', async ({ page }) => {
        // The onChange regex /^\d*\.?\d*$/ physically prevents '-' from being
        // accepted by the input — tests that INPUT ENFORCEMENT is working
        const transferPage = new TransferPage(page);
        await transferPage.goto(); 

        await transferPage.getAmountInput().fill('-50');

        // the field should be empty after attempting to fill it with negative amount
        await expect(transferPage.getAmountInput()).toHaveValue('');

        // The submit button should still be present (no navigation happened)
        await expect(transferPage.getSubmitButton()).toBeVisible();
    });

    test('cancel button returns to dashboard', async ({ page }) => {
        const transferPage = new TransferPage(page);
        await transferPage.goto(); 

        await transferPage.clickCancel();

        await expect(page).toHaveURL(/dashboard/);
    });

    test('submit button is disabled and shows loading text while request is in flight', async ({ page }) => {
        const transferPage = new TransferPage(page);
        await transferPage.goto();

        // Artificially delay the transfer API response so the loading state
        // is observable long enough for the assertion to catch it
        await page.route('**/api/transactions', async route => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.continue();
        });

        await transferPage.fillTransferForm(RECIPIENT_EMAIL, '1');

        // Click submit, but don't await it yet — we want to catch the brief "loading" moment
        const submitPromise = transferPage.getSubmitButton().click();

        // Immediately check the button's state WHILE the request is still in flight
        await expect(transferPage.getSubmitButton()).toBeDisabled();
        await expect(transferPage.getSubmitButton()).toHaveText('Sending...');

        await submitPromise;
    })
}); 