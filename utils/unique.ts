export function uniqueSuffix(): string {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function uniqueLetters(length = 8): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export function uniqueContactName(prefix = 'QA Auto'): string {
  return `${prefix} ${uniqueLetters(8)}`;
}

export function uniqueEmail(prefix = 'qa.auto'): string {
  return `${prefix}+${uniqueSuffix()}@example.com`;
}

export function uniqueSld(prefix = 'qa'): string {
  return `${prefix}${uniqueSuffix()}`;
}

export function uniquePhoneNumber(): string {
  const suffix = uniqueSuffix().slice(-7).padStart(7, '0');
  return `50${suffix}`.slice(0, 9);
}
