import { chromium, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LoginPage } from './pages/login.page';
import { AUTH_FILE } from './utils/constants';
import { requiredEnv } from './utils/env';

export default async function globalSetup(config: FullConfig): Promise<void> {
  const project = config.projects[0];
  const baseURL = project?.use.baseURL;
  if (!baseURL) {
    throw new Error('baseURL is missing in playwright.config.ts');
  }

  const email = requiredEnv('MCP_EMAIL');
  const password = requiredEnv('MCP_PASSWORD');

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  try {
    await new LoginPage(page).login(email, password);
    await page.context().storageState({ path: AUTH_FILE });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Login failed. Check MCP_EMAIL and MCP_PASSWORD in .env. ${message}`);
  } finally {
    await browser.close();
  }
}
