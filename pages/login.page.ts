import { expect, type Page } from '@playwright/test';
import { routes } from '../utils/constants';
import { urlEndsWith } from '../utils/regexp';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(email: string, password: string): Promise<void> {
    await this.page.goto(routes.login);
    await this.page.getByRole('textbox', { name: 'email' }).fill(email);
    await this.page.getByRole('textbox', { name: 'password' }).fill(password);
    await this.page.locator('form').getByRole('button', { name: 'Login' }).click();
    await expect(this.page).toHaveURL(urlEndsWith(routes.domains));
  }
}
