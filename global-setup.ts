import { chromium, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LoginPage } from './pages/login.page';
import { AUTH_FILE } from './utils/constants';
import { requiredEnv } from './utils/env';

export default async function globalSetup(config: FullConfig): Promise<void> {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const baseURL = config.projects[0]?.use.baseURL as string | undefined;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  try {
    await new LoginPage(page).login(requiredEnv('MCP_EMAIL'), requiredEnv('MCP_PASSWORD'));
    await page.context().storageState({ path: AUTH_FILE });
  } finally {
    await browser.close();
  }
}
