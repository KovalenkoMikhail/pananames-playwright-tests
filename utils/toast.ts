import { type Page } from '@playwright/test';
import { TIMEOUTS } from './constants';

/** Vuestic toast title after create/save/add-to-cart. */
export function successToast(page: Page) {
  return page.getByText('Success', { exact: true }).first();
}

export async function waitForToastGone(page: Page): Promise<void> {
  const toast = successToast(page);
  try {
    await toast.waitFor({ state: 'visible', timeout: TIMEOUTS.toastVisible });
    const close = page.getByRole('button', { name: /close/i }).first();
    if (await close.isVisible()) {
      await close.click();
    }
    await toast.waitFor({ state: 'hidden', timeout: TIMEOUTS.toastHidden });
  } catch (error) {
    if (!(error instanceof Error) || error.name !== 'TimeoutError') {
      throw error;
    }
  }
}
