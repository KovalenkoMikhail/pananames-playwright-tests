import { type Page } from '@playwright/test';

export async function waitForToastGone(page: Page): Promise<void> {
  const toast = page.getByText(/success/i).first();
  try {
    await toast.waitFor({ state: 'visible', timeout: 5_000 });
    const close = page.getByRole('button', { name: /close/i });
    if (await close.isVisible().catch(() => false)) {
      await close.click();
    }
    await toast.waitFor({ state: 'hidden', timeout: 10_000 });
  } catch {
    // Toast may already be gone or use different copy.
  }
  await page.getByRole('dialog').waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => undefined);
}
