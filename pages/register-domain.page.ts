import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../utils/money';
import { waitForToastGone } from '../utils/toast';

export class RegisterDomainPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/register-domain');
    await expect(
      this.page.getByRole('heading', { name: /domain availability check and order/i }),
    ).toBeVisible();
  }

  async search(query: string): Promise<void> {
    const input = this.page.getByPlaceholder('Enter domain name or keyword');
    await input.fill(query);
    await input.press('Enter');
    await this.page
      .getByRole('button', { name: 'Add to cart' })
      .or(this.page.getByText('Domain is not available'))
      .first()
      .waitFor({ timeout: 30_000 });
  }

  domainCard(domain: string): Locator {
    return this.page.getByRole('listitem').filter({
      has: this.page.getByText(domain, { exact: true }),
    });
  }

  async getDomainPrice(domain: string): Promise<number> {
    const card = this.domainCard(domain);
    await expect(card).toBeVisible();
    const struck = card.locator('del');
    if ((await struck.count()) > 0) {
      const struckText = await struck.innerText();
      const rest = (await card.innerText()).replace(struckText, '');
      return parsePrice(rest);
    }
    return parsePrice(await card.innerText());
  }

  async addToCart(domain: string): Promise<void> {
    await this.domainCard(domain).getByRole('button', { name: 'Add to cart' }).click();

    const agree = this.page.getByRole('button', { name: /i agree, add domain to cart/i });
    try {
      await agree.waitFor({ state: 'visible', timeout: 3_000 });
      await agree.click();
      await this.page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 10_000 });
    } catch {
      // Some TLDs (e.g. .com) have no registration notice.
    }

    await waitForToastGone(this.page);
  }

  async getAvailableDomains(limit: number): Promise<string[]> {
    const cards = this.page.getByRole('listitem').filter({
      has: this.page.getByRole('button', { name: 'Add to cart' }),
    });
    await expect(cards.first()).toBeVisible({ timeout: 30_000 });

    const names: string[] = [];
    const count = await cards.count();
    for (let i = 0; i < count && names.length < limit; i++) {
      const card = cards.nth(i);
      if ((await card.getByText('Domain is not available').count()) > 0) {
        continue;
      }
      const name = await this.readDomainName(card);
      if (name) {
        names.push(name);
      }
    }

    if (names.length < limit) {
      throw new Error(`Expected ${limit} available domains, found ${names.length}`);
    }
    return names;
  }

  async goToCart(): Promise<void> {
    await this.page.goto('/cart');
    await expect(
      this.page.getByRole('heading', { name: /shopping cart|cart is empty/i }),
    ).toBeVisible();
  }

  private async readDomainName(card: Locator): Promise<string> {
    const text = await card.innerText();
    const match = text.match(/([a-z0-9-]+\.[a-z][a-z0-9.-]*)/i);
    return match?.[1] ?? '';
  }
}
