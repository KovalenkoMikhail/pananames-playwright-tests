import { test, expect } from '../fixtures/test';
import type { ContactInput } from '../pages/contacts.page';
import { uniqueContactName, uniqueEmail, uniquePhoneNumber } from '../utils/unique';

test.describe.configure({ timeout: 60_000 });

function buildContact(overrides: Partial<ContactInput> = {}): ContactInput {
  return {
    name: uniqueContactName(),
    firstName: 'Mykhailo',
    lastName: 'QA',
    email: uniqueEmail(),
    phoneNumber: uniquePhoneNumber(),
    comment: 'Playwright test contact',
    promoEmails: false,
    productEmails: true,
    financialEmails: false,
    ...overrides,
  };
}

test.describe('Contacts /contacts', () => {
  test('create a new contact', async ({ contactsPage }) => {
    const contact = buildContact();

    try {
      await contactsPage.goto();
      await contactsPage.openAddForm();
      await contactsPage.fillForm(contact);
      await contactsPage.create();
      await contactsPage.expectRowVisible(contact.name);

      await contactsPage.openEdit(contact.name);
      await contactsPage.expectFormValues(contact);
    } finally {
      await contactsPage.deleteIfExists(contact.name).catch(() => undefined);
    }
  });

  test('edit an existing contact', async ({ contactsPage }) => {
    const contact = buildContact({
      promoEmails: true,
      productEmails: false,
      financialEmails: false,
    });
    const updated = buildContact({
      name: uniqueContactName('QA Edited'),
      firstName: 'Edited',
      lastName: 'Contact',
      promoEmails: false,
      productEmails: true,
      financialEmails: true,
      comment: 'Updated by Playwright',
    });

    try {
      await contactsPage.goto();
      await contactsPage.openAddForm();
      await contactsPage.fillForm(contact);
      await contactsPage.create();
      await contactsPage.expectRowVisible(contact.name);

      await contactsPage.openEdit(contact.name);
      await contactsPage.fillForm(updated);
      await contactsPage.save();

      await contactsPage.goto();
      await contactsPage.expectRowVisible(updated.name);
      await expect(contactsPage.row(contact.name)).toHaveCount(0);

      await contactsPage.openEdit(updated.name);
      await contactsPage.expectFormValues(updated);
    } finally {
      await contactsPage.deleteIfExists(updated.name).catch(() => undefined);
      await contactsPage.deleteIfExists(contact.name).catch(() => undefined);
    }
  });

  test('delete an existing contact', async ({ contactsPage }) => {
    const contact = buildContact();

    try {
      await contactsPage.goto();
      await contactsPage.openAddForm();
      await contactsPage.fillForm(contact);
      await contactsPage.create();
      await contactsPage.expectRowVisible(contact.name);

      await contactsPage.deleteContact(contact.name);
      await expect(contactsPage.row(contact.name)).toHaveCount(0);
      await contactsPage.expectDefaultContactsPresent();
    } finally {
      await contactsPage.deleteIfExists(contact.name).catch(() => undefined);
    }
  });
});
