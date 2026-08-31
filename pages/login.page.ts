import { expect } from '@playwright/test';
import { BasePage } from './base.page';
import { routes } from '../utils/constants';
import { urlEndsWith } from '../utils/regexp';

export class LoginPage extends BasePage {
  readonly email = this.page.getByRole('textbox', { name: 'email' });
  readonly password = this.page.getByRole('textbox', { name: 'password' });
  readonly submit = this.page.locator('form').getByRole('button', { name: 'Login' });

  async login(email: string, password: string): Promise<void> {
    await this.page.goto(routes.login);
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
    await expect(this.page).toHaveURL(urlEndsWith(routes.domains));
  }
}
