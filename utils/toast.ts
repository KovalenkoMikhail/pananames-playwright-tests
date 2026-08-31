import { type Page } from '@playwright/test';
import { TIMEOUTS } from './constants';

export function successToast(page: Page) {
  return page.getByText('Success', { exact: true }).first();
}

function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}

export async function waitForToastGone(page: Page): Promise<void> {
  const toast = successToast(page);
  try {
    await toast.waitFor({ state: 'visible', timeout: TIMEOUTS.toastVisible });
  } catch (error) {
    if (isTimeoutError(error)) {
      return;
    }
    throw error;
  }

  const close = page.getByRole('button', { name: /close/i }).first();
  if (await close.isVisible()) {
    await close.click();
  }
  await toast.waitFor({ state: 'hidden', timeout: TIMEOUTS.toastHidden });
}
