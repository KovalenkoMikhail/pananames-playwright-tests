import { test as base } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { ContactsPage } from '../pages/contacts.page';
import { RegisterDomainPage } from '../pages/register-domain.page';

type CreatedContacts = {
  add: (...names: string[]) => void;
};

type AppFixtures = {
  contactsPage: ContactsPage;
  registerDomainPage: RegisterDomainPage;
  isolatedCart: CartPage;
  createdContacts: CreatedContacts;
};

export const test = base.extend<AppFixtures>({
  contactsPage: async ({ page }, use) => {
    await use(new ContactsPage(page));
  },
  registerDomainPage: async ({ page }, use) => {
    await use(new RegisterDomainPage(page));
  },
  isolatedCart: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await cartPage.clear();
    await use(cartPage);
    await cartPage.clear();
  },
  createdContacts: async ({ contactsPage, page }, use) => {
    const names: string[] = [];
    await use({
      add: (...next) => {
        names.push(...next);
      },
    });
    if (page.isClosed()) {
      return;
    }

    const errors: unknown[] = [];
    for (const name of [...names].reverse()) {
      try {
        await contactsPage.deleteIfExists(name);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors[0]) {
      throw errors[0];
    }
  },
});

export { expect } from '@playwright/test';
