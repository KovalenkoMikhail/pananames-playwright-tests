import type { ContactInput } from './contact';
import { uniqueContactName, uniqueEmail, uniquePhoneNumber } from './unique';

export function buildContact(overrides: Partial<ContactInput> = {}): ContactInput {
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

export const CART_TLDS = ['.com', '.net', '.org'] as const;
