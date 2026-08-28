import { test, expect } from '../fixtures/test';
import { buildContact } from '../utils/test-data';
import { uniqueContactName } from '../utils/unique';

test.describe('Contacts /contacts', () => {
  test('create a new contact', async ({ contactsPage, createdContacts }) => {
    const contact = buildContact();
    createdContacts.push(contact.name);

    await test.step('create contact', async () => {
      await contactsPage.createContact(contact);
      await expect(contactsPage.row(contact.name)).toBeVisible();
    });

    await test.step('saved values and checkbox state match the form', async () => {
      await contactsPage.openEdit(contact.name);
      await contactsPage.expectFormValues(contact);
    });
  });

  test('edit an existing contact', async ({ contactsPage, createdContacts }) => {
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
    createdContacts.push(contact.name, updated.name);

    await test.step('create a contact to edit', async () => {
      await contactsPage.createContact(contact);
    });

    await test.step('change fields and checkboxes, then save', async () => {
      await contactsPage.openEdit(contact.name);
      await contactsPage.fillForm(updated);
      await contactsPage.save();
    });

    await test.step('list and form show the updated contact', async () => {
      await contactsPage.goto();
      await expect(contactsPage.row(updated.name)).toBeVisible();
      await expect(contactsPage.row(contact.name)).toHaveCount(0);
      await contactsPage.openEdit(updated.name);
      await contactsPage.expectFormValues(updated);
    });
  });

  test('delete an existing contact', async ({ contactsPage, createdContacts }) => {
    const contact = buildContact();
    createdContacts.push(contact.name);

    await test.step('create a contact to delete', async () => {
      await contactsPage.createContact(contact);
    });

    await test.step('delete it and keep Primary / Abuse', async () => {
      await contactsPage.deleteContact(contact.name);
      await expect(contactsPage.row(contact.name)).toHaveCount(0);
      await contactsPage.expectProtectedContacts();
    });
  });
});
