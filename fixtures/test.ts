import { test as base } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { ContactsPage } from '../pages/contacts.page';
import { RegisterDomainPage } from '../pages/register-domain.page';

type AppFixtures = {
  contactsPage: ContactsPage;
  registerDomainPage: RegisterDomainPage;
  cartPage: CartPage;
};

export const test = base.extend<AppFixtures>({
  contactsPage: async ({ page }, use) => {
    await use(new ContactsPage(page));
  },
  registerDomainPage: async ({ page }, use) => {
    await use(new RegisterDomainPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
