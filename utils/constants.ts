import path from 'node:path';

export const AUTH_FILE = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');

export const routes = {
  login: '/login',
  domains: '/domains',
  contacts: '/contacts',
  contactsAdd: '/contacts/add',
  registerDomain: '/register-domain',
  cart: '/cart',
} as const;

export const TIMEOUTS = {
  search: 30_000,
  notice: 10_000,
  toastVisible: 5_000,
  toastHidden: 10_000,
  save: 15_000,
} as const;

export const CART_CLEAR_MAX_ITEMS = 15;
