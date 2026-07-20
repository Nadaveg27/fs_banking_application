import { Page } from '@playwright/test';

export class LoginPage {
    constructor(private page : Page) {}

    async goto() {
        await this.page.goto('/login');
    }

    async login(email: string, password: string) {
        await this.page.getByLabel('Email Address').fill(email);
        await this.page.getByLabel('Password').fill(password);
        await this.page.getByRole('button', { name: 'Sign In'}).click();
    }

    getError() {
        return this.page.getByRole('alert');
    }
}