import { test } from '../fixtures/test';
import { sumPrices } from '../utils/money';
import { CART_TLDS } from '../utils/test-data';
import { uniqueSld } from '../utils/unique';

test.describe('Register domain / cart', () => {
  test.describe.configure({ timeout: 120_000 });

  for (const tld of CART_TLDS) {
    test(`search a domain in ${tld} and verify cart TOTAL matches search price`, async ({
      registerDomainPage,
      isolatedCart,
    }) => {
      const domain = `${uniqueSld()}${tld}`;
      let searchPrice = 0;

      await test.step(`search ${domain}`, async () => {
        await registerDomainPage.goto();
        await registerDomainPage.search(domain);
        searchPrice = await registerDomainPage.getDomainPrice(domain);
      });

      await test.step('add to cart', async () => {
        await registerDomainPage.addToCart(domain);
      });

      await test.step('cart TOTAL equals the search-card price', async () => {
        await isolatedCart.goto();
        await isolatedCart.expectHasItems();
        await isolatedCart.disableIdProtection();
        await isolatedCart.expectTotal(searchPrice);
      });
    });
  }

  test('search SLD without TLD, add 3 available domains, verify cart TOTAL', async ({
    registerDomainPage,
    isolatedCart,
  }) => {
    let domains: string[] = [];
    const prices: number[] = [];

    await test.step('search SLD only and collect 3 available domains', async () => {
      await registerDomainPage.goto();
      await registerDomainPage.search(uniqueSld());
      domains = await registerDomainPage.getAvailableDomains(3);
      for (const domain of domains) {
        prices.push(await registerDomainPage.getDomainPrice(domain));
      }
    });

    await test.step('add all three to cart', async () => {
      for (const domain of domains) {
        await registerDomainPage.addToCart(domain);
      }
    });

    await test.step('cart TOTAL equals the sum of search prices', async () => {
      await isolatedCart.goto();
      await isolatedCart.expectHasItems();
      await isolatedCart.disableIdProtection();
      await isolatedCart.expectTotal(sumPrices(prices));
    });
  });
});
