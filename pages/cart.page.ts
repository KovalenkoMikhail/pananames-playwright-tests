import { expect } from '@playwright/test';
import { CART_CLEAR_MAX_ITEMS, routes } from '../utils/constants';
import { parsePrice } from '../utils/money';
import { waitForToastGone } from '../utils/toast';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly shoppingCartHeading = this.page.getByRole('heading', { name: 'Shopping cart', exact: true });
  readonly emptyHeading = this.page.getByRole('heading', { name: 'Cart is empty', exact: true });
  readonly registerRows = this.page.getByRole('row').filter({ hasText: /Register / });
  // "Review your shopping cart:" also contains "shopping cart"; TOTAL appears more than once.
  readonly total = this.page.getByText(/TOTAL:/).last();
  readonly idProtectionSwitches = this.page.getByRole('switch');

  async goto(): Promise<void> {
    await this.page.goto(routes.cart);
    await expect(this.shoppingCartHeading.or(this.emptyHeading)).toBeVisible();
  }

  async disableIdProtection(): Promise<void> {
    const count = await this.idProtectionSwitches.count();
    for (let i = 0; i < count; i++) {
      // Overlay intercepts the switch thumb; force toggles the control.
      await this.idProtectionSwitches.nth(i).setChecked(false, { force: true });
    }
  }

  async expectHasItems(): Promise<void> {
    await expect(this.registerRows.first()).toBeVisible();
    await expect(this.total).toBeVisible();
  }

  async getTotal(): Promise<number> {
    await expect(this.total).toBeVisible();
    return parsePrice(await this.total.innerText());
  }

  async expectTotal(expected: number): Promise<void> {
    await expect
      .poll(async () => this.getTotal(), {
        message: `cart TOTAL should equal ${expected} after ID Protection is off`,
      })
      .toBe(expected);
  }

  async clear(): Promise<void> {
    if (this.page.isClosed()) {
      return;
    }
    await this.goto();
    await waitForToastGone(this.page);

    for (let i = 0; i < CART_CLEAR_MAX_ITEMS && (await this.registerRows.count()) > 0; i++) {
      // Row actions have no accessible name; the last cell is the remove control.
      await this.registerRows.first().getByRole('cell').last().getByRole('button').click();
      await waitForToastGone(this.page);
      if (await this.emptyHeading.isVisible()) {
        return;
      }
    }

    if ((await this.registerRows.count()) > 0) {
      throw new Error('Failed to clear the shopping cart');
    }
  }
}
