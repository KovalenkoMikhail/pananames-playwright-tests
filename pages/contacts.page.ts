import { expect, type Locator, type Page } from '@playwright/test';
import { waitForToastGone } from '../utils/toast';

export type ContactInput = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  comment?: string;
  promoEmails: boolean;
  productEmails: boolean;
  financialEmails: boolean;
  phoneCountry?: string;
};

export class ContactsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/contacts');
    await expect(this.page.getByRole('heading', { name: 'Contacts' })).toBeVisible();
    await expect(this.row('Primary')).toBeVisible();
  }

  async openAddForm(): Promise<void> {
    await this.page.getByRole('button', { name: '+ Add New Contact' }).click();
    await expect(this.page).toHaveURL(/\/contacts\/add/);
    await expect(this.page.getByRole('heading', { name: 'Create new contact' })).toBeVisible();
  }

  row(name: string): Locator {
    return this.page.getByRole('row').filter({ hasText: name });
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
    await this.setCheckbox(/promotional emails/i, data.promoEmails);
    await this.setCheckbox(/product emails/i, data.productEmails);
    await this.setCheckbox(/financial emails/i, data.financialEmails);
  }

  async create(): Promise<void> {
    await expect(this.page.getByRole('button', { name: 'Create' })).toBeEnabled();
    await this.page.getByRole('button', { name: 'Create' }).click();
    await expect(this.page).toHaveURL(/\/contacts\/?$/);
    await waitForToastGone(this.page);
  }

  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page).toHaveURL(/\/contacts\/?$/, { timeout: 15_000 });
    await waitForToastGone(this.page);
  }

  async openEdit(name: string): Promise<void> {
    await this.row(name).getByRole('button').first().click();
    await expect(this.page.getByRole('heading', { name: /edit contact/i })).toBeVisible();
    await expect(this.field('Contact type/NAME')).toHaveValue(name);
  }

  async deleteContact(name: string): Promise<void> {
    const row = this.row(name);
    const buttons = row.getByRole('button');
    await buttons.nth(1).click();
    const confirm = this.page.getByRole('button', { name: 'OK' });
    await expect(confirm).toBeVisible();
    await confirm.click();
    await waitForToastGone(this.page);
    await expect(this.row(name)).toHaveCount(0);
  }

  async expectRowVisible(name: string): Promise<void> {
    await expect(this.row(name)).toBeVisible();
  }

  async expectDefaultContactsPresent(): Promise<void> {
    await expect(this.row('Primary')).toBeVisible();
    await expect(this.row('Abuse')).toBeVisible();
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
    await expect(this.checkbox(/promotional emails/i)).toBeChecked({ checked: data.promoEmails });
    await expect(this.checkbox(/product emails/i)).toBeChecked({ checked: data.productEmails });
    await expect(this.checkbox(/financial emails/i)).toBeChecked({ checked: data.financialEmails });
  }

  async deleteIfExists(name: string): Promise<void> {
    await this.goto();
    if ((await this.row(name).count()) === 0) {
      return;
    }
    await this.deleteContact(name);
  }

  private field(label: string): Locator {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page
      .locator('div.relative')
      .filter({ has: this.page.locator('label').filter({ hasText: new RegExp(`^${escaped}$`) }) })
      .locator('input.va-input__content__input');
  }

  private checkbox(name: RegExp): Locator {
    return this.page.getByRole('checkbox', { name });
  }

  private async setCheckbox(name: RegExp, checked: boolean): Promise<void> {
    const box = this.checkbox(name);
    if ((await box.isChecked()) !== checked) {
      await this.page.locator('.va-checkbox').filter({ has: box }).click();
    }
  }

  private async selectPhoneCountry(country: string): Promise<void> {
    const selected = this.page.locator('.country-intl-label-text');
    const current = ((await selected.textContent()) ?? '').trim();
    if (current.toLowerCase().includes(country.toLowerCase())) {
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
