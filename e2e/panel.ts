import type { Page } from '@playwright/test';

export const enum Panel {
  All = 'all',
  Form = 'form',
  Drafts = 'drafts',
  Templates = 'templates',
  Generate = 'ai',
  Configs = 'configs',
}

export async function openPanel(page: Page, panel: Panel): Promise<void> {
  await page.getByTestId(`nav-${panel}`).click();
}
