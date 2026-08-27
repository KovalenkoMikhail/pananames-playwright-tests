import { test, expect } from '../fixtures/test';
import { sumPrices } from '../utils/money';
import { uniqueSld } from '../utils/unique';

test.describe('Single domain add to cart', () => {
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ cartPage }) => {
    await cartPage.clear();
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.clear();
  });

  for (const tld of ['.com', '.net', '.org'] as const) {
    test(`search a domain in ${tld} and verify cart TOTAL matches search price`, async ({
      registerDomainPage,
      cartPage,
    }) => {
      const domain = `${uniqueSld()}${tld}`;

      await registerDomainPage.goto();
      await registerDomainPage.search(domain);

      const searchPrice = await registerDomainPage.getDomainPrice(domain);
      await registerDomainPage.addToCart(domain);
      await registerDomainPage.goToCart();
      await cartPage.expectHasItems();

      await cartPage.disableIdProtection();
      const total = await cartPage.getTotal();
      expect(total).toBe(searchPrice);
    });
  }
});

test.describe('Multiple domains add to cart', () => {
  test.describe.configure({ timeout: 120_000 });

  test.beforeEach(async ({ cartPage }) => {
    await cartPage.clear();
  });

  test.afterEach(async ({ cartPage }) => {
    await cartPage.clear();
  });

  test('search SLD without TLD, add 3 available domains, verify cart TOTAL', async ({
    registerDomainPage,
    cartPage,
  }) => {
    const sld = uniqueSld();

    await registerDomainPage.goto();
    await registerDomainPage.search(sld);

    const domains = await registerDomainPage.getAvailableDomains(3);
    const prices: number[] = [];
    for (const domain of domains) {
      prices.push(await registerDomainPage.getDomainPrice(domain));
    }

    for (const domain of domains) {
      await registerDomainPage.addToCart(domain);
    }

    await registerDomainPage.goToCart();
    await cartPage.expectHasItems();
    await cartPage.disableIdProtection();

    const total = await cartPage.getTotal();
    expect(total).toBe(sumPrices(prices));
  });
});
