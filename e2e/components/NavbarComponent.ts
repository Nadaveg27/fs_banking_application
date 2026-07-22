import { Page } from '@playwright/test';

export class NavbarComponent {
    constructor(private page: Page) {}

    async clickLogout() {
        await this.page.getByRole('button', { name: 'Sign Out' }).click();
    }
}