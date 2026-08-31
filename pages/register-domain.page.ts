import { expect, type Locator } from '@playwright/test';
import { routes, TIMEOUTS } from '../utils/constants';
import { parsePrice } from '../utils/money';
import { successToast, waitForToastGone } from '../utils/toast';
import { BasePage } from './base.page';

export class RegisterDomainPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: /domain availability check and order/i });
  readonly searchInput = this.page.getByPlaceholder('Enter domain name or keyword');
  readonly addToCartButton = this.page.getByRole('button', { name: 'Add to cart' });
  readonly unavailableLabel = this.page.getByText('Domain is not available');
  readonly registrationNoticeAgree = this.page.getByRole('button', { name: /i agree, add domain to cart/i });

  async goto(): Promise<void> {
    await this.page.goto(routes.registerDomain);
    await expect(this.heading).toBeVisible();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.addToCartButton.or(this.unavailableLabel).first().waitFor({ timeout: TIMEOUTS.search });
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
      return parsePrice((await card.innerText()).replace(struckText, ''));
    }
    return parsePrice(await card.innerText());
  }

  async addToCart(domain: string): Promise<void> {
    await this.domainCard(domain).getByRole('button', { name: 'Add to cart' }).click();

    // Some TLDs (.net) open a registration notice; others toast Success immediately.
    await Promise.race([
      this.registrationNoticeAgree.waitFor({ state: 'visible', timeout: TIMEOUTS.notice }),
      successToast(this.page).waitFor({ state: 'visible', timeout: TIMEOUTS.notice }),
    ]);

    if (await this.registrationNoticeAgree.isVisible()) {
      await this.registrationNoticeAgree.click();
      await this.page.getByRole('dialog').waitFor({ state: 'hidden', timeout: TIMEOUTS.notice });
    }

    await waitForToastGone(this.page);
  }

  async getAvailableDomains(limit: number): Promise<string[]> {
    const cards = this.page.getByRole('listitem').filter({ has: this.addToCartButton });
    await expect(cards.first()).toBeVisible({ timeout: TIMEOUTS.search });

    const names: string[] = [];
    const count = await cards.count();
    for (let i = 0; i < count && names.length < limit; i++) {
      const name = await this.readDomainName(cards.nth(i));
      if (name) {
        names.push(name);
      }
    }

    if (names.length < limit) {
      throw new Error(`Expected ${limit} available domains, found ${names.length}`);
    }
    return names;
  }

  private async readDomainName(card: Locator): Promise<string> {
    const text = await card.innerText();
    return text.match(/([a-z0-9-]+\.[a-z][a-z0-9.-]*)/i)?.[1] ?? '';
  }
}
