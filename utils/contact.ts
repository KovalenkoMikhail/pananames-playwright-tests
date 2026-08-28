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
