import { uniqueContactName, uniqueEmail, uniquePhoneNumber } from './unique';

export type ContactInput = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  phoneCountry: string;
  comment?: string;
  promoEmails: boolean;
  productEmails: boolean;
  financialEmails: boolean;
};

export function buildContact(overrides: Partial<ContactInput> = {}): ContactInput {
  return {
    name: uniqueContactName(),
    firstName: 'Mykhailo',
    lastName: 'QA',
    email: uniqueEmail(),
    phoneNumber: uniquePhoneNumber(),
    phoneCountry: 'Ukraine',
    comment: 'Playwright test contact',
    promoEmails: false,
    productEmails: true,
    financialEmails: false,
    ...overrides,
  };
}

export const CART_TLDS = ['.com', '.net', '.org'] as const;
