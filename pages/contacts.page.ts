import { expect, type Locator, type Page } from '@playwright/test';
import type { ContactInput } from '../utils/contact';
import { routes, TIMEOUTS } from '../utils/constants';
import { escapeRegExp, urlEndsWith } from '../utils/regexp';
import { waitForToastGone } from '../utils/toast';

export type { ContactInput };

export class ContactsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addButton: Locator;
  readonly createButton: Locator;
  readonly saveButton: Locator;
  readonly confirmDeleteButton: Locator;
  readonly promoEmails: Locator;
  readonly productEmails: Locator;
  readonly financialEmails: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Contacts', exact: true });
    this.addButton = page.getByRole('button', { name: '+ Add New Contact' });
    this.createButton = page.getByRole('button', { name: 'Create' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.confirmDeleteButton = page.getByRole('button', { name: 'OK' });
    this.promoEmails = page.getByRole('checkbox', { name: /promotional emails/i });
    this.productEmails = page.getByRole('checkbox', { name: /product emails/i });
    this.financialEmails = page.getByRole('checkbox', { name: /financial emails/i });
  }

  row(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
  }

  async goto(): Promise<void> {
    await this.page.goto(routes.contacts);
    await expect(this.heading).toBeVisible();
    await expect(this.row('Primary')).toBeVisible();
  }

  async createContact(data: ContactInput): Promise<void> {
    await this.goto();
    await this.addButton.click();
    await expect(this.page).toHaveURL(urlEndsWith(routes.contactsAdd));
    await expect(this.page.getByRole('heading', { name: 'Create new contact' })).toBeVisible();
    await this.fillForm(data);
    await expect(this.createButton).toBeEnabled();
    await this.createButton.click();
    await expect(this.page).toHaveURL(urlEndsWith(routes.contacts));
    await waitForToastGone(this.page);
  }

  async fillForm(data: ContactInput): Promise<void> {
    await this.field('Contact type/NAME').fill(data.name);
    await this.field('First Name').fill(data.firstName);
    await this.field('Last Name').fill(data.lastName);
    await this.field('Email').fill(data.email);
    await this.selectPhoneCountry(data.phoneCountry ?? 'Ukraine');
    await this.field('Phone number').fill(data.phoneNumber);
    if (data.comment !== undefined) {
      await this.field('Comment (optional)').fill(data.comment);
    }
    // Vuestic checkbox overlay intercepts the real input; force reaches the control.
    await this.promoEmails.setChecked(data.promoEmails, { force: true });
    await this.productEmails.setChecked(data.productEmails, { force: true });
    await this.financialEmails.setChecked(data.financialEmails, { force: true });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
    await expect(this.page).toHaveURL(urlEndsWith(routes.contacts), { timeout: TIMEOUTS.save });
    await waitForToastGone(this.page);
  }

  async openEdit(name: string): Promise<void> {
    await this.rowActions(name).first().click();
    await expect(this.page.getByRole('heading', { name: 'Edit contact' })).toBeVisible();
    await expect(this.field('Contact type/NAME')).toHaveValue(name);
  }

  async deleteContact(name: string): Promise<void> {
    await this.rowActions(name).last().click();
    await this.confirmDeleteButton.click();
    await waitForToastGone(this.page);
    await expect(this.row(name)).toHaveCount(0);
  }

  async expectFormValues(data: ContactInput): Promise<void> {
    await expect(this.field('Contact type/NAME')).toHaveValue(data.name);
    await expect(this.field('First Name')).toHaveValue(data.firstName);
    await expect(this.field('Last Name')).toHaveValue(data.lastName);
    await expect(this.field('Email')).toHaveValue(data.email);
    await expect(this.field('Phone number')).toHaveValue(data.phoneNumber);
    if (data.comment !== undefined) {
      await expect(this.field('Comment (optional)')).toHaveValue(data.comment);
    }
    await expect(this.promoEmails).toBeChecked({ checked: data.promoEmails });
    await expect(this.productEmails).toBeChecked({ checked: data.productEmails });
    await expect(this.financialEmails).toBeChecked({ checked: data.financialEmails });
  }

  async expectProtectedContacts(): Promise<void> {
    await expect(this.row('Primary')).toBeVisible();
    await expect(this.row('Abuse')).toBeVisible();
  }

  async deleteIfExists(name: string): Promise<void> {
    if (this.page.isClosed()) {
      return;
    }
    await this.goto();
    if ((await this.row(name).count()) === 0) {
      return;
    }
    await this.deleteContact(name);
  }

  /**
   * Icon buttons have no accessible name. In a contact row the first action is
   * edit and the last is delete.
   */
  private rowActions(name: string): Locator {
    return this.row(name).getByRole('button');
  }

  /**
   * Floating labels are not wired to inputs (`aria-label` is `$t:inputField`),
   * so fields are resolved via the visible label next to the Vuestic input.
   */
  private field(label: string): Locator {
    const escaped = escapeRegExp(label);
    return this.page
      .locator('div.relative')
      .filter({ has: this.page.locator('label').filter({ hasText: new RegExp(`^${escaped}$`) }) })
      .locator('input.va-input__content__input');
  }

  private async selectPhoneCountry(country: string): Promise<void> {
    const selected = ((await this.page.locator('.country-intl-label-text').textContent()) ?? '').trim();
    if (selected.toLowerCase().includes(country.toLowerCase())) {
      return;
    }

    await this.page.locator('.dropdown-flag').click();
    const list = this.page.locator('.vue-country-list');
    await expect(list).toBeVisible();
    await this.page.locator('.country-intl-input').fill(country);
    const option = list.locator('.vue-country-item').filter({ hasText: country }).first();
    await expect(option).toBeVisible();
    await option.click();
  }
}
