import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authFile = path.join('playwright', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.MCP_EMAIL;
  const password = process.env.MCP_PASSWORD;

  expect(email, 'MCP_EMAIL must be set in .env').toBeTruthy();
  expect(password, 'MCP_PASSWORD must be set in .env').toBeTruthy();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto('/login');
  await page.getByRole('textbox', { name: 'email' }).fill(email!);
  await page.getByRole('textbox', { name: 'password' }).fill(password!);
  await page.locator('form').getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/domains/);

  await page.context().storageState({ path: authFile });
});
