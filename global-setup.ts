import { chromium, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { LoginPage } from './pages/login.page';
import { AUTH_FILE } from './utils/constants';
import { requiredEnv } from './utils/env';

export default async function globalSetup(config: FullConfig): Promise<void> {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const email = requiredEnv('MCP_EMAIL');
  const password = requiredEnv('MCP_PASSWORD');
  if (email === 'your-email@example.com' || password === 'your-password') {
    throw new Error(
      'Replace MCP_EMAIL and MCP_PASSWORD in .env with a real MCP account. The .env.example placeholders cannot log in.',
    );
  }

  const baseURL = config.projects[0]?.use.baseURL as string | undefined;
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

