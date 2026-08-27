import { expect, type Page } from '@playwright/test';
import { parsePrice } from '../utils/money';
import { waitForToastGone } from '../utils/toast';

export class CartPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }

  async disableIdProtection(): Promise<void> {
    const switches = this.page.getByRole('switch');
    const count = await switches.count();
    for (let i = 0; i < count; i++) {
      const toggle = switches.nth(i);
      if (await toggle.isChecked()) {
        await this.page.locator('.va-switch').nth(i).click();
        await expect(toggle).not.toBeChecked();
      }
    }
  }

  async expectHasItems(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /shopping cart/i })).toBeVisible();
    await expect(this.page.getByText(/^TOTAL:/)).toBeVisible();
  }

  async getTotal(): Promise<number> {
    const total = this.page.getByText(/^TOTAL:/);
    await expect(total).toBeVisible();
    return parsePrice(await total.innerText());
  }

  async clear(): Promise<void> {
    await this.goto();
    await waitForToastGone(this.page);

    for (let i = 0; i < 15; i++) {
      if (await this.isEmpty()) {
        return;
      }

      const row = this.page.getByRole('row').filter({ hasText: /Register / }).first();
      if ((await row.count()) === 0) {
        return;
      }

      await row.getByRole('cell').last().getByRole('button').click();
      await waitForToastGone(this.page);
    }
  }

  private async isEmpty(): Promise<boolean> {
    return this.page.getByRole('heading', { name: /cart is empty/i }).isVisible().catch(() => false);
  }
}
